// Copyright 2020 Self Group Ltd. All Rights Reserved.

import Jwt from './jwt'
import IdentityService from './identity-service'

import { Auth } from 'self-protos/auth_pb'
import { MsgType } from 'self-protos/msgtype_pb'
import { Message } from 'self-protos/message_pb'
import Crypto from './crypto'
import FactResponse from './fact-response'

import * as fs from 'fs'
import { openStdin } from 'process'
import { v4 as uuidv4 } from 'uuid'
import { Identity, App } from './identity-service'
import { logging, Logger } from './logging'

const defaultRequestTimeout = 120000

export interface Request {
  data: string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView | Array<string>
  uuid?: string
  acknowledged?: boolean
  waitForResponse?: boolean
  responded?: boolean
  response?: any
  timeout?: number
}

export default class Messaging {
  url: string
  jwt: Jwt
  ws: WebSocket
  connected: boolean
  requests: Map<string, Request>
  callbacks: Map<string, (n: any) => any>
  is: IdentityService
  offsetPath: string
  storageDir: string
  encryptionClient: Crypto
  logger: Logger

  constructor(
    url: string,
    jwt: Jwt,
    is: IdentityService,
    ec: Crypto,
    opts?: { storageDir?: string }
  ) {
    this.jwt = jwt
    this.url = url
    this.requests = new Map()
    this.callbacks = new Map()
    this.connected = false
    this.is = is
    this.encryptionClient = ec
    this.offsetPath = `${process.cwd()}/.self_storage`
    if (opts) {
      if ('storageDir' in opts) {
        this.offsetPath = opts.storageDir
      }
    }
    this.offsetPath = `${this.offsetPath}/${this.jwt.appID}:${this.jwt.deviceID}.offset`
    this.logger = logging.getLogger('core.self-sdk')

    if (this.url !== '') {
      this.connect()
    }
  }

  public static async build(
    url: string,
    jwt: Jwt,
    is: IdentityService,
    ec: Crypto,
    opts?: { storageDir?: string }
  ): Promise<Messaging> {
    let ms = new Messaging(url, jwt, is, ec, opts)

    await ms.setup()

    return ms
  }

  private async setup() {
    this.logger.debug('setting up messaging')
    await this.wait_for_connection()
    await this.authenticate()
  }

  private async processIncommingMessage(input: string, offset: number, sender: string) {
    try {
      let ciphertext = Buffer.from(input, 'base64').toString()
      let issuer = sender.split(':')

      let plaintext = await this.encryptionClient.decrypt(ciphertext, issuer[0], issuer[1])
      let payload = JSON.parse(plaintext)

      const decode = (str: string): string => Buffer.from(str, 'base64').toString('binary')
      let header = JSON.parse(decode(payload['protected']))
      let k = await this.is.publicKey(issuer[0], header['kid'])

      if (!this.jwt.verify(payload, k)) {
        this.logger.info(`received unverified message ${payload.cid}`)
        return
      }

      this.setOffset(offset)
      let p = JSON.parse(decode(payload['payload']))
      switch (p.typ) {
        case 'identities.facts.query.resp': {
          await this.processResponse(p, 'identities.facts.query.resp')
          break
        }
        case 'identities.authenticate.resp': {
          await this.processResponse(p, 'identities.authenticate.resp')
          break
        }
        default: {
          if (this.callbacks.has(p.typ)) {
            let fn = this.callbacks.get(p.typ)
            fn(p)
          }
          break
        }
      }
    } catch (error) {
      this.logger.info(`skipping message due ${error}`)
    }
  }

  private async processResponse(payload: any, typ: string) {
    let res = await this.buildResponse(payload)

    if (this.requests.has(payload.cid)) {
      let r = this.requests.get(payload.cid)
      r.response = res
      r.responded = true
      this.requests.set(payload.cid, r)
    } else if (this.callbacks.has(typ)) {
      let fn = this.callbacks.get(typ)
      fn(res)
    }
  }

  private async buildResponse(payload: any): Promise<any> {
    if (payload.typ === 'identities.facts.query.resp') {
      return FactResponse.parse(payload, this.jwt, this.is)
    }
    return payload
  }

  private processIncommingACL(id: string, msg: string) {
    let list = JSON.parse(msg)
    let req = this.requests.get(id)
    if (!req) {
      console.debug(`ACL request not found ${id}`)
      return
    }

    req.response = list
    req.responded = true
    req.acknowledged = true // acls list does not respond with ACK
    this.requests.set(id, req)
  }

  close() {
    if (this.connected) {
      this.ws.close()
    }
  }

