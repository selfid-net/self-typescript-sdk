import { Auth } from "../generated/auth_pb";
import { MsgType } from "../generated/msgtype_pb";
import IdentityService from './identity-service';
import Jwt from './jwt';
import { Message } from '../generated/message_pb';
import * as jspb from 'google-protobuf';
import { ACLRule } from './messaging-service';


interface Request {
    data: string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView
    acknowledged?: boolean
    waitForResponse?: boolean
    responded?: boolean
    response?: any
}

export default class Messaging {
    url: string
    jwt: Jwt
    ws: WebSocket
    connected: boolean
    requests: Map<string, Request>

    constructor(url: string, jwt: Jwt) {
        console.log("creating messaging")
        this.jwt = jwt
        this.url = url
        this.requests = new Map()
        this.connected = false

        const WebSocket = require('ws');
        this.ws = new WebSocket('wss://messaging.review.selfid.net/v1/messaging');

        this.ws.onopen = async() => {
            this.connected = true
        };

        this.ws.onclose = () => {
            console.log('disconnected');
        };

        this.ws.onmessage = (input) => {
            let msg = Message.deserializeBinary(input.data)
            console.log(`received ${msg.getId()} (${msg.getType()})`)
            switch(msg.getType()) {
                case MsgType.ERR: {
                    console.log(`error processing ${msg.getId()}`)
                    console.log(msg)
                   break;
                }
                case MsgType.ACK: {
                    console.log(`acknowledged ${msg.getId()}`)
                    this.mark_as_acknowledged(msg.getId())
                    break;
                 }
                 case MsgType.ACL: {
                    console.log(`ACL ${msg.getId()}`)
                    this.processIncommingACL(msg.getId(), msg.getRecipient())
                    break;
                 }
                 case MsgType.MSG: {
                    console.log(`message received ${msg.getId()}`)
                    break;
                 }
                default: {
                   console.log("invalid message")
                   break;
                }
             }
        };

    }


    private processIncommingACL(id: string, msg: string) {
        console.log("processing acl response")
        let list = JSON.parse(msg)
        let req = this.requests.get(id)
        if(!req) {
            console.log("ACL request not found")
            return
        }

        req.response = list
        req.responded = true
        req.acknowledged = true // acls list does not respond with ACK
        this.requests.set(id, req)

        console.log("acl response processed")
    }

    public static async build(url: string, jwt: Jwt): Promise<Messaging> {
        let ms = new Messaging(url, jwt)
        console.log("waiting for connection")
        await ms.wait_for_connection()

        console.log('connected');
        await ms.authenticate()
        console.log('authenticated');

        return ms
    }

    close() {
        this.ws.close()
    }

    private processIncommingMessage() {
        console.log("processing_message")
    }

    private connect() {
        const WebSocket = require('ws');
        this.ws = new WebSocket('wss://messaging.review.selfid.net/v1/messaging');

    }

    private async authenticate() {
        console.log('authenticating');
        let token = this.jwt.authToken()

        const msg = new Auth();
        msg.setType(MsgType.AUTH);
        msg.setId("authentication");
        msg.setToken(token);
        msg.setDevice("1")

        await this.send_and_wait(msg.getId(), {
            data: msg.serializeBinary(),
        });
    }

    async send_and_wait(id: string, request: Request): Promise<Response|boolean> {
        if(!request.acknowledged) {
            request.acknowledged = false
        }
        if(!request.waitForResponse) {
            request.waitForResponse = false
        }
        if(!request.responded) {
            request.responded = false
        }
        this.send(id, request)

        return this.wait(id, request)
    }

    async request(id: string, data: string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView): Promise<Response|boolean> {
        return this.send_and_wait(id, {
            data: data,
            waitForResponse: true,
        })
    }

    private send(id: string, request: Request) {
        this.ws.send(request.data);

        this.requests.set(id, request)
    }

    private async wait(id: string, request: Request): Promise<Response|boolean> {
        // TODO (adriacidre) this methods should manage a waiting timeout.
        console.log("waiting for acknowledgement")
        request.acknowledged = await this.wait_for_ack(id)
        console.log("acknowledged")
        if(!request.waitForResponse) {
            console.log("do not need to wait for response")
            return request.acknowledged
        }
        console.log("waiting for response")

        await this.wait_for_response(id)

        return request.response
    }

    private wait_for_ack(id: string): Promise<boolean> {
        return new Promise(async(resolve, reject) => {
            while(this.requests.has(id)) {
                let req = this.requests.get(id)
                if(req && req.acknowledged) {
                    resolve(true)
                    break
                }
                await this.delay(100)
            }
            resolve(true)
          });
    }

    private wait_for_response(id: string): Promise<Response|undefined> {
        return new Promise(async(resolve, reject) => {
            while(this.requests.has(id)) {
                let req = this.requests.get(id)
                if (req === undefined) {
                    resolve()
                } else if(req.response !== undefined) {
                    resolve(req.response)
                }
                await this.delay(100)
            }
          });
    }

    private wait_for_connection(): Promise<boolean> {
        return new Promise(async(resolve, reject) => {
            while(!this.connected) {
                await this.delay(100)
            }
            resolve(true)
          });
    }

    private mark_as_acknowledged(id: string) {
        let req = this.requests.get(id)
        if(req){
            req.acknowledged = true
            this.requests.set(id, req)
        }
    }


    private delay(ms: number)
    {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

}