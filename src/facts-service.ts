import { v4 as uuidv4 } from 'uuid'

import IdentityService from './identity-service'
import Jwt from './jwt'
import Messaging from './messaging'
import Fact from './fact'
import { MsgType } from '../generated/msgtype_pb'
import { Message } from '../generated/message_pb'
import FactResponse from './fact-response'

type MessageProcessor = (n: number) => any

export default class FactsService {
  DEFAULT_INTERMEDIARY = 'self_intermediary'

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

  async request(
    selfid: string,
    facts: Fact[],
    callback?: MessageProcessor,
    opts?: { cid?: string; exp_timeout?: BigInteger }
  ): Promise<FactResponse> {
    let id = uuidv4()

    // Get user's device
    let devices = await this.is.devices(selfid)

    let j = this.buildRequest(selfid, facts, opts)
    let ciphertext = this.jwt.prepare(j)

    // Envelope
    const msg = new Message()
    msg.setType(MsgType.MSG)
    msg.setId(id)
    msg.setSender(`${this.jwt.appID}:${this.jwt.deviceID}`)
    msg.setRecipient(`${selfid}:${devices[0]}`)
    msg.setCiphertext(ciphertext)

    console.log('requesting ' + j.cid)
    let res = await this.ms.request(j.cid, msg.serializeBinary())

    return res
  }

  requestViaIntermediary(
    selfid: string,
    facts: Fact[],
    callback: MessageProcessor,
    opts?: { cid?: string; exp_timeout?: BigInteger }
  ) {
    return true
  }

  subscribe(callback: MessageProcessor) {
    return true
  }

  generateQR(facts: Fact[], opts?: { selfid?: string; cid?: string }) {
    return true
  }

  generateDeepLink(
    facts: Fact[],
    callback: MessageProcessor,
    opts?: { selfid?: string; cid?: string }
  ) {
    return true
  }

  private buildRequest(selfid: string, facts: Fact[], opts?: { cid?: string; exp?: number }): any {
    let options = opts ? opts : {}
    let cid = options.cid ? options.cid : uuidv4()
    let expTimeout = options.exp ? options.exp : 300000

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
