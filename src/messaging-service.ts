import Jwt from './jwt'
import { v4 as uuidv4 } from 'uuid'

import IdentityService from './identity-service'
import Messaging from './messaging'

import { AccessControlList } from 'self-protos/acl_pb'
import { MsgType } from 'self-protos/msgtype_pb'
import { ACLCommand } from 'self-protos/aclcommand_pb'
import { Message } from 'self-protos/message_pb'

export interface Request {
  [details: string]: any
}

export interface ACLRule {
  [source: string]: Date
}

export default class MessagingService {
  is: IdentityService
  ms: Messaging
  jwt: Jwt

  constructor(jwt: Jwt, ms: Messaging, is: IdentityService) {
    this.jwt = jwt
    this.ms = ms
    this.is = is
  }

  subscribe(type: string, callback: any) {
    this.ms.subscribe(type, callback)
  }

  async permitConnection(selfid: string): Promise<boolean | Response> {
    console.log('permitting connection')
    let someYears = 999 * 365 * 24 * 60 * 60 * 1000
    let exp = new Date(Math.floor(this.jwt.now() + someYears))

    let payload = this.jwt.prepare({
      iss: this.jwt.appID,
      acl_source: selfid,
      acl_exp: exp.toISOString()
    })

    const msg = new AccessControlList()
    msg.setType(MsgType.ACL)
    msg.setId(uuidv4())
    msg.setCommand(ACLCommand.PERMIT)
    msg.setPayload(payload)

    return this.ms.send_and_wait(msg.getId(), { data: msg.serializeBinary() })
  }

  close() {
    this.ms.close()
  }

  async allowedConnections(): Promise<ACLRule[]> {
    console.log('listing allowed connections')
    let connections: ACLRule[] = []

    const msg = new AccessControlList()
    msg.setType(MsgType.ACL)
    msg.setId(uuidv4())
    msg.setCommand(ACLCommand.LIST)

    let res = await this.ms.request(msg.getId(), msg.serializeBinary())
    for (let c of res) {
      connections[c.acl_source] = c.acl_exp
    }

    return connections
  }

  async revokeConnection(selfid: string): Promise<boolean | Response> {
    console.log('revoking connection')

    let payload = this.jwt.prepare({
      iss: this.jwt.appID
    })

    const msg = new AccessControlList()
    msg.setType(MsgType.ACL)
    msg.setId(uuidv4())
    msg.setCommand(ACLCommand.REVOKE)
    msg.setPayload(payload)

    return this.ms.send_and_wait(msg.getId(), { data: msg.serializeBinary() })
  }

  deviceID(): string {
    return '1'
  }

  async send(recipient: string, request: Request): Promise<void> {
    // Calculate expirations
    let iat = new Date(Math.floor(this.jwt.now()))
    let exp = new Date(Math.floor(this.jwt.now() + 300000 * 60))

    request['jti'] = uuidv4()
    request['iss'] = this.jwt.appID
    request['sub'] = recipient
    request['iat'] = iat.toISOString()
    request['exp'] = exp.toISOString()
    request['cid'] = uuidv4()

    const msg = new Message()

    msg.setType(MsgType.MSG)
    msg.setId(uuidv4())
    msg.setSender(`${this.jwt.appID}:${this.jwt.deviceID}`)

    let devices = await this.is.devices(recipient)
    msg.setRecipient(`${recipient}:${devices[0]}`)

    let ciphertext = this.jwt.prepare(request)
    msg.setCiphertext(ciphertext)

    this.ms.send(recipient, { data: msg.serializeBinary() })
  }

  async notify(recipient: string, message: string): Promise<void> {
    await this.send(recipient, {
      typ: 'identities.notify',
      description: message
    })
  }
}
