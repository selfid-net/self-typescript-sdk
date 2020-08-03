import Jwt from '../src/jwt'
import Attestation from '../src/attestation'
import IdentityService from '../src/identity-service'
import pks from './__fixtures__/pks'

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

    let input = {
      payload:
        'eyJzdWIiOiI4NDA5OTcyNDA2OCIsImlzcyI6InNlbGZfdmVyaWZpY2F0aW9uIiwic291cmNlIjoidXNlcl9zcGVjaWZpZWQiLCJmYWN0IjoicGhvbmVfbnVtYmVyIiwicGhvbmVfbnVtYmVyIjoiKzQ0MTIzNDU2Nzg5MCJ9',
      protected: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9',
      signature:
        '4nW-8SD7DfsDGWNL2cbo-sY8RIgoRcvCyRVfJMHSLbW31Nupa4hEoCFYzwptRi-oxR7D1tMl488ZQp7t9UL4CQ'
    }

    let at = await Attestation.parse('phone_number', input, jwt, is)

    expect(at.verified).toBeTruthy()
    expect(at.to).toEqual('84099724068')
    expect(at.origin).toEqual('self_verification')
    expect(at.source).toEqual('user_specified')
    expect(at.factName).toEqual('phone_number')
    expect(at.value).toEqual('+441234567890')
  })
})
