// Copyright 2020 Self Group Ltd. All Rights Reserved.

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

/**
 * Service to manage interactions with self messaging services
 */
export default class MessagingService {
  is: IdentityService
  ms: Messaging
  jwt: Jwt

  /**
   * constructs a MessagingService
   * @param jwt a Jwt object
   * @param ms a Messaging object
   * @param is an IdentityService object
   */
  constructor(jwt: Jwt, ms: Messaging, is: IdentityService) {
    this.jwt = jwt
    this.ms = ms
    this.is = is
  }

  /**
   * Subscribes to any message type and executes the callback when received.
   * @param callback procedure to be called when a new message is received.
   */
  subscribe(type: string, callback: any) {
    this.ms.subscribe(type, callback)
  }

  /**
   * Allows incomming messages from the specified identity.
   * @param selfid The identifier for the identity (user or app) to be permitted.
   * Use `*` to permit all.
   * @returns a response
   */
  async permitConnection(selfid: string): Promise<boolean | Response> {
    console.log('permitting connection')
    let someYears = 999 * 365 * 24 * 60 * 60 * 1000

    let payload = this.jwt.prepare({
      jti: uuidv4(),
      cid: uuidv4(),
      typ: 'acl.permit',
      iss: this.jwt.appID,
      sub: this.jwt.appID,
      iat: new Date(Math.floor(this.jwt.now())).toISOString(),
      exp: new Date(Math.floor(this.jwt.now() + 1 * 60)).toISOString(),
      acl_source: selfid,
      acl_exp: new Date(Math.floor(this.jwt.now() + someYears)).toISOString()
    })

    const msg = new AccessControlList()
    msg.setType(MsgType.ACL)
    msg.setId(uuidv4())
    msg.setCommand(ACLCommand.PERMIT)
    msg.setPayload(payload)

    return this.ms.send_and_wait(msg.getId(), { data: msg.serializeBinary() })
  }

  /**
   * closes the websocket connection.
   */
  close() {
    this.ms.close()
  }

  /**
   * Lists the current connections of your app.
   * @returns a list of ACL rules
   */
  async allowedConnections(): Promise<String[]> {
    console.log('listing allowed connections')
    let connections: ACLRule[] = []

    const msg = new AccessControlList()
    msg.setType(MsgType.ACL)
    msg.setId(uuidv4())
    msg.setCommand(ACLCommand.LIST)

    let res = await this.ms.request(msg.getId(), msg.serializeBinary())

    return res
  }

  /**
   * Checks if the current app is allowing incoming messages from the given id.
   * @param id the self identifier to be checked
   */
  async isPermited(id: string): Promise<Boolean> {
    let ac = await this.allowedConnections()
    if (ac.includes('*')) {
      return true
    }

    if (ac.includes(id)) {
      return true
    }

    return false
  }

  /**
   * Revokes messages from the given identity
   * @param selfid identity to revoke
   * @returns Response
   */
  async revokeConnection(selfid: string): Promise<boolean | Response> {
    console.log('revoking connection')

    let payload = this.jwt.prepare({
      iss: this.jwt.appID,
      sub: this.jwt.appID,
      iat: new Date(Math.floor(this.jwt.now())).toISOString(),
      exp: new Date(Math.floor(this.jwt.now() + 1 * 60)).toISOString(),
      acl_source: selfid,
      jti: uuidv4(),
      cid: uuidv4(),
      typ: 'acl.revoke'
    })

    const msg = new AccessControlList()
    msg.setType(MsgType.ACL)
    msg.setId(uuidv4())
    msg.setCommand(ACLCommand.REVOKE)
    msg.setPayload(payload)

    return this.ms.send_and_wait(msg.getId(), { data: msg.serializeBinary() })
  }

  /**
   * Gets the deviceID for your app
   */
  deviceID(): string {
    return '1'
  }

  /**
   * Sends a raw message
   * @param recipient the recipient's identifier.
   * @param request the request to be sent.
   */
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

  /**
   * Sends a notification message
   * @param recipient the recipient's identifier.
   * @param message the message to be sent.
   */
  async notify(recipient: string, message: string): Promise<void> {
    await this.send(recipient, {
      typ: 'identities.notify',
      description: message
    })
  }
}
