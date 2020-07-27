import { v4 as uuidv4 } from 'uuid'

import Jwt from './jwt'
import IdentityService from '../generated/identity-service'
import Messaging from './messaging'

import { MsgType } from '../generated/msgtype_pb'
import { Message } from '../generated/message_pb'

type MessageProcessor = (n: number) => any

export default class AuthenticationService {
  defaultTimeout = 300 * 100

  jwt: Jwt
  ms: Messaging
  is: IdentityService

  constructor(jwt: Jwt, ms: Messaging, is: IdentityService) {
    this.jwt = jwt
    this.ms = ms
    this.is = is
  }

  async request(
    selfid: string,
    callback?: MessageProcessor,
    opts?: { cid?: string }
  ): Promise<boolean> {
    console.log(`authenticating ${selfid}`)
    let id = uuidv4()
    let options = opts ? opts : {}
    let cid = options.cid ? options.cid : uuidv4()

    // Get user's device
    let devices = await this.is.devices(selfid)

    // Calculate expirations
    let iat = new Date(Math.floor(this.jwt.now()))
    let exp = new Date(Math.floor(this.jwt.now() + 300 * 60))

    // Ciphertext
    let j = {
      typ: 'identities.authenticate.req',
      iss: this.jwt.appID,
      sub: selfid,
      aud: selfid,
      iat: iat.toISOString(),
      exp: exp.toISOString(),
      cid: cid,
      jti: uuidv4()
    }
    let ciphertext = this.jwt.prepare(j)

    // Envelope
    const msg = new Message()
    msg.setType(MsgType.MSG)
    msg.setId(id)
    console.log(` - from : ${this.jwt.appID}:${this.jwt.deviceID}`)
    msg.setSender(`${this.jwt.appID}:${this.jwt.deviceID}`)
    console.log(` - to : ${selfid}:${devices[0]}`)
    msg.setRecipient(`${selfid}:${devices[0]}`)
    msg.setCiphertext(ciphertext)

    console.log('requesting ' + msg.getId())
    let res = await this.ms.request(cid, msg.serializeBinary())

    return res.status === 'accepted'
  }

  generateQR(opts?: { selfid?: string; cid?: string }) {
    return true
  }

  generateDeepLink(callback: MessageProcessor, opts?: { selfid?: string; cid?: string }) {
    return true
  }

  subscribe(callback: MessageProcessor) {
    return true
  }
}
