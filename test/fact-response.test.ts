import Jwt from '../src/jwt'
import IdentityService from '../src/identity-service'
import pks from './__fixtures__/pks'
import fact from './__fixtures__/fact'
import FactResponse from '../src/fact-response'

/**
 * Attestation test
 */
describe('jwt', () => {
  let jwt: Jwt
  let pk: any
  let sk: any
  let is: IdentityService

  beforeEach(async () => {
    pk = 'UZXk4PSY6LN29R15jUVuDabsoH7VhFkVWGApA0IYLaY'
    sk = 'GVV4WqN6qQdfD7VQYV/VU7/9CTmWceXtSN4mykhzk7Q'
    jwt = await Jwt.build('appID', sk, { ntp: false })
    is = new IdentityService(jwt, 'https://api.joinself.com/')
  })

  afterEach(async () => {
    jwt.stop()
  })

  it('parses an attestation', async () => {
    const axios = require('axios')

    jest.mock('axios')
    axios.get.mockResolvedValue({
      status: 200,
      data: pks
    })

    let iat = new Date().valueOf() - 100000
    let exp = new Date().valueOf() + 100000

    let input = {
      jti: 'jti',
      cid: 'cid',
      status: 'accepted',
      typ: 'identity.facts.query.req',
      aud: '1112223334',
      iss: '1112223331',
      sub: '1112223332',
      iat: iat,
      exp: exp,
      facts: [fact]
    }

    let fr = await FactResponse.parse(input, jwt, is)
    expect(fr.jti).toEqual('jti')
    expect(fr.cid).toEqual('cid')
    expect(fr.status).toEqual('accepted')
    expect(fr.typ).toEqual('identity.facts.query.req')
    expect(fr.aud).toEqual('1112223334')
    expect(fr.iss).toEqual('1112223331')
    expect(fr.sub).toEqual('1112223332')
    expect(fr.iat).toEqual(iat)
    expect(fr.exp).toEqual(exp)
    expect(fr.facts.length).toEqual(1)

    let f = fr.facts[0]
    expect(f.fact).toEqual('phone_number')
    expect(f.operator).toEqual('==')
    expect(f.expected_value).toEqual('22')
    expect(f.sources).toEqual(['passport'])
    expect(f.attestations.length).toEqual(1)

    let att = f.attestations[0]
    expect(att.verified).toBeTruthy()
    expect(att.to).toEqual('84099724068')
    expect(att.origin).toEqual('self_verification')
    expect(att.source).toEqual('user_specified')
    expect(att.factName).toEqual('phone_number')
    expect(att.value).toEqual('+441234567890')

    // Test fact method output
    expect(fr.fact('unexisting')).toBeUndefined()

    f = fr.fact('phone_number')
    expect(f.fact).toEqual('phone_number')
    expect(f.operator).toEqual('==')
    expect(f.expected_value).toEqual('22')
    expect(f.sources).toEqual(['passport'])
    expect(f.attestations.length).toEqual(1)

    // Test attestationsFor method output
    let pn = fr.attestationsFor('phone_number')
    expect(pn.length).toEqual(1)
    expect(pn[0].value).toEqual('+441234567890')
    expect(fr.attestationsFor('unexisting').length).toEqual(0)

    // Test attestationValuesFor method output
    let pnv = fr.attestationValuesFor('phone_number')
    expect(pnv.length).toEqual(1)
    expect(pnv[0]).toEqual('+441234567890')
    expect(fr.attestationValuesFor('unexisting').length).toEqual(0)
  })
})
