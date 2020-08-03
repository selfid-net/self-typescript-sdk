import Jwt from '../src/jwt'
import IdentityService from '../src/identity-service'
import pks from './__fixtures__/pks'
import at from './__fixtures__/attestation'
import fact from './__fixtures__/fact'
import Fact from '../src/fact'

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
    is = new IdentityService(jwt)
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

    let f = await Fact.parse(fact, jwt, is)

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
  })
})
