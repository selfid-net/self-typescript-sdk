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

import IdentityService from './identity-service'
import Jwt from './jwt'
import Messaging from './messaging'
import Fact from './fact'
import { MsgType } from 'self-protos/msgtype_pb'
import { Message } from 'self-protos/message_pb'
import FactResponse from './fact-response'
import MessagingService from './messaging-service'

type MessageProcessor = (n: number) => any

/**
 * A service to manage fact requests
 */
export default class FactsService {
  DEFAULT_INTERMEDIARY = 'self_intermediary'

  jwt: Jwt
  ms: Messaging
  is: IdentityService
  env: string
  messagingService: MessagingService

  /**
   * The constructor for FactsService
   * @param jwt the Jwt
   * @param ms the Messaging object
   * @param is the IdentityService
   * @param env the environment on what you want to run your app.
   */
  constructor(jwt: Jwt, ms: MessagingService, is: IdentityService, env: string) {
    this.jwt = jwt
    this.ms = ms.ms
    this.messagingService = ms
    this.is = is
    this.env = env
  }

  /**
   * Send a fact request to a specific user
   * @param selfid user identifier to send the fact request.
   * @param facts an array with the facts you're requesting.
   * @param opts optional parameters like conversation id or the expiration time
   */
  async request(
    selfid: string,
    facts: Fact[],
    opts?: { cid?: string; exp?: number; async?: boolean }
  ): Promise<FactResponse | boolean> {
    let options = opts ? opts : {}
    let as = options.async ? options.async : false

    // Check if the current app still has credits
    let app = await this.is.app(this.jwt.appID)
    if (app.paid_actions == false) {
      throw new Error(
        'Your credits have expired, please log in to the developer portal and top up your account.'
      )
    }

    if (as == false) {
      if (!this.messagingService.isPermited(selfid)) {
        throw new Error("You're not permitting connections from " + selfid)
      }
    }

    let id = uuidv4()

    // Get user's device
    let devices = await this.is.devices(selfid)

    let j = this.buildRequest(selfid, facts, opts)
    let ciphertext = this.jwt.prepare(j)

    var msgs = []
    devices.forEach(d => {
      var msg = this.buildEnvelope(id, selfid, d, ciphertext)
      msgs.push(msg.serializeBinary())
    })

    if (as) {
      console.log('sending ' + id)
      let res = this.ms.send(j.cid, { data: msgs, waitForResponse: false })
      return true
    }
    console.log('requesting ' + id)
    let res = await this.ms.request(j.cid, msgs)

    return res
  }

  buildEnvelope(id: string, selfid: string, device: string, ciphertext: string): Message {
    const msg = new Message()
    msg.setType(MsgType.MSG)
    msg.setId(id)
    msg.setSender(`${this.jwt.appID}:${this.jwt.deviceID}`)
    msg.setRecipient(`${selfid}:${device}`)
    msg.setCiphertext(ciphertext)

    return msg
  }

  /**
   * Sends a request via an intermediary
   * @param selfid user identifier to send the fact request.
   * @param facts an array with the facts you're requesting.
   * @param opts optional parameters like conversation id or the expiration time
   * or the selfid of the intermediary you want to use (defaulting to self_intermediary)
   */
  async requestViaIntermediary(
    selfid: string,
    facts: Fact[],
    opts?: { cid?: string; exp?: number; intermediary?: string }
  ) {
    let id = uuidv4()

    // Get intermediary's device
    let options = opts ? opts : {}
    let intermediary = options.intermediary ? options.intermediary : 'self_intermediary'
    let devices = await this.is.devices(intermediary)

    let j = this.buildRequest(selfid, facts, opts)
    let ciphertext = this.jwt.prepare(j)

    // Envelope
    const msg = new Message()
    msg.setType(MsgType.MSG)
    msg.setId(id)
    msg.setSender(`${this.jwt.appID}:${this.jwt.deviceID}`)
    msg.setRecipient(`${intermediary}:${devices[0]}`)
    msg.setCiphertext(ciphertext)

    console.log('requesting ' + j.cid)
    let res = await this.ms.request(j.cid, msg.serializeBinary())

    return res
  }

  /**
   * Subscribes to fact responses `identities.facts.query.resp` and calls
   * the given callback.
   * @param callback procedure to be called when a new facts response is received.
   */
  subscribe(callback: (n: any) => any) {
    this.ms.subscribe('identities.facts.query.resp', callback)
  }

  /**
   * Generates a QR code your users can scan from their app to share facts with your app.
   * @param facts an array with the facts you're requesting.
   * @param opts allows you specify optional parameters like the conversation id <cid>, the selfid or the expiration time.
   */
  generateQR(facts: Fact[], opts?: { selfid?: string; cid?: string; exp?: number }): Buffer {
    let options = opts ? opts : {}
    let selfid = options.selfid ? options.selfid : '-'
    let body = this.jwt.toSignedJson(this.buildRequest(selfid, facts, options))

    let qr = new QRCode()
    qr.setTypeNumber(20)
    qr.setErrorCorrectLevel(ErrorCorrectLevel.L)
    qr.addData(body)
    qr.make()

    let data = qr.toDataURL(5).split(',')
    let buf = Buffer.from(data[1], 'base64')

    return buf
  }

  /**
   * Generates a deep link url so you can request facts with a simple link.
   * @param callback the url you want your users to be sent back after authentication.
   * @param facts an array with the facts you're requesting.
   * @param opts optional parameters like selfid or conversation id
   */
  generateDeepLink(
    callback: string,
    facts: Fact[],
    opts?: { selfid?: string; cid?: string }
  ): string {
    let options = opts ? opts : {}
    let selfid = options.selfid ? options.selfid : '-'
    let body = this.jwt.toSignedJson(this.buildRequest(selfid, facts, options))
    let encodedBody = this.jwt.encode(body)

    if (this.env === '') {
      return `https://joinself.page.link/?link=${callback}%3Fqr=${encodedBody}&apn=com.joinself.app`
    } else if (this.env === 'development') {
      return `https://joinself.page.link/?link=${callback}%3Fqr=${encodedBody}&apn=com.joinself.app.dev`
    }
    return `https://joinself.page.link/?link=${callback}%3Fqr=${encodedBody}&apn=com.joinself.app.${this.env}`
  }

  /**
   * builds an authentication request
   * @param selfid identifier for the user you want to authenticate
   * @param facts an array with the facts you're requesting.
   * @param opts optional parameters like conversation id or the expiration time
   */
  private buildRequest(selfid: string, facts: Fact[], opts?: { cid?: string; exp?: number }): any {
    let options = opts ? opts : {}
    let cid = options.cid ? options.cid : uuidv4()
    let expTimeout = options.exp ? options.exp : 300000

    facts.forEach(f => {
      if (!Fact.isValid(f)) {
        throw new TypeError('invalid facts')
      }
    })

    // Calculate expirations
    let iat = new Date(Math.floor(this.jwt.now()))
    let exp = new Date(Math.floor(this.jwt.now() + expTimeout * 60))

    // Ciphertext
    return {
      typ: 'identities.facts.query.req',
      iss: this.jwt.appID,
      sub: selfid,
      aud: selfid,
      iat: iat.toISOString(),
      exp: exp.toISOString(),
      cid: cid,
      jti: uuidv4(),
      facts: facts
    }
  }
}
