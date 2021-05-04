// Copyright 2020 Self Group Ltd. All Rights Reserved.

import Jwt from './jwt'
import { v4 as uuidv4 } from 'uuid'

import IdentityService from './identity-service'
import Messaging from './messaging'

import { AccessControlList } from 'self-protos/acl_pb'
import { MsgType } from 'self-protos/msgtype_pb'
import { ACLCommand } from 'self-protos/aclcommand_pb'
import { Message } from 'self-protos/message_pb'
import Crypto from './crypto'
import { logging, Logger } from './logging'

const logger = logging.getLogger('core.self-sdk')

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
  crypto: Crypto

  /**
   * constructs a MessagingService
   * @param jwt a Jwt object
   * @param ms a Messaging object
   * @param is an IdentityService object
   */
  constructor(jwt: Jwt, ms: Messaging, is: IdentityService, ec: Crypto) {
    this.jwt = jwt
    this.ms = ms
    this.is = is
    this.crypto = ec
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
    logger.debug('permitting connection')
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
    logger.debug('listing allowed connections')
    let connections: ACLRule[] = []

    const msg = new AccessControlList()
    msg.setType(MsgType.ACL)
    msg.setId(uuidv4())
    msg.setCommand(ACLCommand.LIST)

    let res = await this.ms.request(msg.getId(), msg.getId(), msg.serializeBinary())

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
    logger.debug('revoking connection')

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
    // Check if the current app still has credits
    if (this.jwt.checkPaidActions) {
      let app = await this.is.app(this.jwt.appID)
      if (app.paid_actions == false) {
        throw new Error(
          'Your credits have expired, please log in to the developer portal and top up your account.'
        )
      }
    }

    let id = uuidv4()

    let j = this.buildRequest(recipient, request)
    let ciphertext = this.jwt.toSignedJson(j)

    var msgs = []

    // Send the message to all recipient devices.
    let devices = await this.is.devices(recipient)
    for (var i = 0; i < devices.length; i++) {
      var msg = await this.buildEnvelope(id, recipient, devices[i], ciphertext)
      msgs.push(msg.serializeBinary())
    }

    // Send the message also to all current identity devices for synchronization.
    let currentIdentityDevices = await this.is.devices(this.jwt.appID)
    for (var i = 0; i < currentIdentityDevices.length; i++) {
      if (currentIdentityDevices[i] != this.jwt.deviceID) {
        var msg = await this.buildEnvelope(id, this.jwt.appID, currentIdentityDevices[i], ciphertext)
        msgs.push(msg.serializeBinary())
      }
    }

    this.ms.send(j.cid, { data: msgs, waitForResponse: false })
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

  private buildRequest(selfid: string, request: Request): Request {
    // Calculate expirations
    let iat = new Date(Math.floor(this.jwt.now()))
    let exp = new Date(Math.floor(this.jwt.now() + 300000 * 60))

    request['jti'] = uuidv4()
    request['iss'] = this.jwt.appID
    request['sub'] = selfid
    request['iat'] = iat.toISOString()
    request['exp'] = exp.toISOString()
    request['cid'] = uuidv4()

    return request
  }

  async buildEnvelope(
    id: string,
    selfid: string,
    device: string,
    ciphertext: string
  ): Promise<Message> {
    const msg = new Message()
    msg.setType(MsgType.MSG)
    msg.setId(id)
    msg.setSender(`${this.jwt.appID}:${this.jwt.deviceID}`)
    msg.setRecipient(`${selfid}:${device}`)
    let ct = await this.crypto.encrypt(ciphertext, selfid, device)
    msg.setCiphertext(this.fixEncryption(ct))

    return msg
  }

  fixEncryption(msg: string): any {
    return Buffer.from(msg)
  }
}