  private async onmessage(msg: Message) {
    this.logger.debug(`received ${msg.getId()} (${msg.getType()})`)
    switch (msg.getType()) {
      case MsgType.ERR: {
        let ma = msg.toArray()
        // this.logger.warn(`error processing ${msg.getId()} ${ma[ma.length - 1]}`)
        let sw = 0
        Array.from(this.requests.keys()).forEach(key => {
          if (this.requests.get(key).uuid == msg.getId()) {
            let r = this.requests.get(key)
            r.response = { errorMessage: ma[ma.length - 1] }
            r.acknowledged = true
            r.responded = true
            this.requests.set(key, r)
            sw = 1
          }
        })

        if (sw == 1) {
          break
        }

        Array.from(this.callbacks.keys()).forEach(key => {
          if (this.callbacks[key].uuid == msg.getId()) {
            let fn = this.callbacks[key]
            fn(undefined)
          }
        })
        break
      }
      case MsgType.ACK: {
        this.logger.debug(`acknowledged ${msg.getId()}`)
        this.mark_as_acknowledged(msg.getId())
        break
      }
      case MsgType.ACL: {
        this.logger.debug(`ACL ${msg.getId()}`)
        this.processIncommingACL(msg.getId(), msg.getRecipient())
        break
      }
      case MsgType.MSG: {
        this.logger.debug(`message received ${msg.getId()}`)
        await this.processIncommingMessage(
          msg.getCiphertext_asB64(),
          msg.getOffset(),
          msg.getSender()
        )
        break
      }
    }
  }

  /* istanbul ignore next */
  private connect() {
    this.logger.debug(`configuring websockets`)
    if (this.ws === undefined) {
      const WebSocket = require('ws')
      this.ws = new WebSocket(this.url)
    }

    this.ws.onopen = () => {
      this.connected = true
    }

    this.ws.onclose = () => {
      this.connected = false
    }

    this.ws.onmessage = async input => {
      let msg = Message.deserializeBinary(input.data)
      await this.onmessage(msg)
    }
  }

  private async authenticate() {
    let token = this.jwt.authToken()

    const msg = new Auth()
    msg.setType(MsgType.AUTH)
    msg.setId(uuidv4())
    msg.setToken(token)
    msg.setOffset(this.getOffset())
    msg.setDevice(this.jwt.deviceID)

    await this.send_and_wait(msg.getId(), {
      data: msg.serializeBinary(),
      uuid: msg.getId()
    })
  }

  async send_and_wait(id: string, request: Request): Promise<Response | boolean> {
    if (!request.acknowledged) {
      request.acknowledged = false
    }
    if (!request.waitForResponse) {
      request.waitForResponse = false
    }
    if (!request.responded) {
      request.responded = false
    }
    if (!request.timeout) {
      request.timeout = Date.now() + defaultRequestTimeout
    }

    this.send(id, request)
    return this.wait(id, request)
  }

  async request(
    id: string,
    uuid: string,
    data: string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView | Array<string>
  ): Promise<any> {
    return this.send_and_wait(id, {
      data: data,
      uuid: uuid,
      waitForResponse: true
    })
  }

  send(id: string, request: Request) {
    if (!Array.isArray(request.data)) {
      this.ws.send(request.data)
    } else {
      for (var i = 0; i < request.data.length; i++) {
        this.ws.send(request.data[i])
      }
    }

    this.requests.set(id, request)
  }

  private async wait(id: string, request: Request): Promise<Response | boolean> {
    // TODO (adriacidre) this methods should manage a waiting timeout.
    // TODO () ACK is based on JTI while Response on CID!!!!
    if (!request.waitForResponse) {
      this.logger.debug(`waiting for acknowledgement`)
      request.acknowledged = await this.wait_for_ack(id)
      this.logger.debug(`do not need to wait for response`)
      return request.acknowledged
    }
    this.logger.debug(`waiting for response ${id}`)
    await this.wait_for_response(id)
    if (request.response) {
      this.logger.debug(`response received`)
    }

    return request.response
  }

  private wait_for_ack(id: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      while (this.requests.has(id)) {
        let req = this.requests.get(id)
        if (req && req.acknowledged) {
          resolve(true)
          break
        }
        await this.delay(100)
      }
      resolve(true)
    })
  }

  private wait_for_response(id: string): Promise<Response | undefined> {
    this.logger.debug(`waiting for response ${id}`)
    return new Promise(async (resolve, reject) => {
      while (this.requests.has(id)) {
        let req = this.requests.get(id)
        if (req && req.timeout <= Date.now()) {
          resolve(undefined)
          break
        }
        if (req && req.response) {
          resolve(req.response)
          break
        }
        await this.delay(100)
      }
      resolve(undefined)
    })
  }

  private wait_for_connection(): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      while (!this.connected) {
        await this.delay(100)
      }
      resolve(true)
    })
  }

  private mark_as_acknowledged(id: string) {
    let req = this.requests.get(id)
    if (req) {
      req.acknowledged = true
      this.requests.set(id, req)
    }
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  subscribe(messageType: string, callback: (n: any) => any) {
    this.callbacks.set(messageType, callback)
  }

  private getOffset(): number {
    try {
      let offset = fs.readFileSync(this.offsetPath, { flag: 'r' })
      return parseInt(offset.toString(), 10)
    } catch (error) {
      return 0
    }
  }

  private setOffset(offset: number) {
    fs.writeFileSync(this.offsetPath, offset.toString(), { flag: 'w' })
  }
}
