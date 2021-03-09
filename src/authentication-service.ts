// Copyright 2020 Self Group Ltd. All Rights Reserved.

import { v4 as uuidv4 } from 'uuid'
import {
  QRCode,
  ErrorCorrectLevel,
  QRNumber,
  QRAlphaNum,
  QR8BitByte,
  QRKanji
} from 'qrcode-generator-ts/js'

import Jwt from './jwt'
import IdentityService from './identity-service'
import Messaging from './messaging'

import { MsgType } from 'self-protos/msgtype_pb'
import { Message } from 'self-protos/message_pb'
import MessagingService from './messaging-service'
import Crypto from './crypto'

type MessageProcessor = (n: number) => any

/**
 * Input class to handle authentication requests on self network.
 */
export default class AuthenticationService {
  jwt: Jwt
  ms: Messaging
  is: IdentityService
  env: string
  messagingService: MessagingService
  crypto: Crypto

  /**
   * Constructs the AuthenticationService
   * @param jwt the Jwt
   * @param ms the Messaging object
   * @param is the IdentityService
   * @param env the environment on what you want to run your app.
   */
  constructor(jwt: Jwt, ms: MessagingService, is: IdentityService, ec: Crypto, env: string) {
    this.jwt = jwt
    this.ms = ms.ms
    this.is = is
    this.env = env
    this.messagingService = ms
    this.crypto = ec
  }

  /**
   * Sends an authentication request to the given Selfid
   * @param selfid the identifier for the identity you want to authenticate
   * @param opts allows you specify optional parameters like the conversation id <cid> or async
   */
  async request(
    selfid: string,
    opts?: { cid?: string; async?: boolean }
  ): Promise<boolean | string> {
    let options = opts ? opts : {}
    let as = options.async ? options.async : false

    let app = await this.is.app(this.jwt.appID)
    if (app.paid_actions == false) {
      throw new Error(
        'Your credits have expired, please log in to the developer portal and top up your account.'
      )
    }

    if (as == false) {
      let permited = await this.messagingService.isPermited(selfid)
      if (!permited) {
        throw new Error("You're not permitting connections from " + selfid)
      }
    }

    let id = uuidv4()

    // Get user's device
    let devices = await this.is.devices(selfid)

    let j = this.buildRequest(selfid, opts)
    let ciphertext = this.jwt.toSignedJson(j)

    var msgs = []
    for (var i = 0; i < devices.length; i++) {
      var msg = await this.buildEnvelope(id, selfid, devices[i], ciphertext)
      msgs.push(msg.serializeBinary())
    }

    if (as) {
      console.log('sending ' + id)
      let res = this.ms.send(j.cid, { data: msgs, waitForResponse: false })
      return true
    }

    console.log('requesting ' + id)
    let res = await this.ms.request(j.cid, msgs)

    return res.status === 'accepted'
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
    msg.setCiphertext(Buffer.from(ct))

    return msg
  }

  /**
   * Generates a QR code your users can scan from their app to authenticate
   * @param opts allows you specify optional parameters like the conversation id <cid> or the selfid
   */
  generateQR(opts?: { selfid?: string; cid?: string }): Buffer {
    let options = opts ? opts : {}
    let selfid = options.selfid ? options.selfid : '-'
    let body = this.jwt.toSignedJson(this.buildRequest(selfid, options))

    let qr = new QRCode()
    qr.setTypeNumber(17)
    qr.setErrorCorrectLevel(ErrorCorrectLevel.L)
    qr.addData(body)
    qr.make()

    let data = qr.toDataURL(5).split(',')
    let buf = Buffer.from(data[1], 'base64')

    return buf
  }

  /**
   * Generates a deep link url so you can authenticate your users with a simple link.
   * @param callback the url you want your users to be sent back after authentication.
   * @param opts optional parameters like selfid or conversation id
   */
  generateDeepLink(callback: string, opts?: { selfid?: string; cid?: string }): string {
    let options = opts ? opts : {}
    let selfid = options.selfid ? options.selfid : '-'
    let body = this.jwt.toSignedJson(this.buildRequest(selfid, options))
    let encodedBody = this.jwt.encode(body)

    if (this.env === '') {
      return `https://joinself.page.link/?link=${callback}%3Fqr=${encodedBody}&apn=com.joinself.app`
    } else if (this.env === 'development') {
      return `https://joinself.page.link/?link=${callback}%3Fqr=${encodedBody}&apn=com.joinself.app.dev`
    }
    return `https://joinself.page.link/?link=${callback}%3Fqr=${encodedBody}&apn=com.joinself.app.${this.env}`
  }

  /**
   * Subscribes to authentication response `identities.authenticate.resp` and calls
   * the given callback.
   * @param callback procedure to be called when a new auth response is received.
   */
  subscribe(callback: (n: any) => any) {
    this.ms.subscribe('identities.authenticate.resp', callback)
  }

  /**
   * builds an authentication request
   * @param selfid identifier for the user you want to authenticate
   * @param opts optional parameters like conversation id or the expiration time
   */
  private buildRequest(selfid: string, opts?: { cid?: string; exp?: number }): any {
    let options = opts ? opts : {}
    let cid = options.cid ? options.cid : uuidv4()
    let expTimeout = options.exp ? options.exp : 300

    // Calculate expirations
    let iat = new Date(Math.floor(this.jwt.now()))
    let exp = new Date(Math.floor(this.jwt.now() + expTimeout * 60))

    // Ciphertext
    return {
      typ: 'identities.authenticate.req',
      iss: this.jwt.appID,
      sub: selfid,
      aud: selfid,
      iat: iat.toISOString(),
      exp: exp.toISOString(),
      cid: cid,
      jti: uuidv4()
    }
  }
}
