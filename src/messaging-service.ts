import Jwt from './jwt'
import { v4 as uuidv4 } from 'uuid'

import IdentityService from './identity-service'
import Messaging from './messaging'

import { AccessControlList } from '../generated/acl_pb'
import { MsgType } from '../generated/msgtype_pb'
import { ACLCommand } from '../generated/aclcommand_pb'

export interface Request {
  [details: string]: any
}

export interface ACLRule {
  [source: string]: Date
}

export default class MessagingService {
  is: IdentityService
  ms: any
  jwt: Jwt

  constructor(jwt: Jwt, is: IdentityService, ms: Messaging) {
    this.jwt = jwt
    this.is = is
    this.ms = ms
  }

  subscribe(type: string, callback: any) {
    return true
  }

  async permitConnection(selfid: string): Promise<boolean> {
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

  async revokeConnection(selfid: string): Promise<boolean> {
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

  send(recipient: string, request: Request): boolean {
    return true
  }

  notify(recipient: string, message: string): boolean {
    return true
  }
}
