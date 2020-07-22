import IdentityService from './identity-service';
import Messaging from './messaging';
import Jwt from './jwt';
import { AccessControlList } from '../generated/acl_pb';
import { MsgType } from '../generated/msgtype_pb';
import { v4 as uuidv4 } from 'uuid';
import { ACLCommand } from '../generated/aclcommand_pb';

export interface Request {
    [details: string] : any;
}

export interface ACLRule {
    [source: string] : Date;
}

export default class MessagingService {
    is: IdentityService
    ms: any

    constructor(url: string, jwt: Jwt, is: IdentityService){
        this.is = is
    }

    public static async build(url: string, jwt: Jwt, is: IdentityService): Promise<MessagingService> {
        let m = new MessagingService(url, jwt, is)
        m.ms = await Messaging.build(url, jwt)

        return m
    }

    subscribe(type: string, callback: any) {
        return true
    }

    async permitConnection(selfid: string): Promise<boolean> {
        console.log("permitting connection")
        let anHour = 60*60*1000
        let exp = new Date(Math.floor((this.is.jwt.now() + anHour)));

        let payload = this.is.jwt.prepare({
           iss: this.is.jwt.appID,
           acl_source: selfid,
           acl_exp: exp.toISOString(),
       })

        const msg = new AccessControlList();
        msg.setType(MsgType.ACL)
        msg.setId(uuidv4())
        msg.setCommand(ACLCommand.PERMIT)
        msg.setPayload(payload)

        return this.ms.send_and_wait(msg.getId(), { data: msg.serializeBinary() })
   }

   close() {
       this.ms.close()
   }

    async allowedConnections(): Promise<ACLRule[]>{
        console.log("listing allowed connections")
        let connections:ACLRule[] = [];

        const msg = new AccessControlList();
        msg.setType(MsgType.ACL);
        msg.setId(uuidv4());
        msg.setCommand(ACLCommand.LIST);

        let res = await this.ms.request(msg.getId(), msg.serializeBinary())
        for (let c of res) {
            connections[c.acl_source] = c.acl_exp
        }

        return connections;
    }

    async revokeConnection(selfid: string): Promise<boolean> {
        console.log("permitting connection")
        let anHour = 60*60*1000
        let exp = new Date(Math.floor((this.is.jwt.now() + anHour)));

        let payload = this.is.jwt.prepare({
            iss: this.is.jwt.appID,
            acl_source: selfid,
        })

        const msg = new AccessControlList();
        msg.setType(MsgType.ACL)
        msg.setId(uuidv4())
        msg.setCommand(ACLCommand.REVOKE)
        msg.setPayload(payload)

        return this.ms.send_and_wait(msg.getId(), { data: msg.serializeBinary() })
    }

    deviceID(): string {
        return "1"
    }

    send(recipient: string, request: Request): boolean{
        return true
    }

    notify(recipient: string, message: string): boolean {
        return true
    }
}