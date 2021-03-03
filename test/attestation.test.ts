// Copyright 2020 Self Group Ltd. All Rights Reserved.

import Jwt from '../src/jwt'
import Attestation from '../src/attestation'
import IdentityService from '../src/identity-service'
import at from './__fixtures__/attestation'
import { JwtInput } from '../src/jwt'

/**
 * Attestation test
 */
describe('jwt', () => {
  let jwt: Jwt
  let pk: any
  let sk: any
  let is: IdentityService

  beforeEach(async () => {
    pk = 'HFVVpSs8W804ok2khjn_a_ccHc6yvzhg2lvwKKxjQM0'
    sk = '1:GVV4WqN6qQdfD7VQYV/VU7/9CTmWceXtSN4mykhzk7Q'
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
      data: {
        history: [
          {
            payload:
              'eyJzZXF1ZW5jZSI6MCwicHJldmlvdXMiOiItIiwidmVyc2lvbiI6IjEuMC4wIiwidGltZXN0YW1wIjoxNTk5MDQzNTg4LCJhY3Rpb25zIjpbeyJraWQiOiIxIiwiZGlkIjoiMSIsInR5cGUiOiJkZXZpY2Uua2V5IiwiYWN0aW9uIjoia2V5LmFkZCIsImZyb20iOjE1OTkwNDM1ODgsImtleSI6InB6Z19hUm5qTDlUcmVseVo5QmhkRGxtSXROMnVIS3JIeWlxUFR2OVBpbTQifSx7ImtpZCI6IjIiLCJ0eXBlIjoicmVjb3Zlcnkua2V5IiwiYWN0aW9uIjoia2V5LmFkZCIsImZyb20iOjE1OTkwNDM1ODgsImtleSI6InZoa0ZjZkcxaHBFb0dkbEN0VF9wSFhaRUdpS01NNUE1a3ViNmoyNFBXemMifV19',
            protected: 'eyJhbGciOiJFZERTQSIsImtpZCI6IjEifQ',
            signature:
              '-pOGdd7lUbDx8h4gjzDha3y4ftGYUHQjbKOk5yFT2eJsjkOg5daY4t-9O9CaJg0A5Hj--ZRHvvHPzKdN5Z1tBA'
          }
        ]
      }
    })
    let kk = <JwtInput>(
      'ezpwYXlsb2FkPT4iZXlKcWRHa2lPaUkwWXpNd09EUXhZaTFoTkRSakxUUTJNamd0T0daak1TMWpObVkxTmpWbE1XUTRZVGtpTENKemRXSWlPaUkyTmpZeE56WTROVEU1TmlJc0ltbHpjeUk2SW5ObGJHWmZkbVZ5YVdacFkyRjBhVzl1SWl3aWFXRjBJam9pTWpBeU1TMHdNaTB5TTFReE1Eb3lOVG93TVM0MU56UTVNekExTnpkYUlpd2ljMjkxY21ObElqb2lkWE5sY2w5emNHVmphV1pwWldRaUxDSjJaWEpwWm1sbFpDSTZkSEoxWlN3aVpXMWhhV3hmWVdSa2NtVnpjeUk2SW1Ga2NtbGhMbU5wWkhKbFFHZHRZV2xzTG1OdmJTSjkiLCA6cHJvdGVjdGVkPT4iZXlKaGJHY2lPaUpGWkVSVFFTSXNJbXRwWkNJNklqRWlmUSIsIDpzaWduYXR1cmU9PiJJQWE4SzZtMkszOUJLM25iQjNFQ0J3eG55Q2VPU2JQcmtuQXVhRi1IaGtkUkdjRUdpeUNLU3dzaWR0M2NDSE02UERvdU5mRUhYaVFuV2xybnF1cnhBUSJ9'
    )

    let att = await Attestation.parse('phone_number', kk, jwt, is)
    expect(att.verified).toBeTruthy()
    expect(att.to).toEqual('84099724068')
    expect(att.origin).toEqual('self_verification')
    expect(att.source).toEqual('user_specified')
    expect(att.factName).toEqual('phone_number')
    expect(att.value).toEqual('+441234567890')
  })
})
