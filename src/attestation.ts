import Jwt from './jwt'
import IdentityService from './identity-service'
import { JwtInput } from './jwt'

export default class Attestation {
  origin: string
  to: string
  aud: string
  iss: string
  source: string
  verified: boolean
  sub: string
  expected_value: string
  operator: string
  factName: string
  value: string

  public static async parse(
    name: string,
    input: JwtInput,
    jwt: Jwt,
    is: IdentityService
  ): Promise<any> {
    let payload = JSON.parse(Buffer.from(input.payload, 'base64').toString())
    let pks = await is.publicKeys(payload.iss)

    let a = new Attestation()

    a.to = payload.sub
    a.origin = payload.iss
    a.aud = payload.aud
    a.source = payload.source
    a.expected_value = payload.expected_value
    a.operator = payload.operator
    a.factName = name
    a.verified = jwt.verify(input, pks[0].key)
    a.value = payload[name]

    return a
  }
}
