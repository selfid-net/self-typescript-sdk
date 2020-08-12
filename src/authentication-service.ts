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

type MessageProcessor = (n: number) => any

export default class AuthenticationService {
  defaultTimeout = 300 * 100

  jwt: Jwt
  ms: Messaging
  is: IdentityService
  env: string

  constructor(jwt: Jwt, ms: Messaging, is: IdentityService, env: string) {
    this.jwt = jwt
    this.ms = ms
    this.is = is
    this.env = env
  }

  async request(selfid: string, opts?: { cid?: string }): Promise<boolean | string> {
    let id = uuidv4()

    // Get user's device
    let devices = await this.is.devices(selfid)

    let j = this.buildRequest(selfid, opts)
    let ciphertext = this.jwt.prepare(j)

    // Envelope
    const msg = new Message()
    msg.setType(MsgType.MSG)
    msg.setId(id)
    msg.setSender(`${this.jwt.appID}:${this.jwt.deviceID}`)
    msg.setRecipient(`${selfid}:${devices[0]}`)
    msg.setCiphertext(ciphertext)

    console.log('requesting ' + msg.getId())
    let res = await this.ms.request(j.cid, msg.serializeBinary())

    return res.status === 'accepted'
  }

  generateQR(opts?: { selfid?: string; cid?: string }): Buffer {
    let options = opts ? opts : {}
    let selfid = options.selfid ? options.selfid : '-'
    let body = this.jwt.toSignedJson(this.buildRequest(selfid, options))

    let qr = new QRCode()
    qr.setTypeNumber(15)
    qr.setErrorCorrectLevel(ErrorCorrectLevel.L)
    qr.addData(body)
    qr.make()

    let data = qr.toDataURL(5).split(',')
    let buf = Buffer.from(data[1], 'base64')

    return buf
  }

  generateDeepLink(callback: string, opts?: { selfid?: string; cid?: string }): string {
    let options = opts ? opts : {}
    let selfid = options.selfid ? options.selfid : '-'
    let body = this.jwt.toSignedJson(this.buildRequest(selfid, options))
    let encodedBody = this.jwt.encode(body)

    if (this.env === '') {
      return `https://selfid.page.link/?link=${callback}%3Fqr=${encodedBody}&apn=net.selfid.app`
    } else if (this.env === 'development') {
      return `https://selfid.page.link/?link=${callback}%3Fqr=${encodedBody}&apn=net.selfid.app.dev`
    }
    return `https://selfid.page.link/?link=${callback}%3Fqr=${encodedBody}&apn=net.selfid.app.${this.env}`
  }

  subscribe(callback: (n: any) => any) {
    this.ms.subscribe('identities.authenticate.resp', callback)
  }

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
