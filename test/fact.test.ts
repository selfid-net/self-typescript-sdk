// Copyright 2020 Self Group Ltd. All Rights Reserved.

import Jwt from '../src/jwt'
import IdentityService from '../src/identity-service'
import pks from './__fixtures__/pks'
import at from './__fixtures__/attestation'
import fact from './__fixtures__/fact'
import Fact from '../src/fact'

/**
 * Fact test
 */
describe('fact', () => {
  let jwt: Jwt
  let pk: any
  let sk: any
  let is: IdentityService

  beforeEach(async () => {
    pk = 'UZXk4PSY6LN29R15jUVuDabsoH7VhFkVWGApA0IYLaY'
    sk = '1:GVV4WqN6qQdfD7VQYV/VU7/9CTmWceXtSN4mykhzk7Q'
    jwt = await Jwt.build('appID', sk, { ntp: false })
    is = new IdentityService(jwt, 'https://api.joinself.com/')
  })

  afterEach(async () => {
    jwt.stop()
  })

  describe('fact', () => {
    it('parses an facts', async () => {
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

    it('parses an facts without sources', async () => {
      const axios = require('axios')

      jest.mock('axios')
      axios.get.mockResolvedValue({
        status: 200,
        data: pks
      })

      let fct = { ...fact }
      delete fct.sources
      let f = await Fact.parse(fct, jwt, is)

      expect(f.fact).toEqual('phone_number')
      expect(f.operator).toEqual('==')
      expect(f.expected_value).toEqual('22')
      expect(f.sources).toEqual([])
      expect(f.attestations.length).toEqual(1)
    })

    it('parses an facts without attestations', async () => {
      const axios = require('axios')

      jest.mock('axios')
      axios.get.mockResolvedValue({
        status: 200,
        data: pks
      })

      let fct = { ...fact }
      delete fct.attestations
      let factWithoutAttestations = await Fact.parse(fct, jwt, is)

      expect(factWithoutAttestations.fact).toEqual('phone_number')
      expect(factWithoutAttestations.operator).toEqual('==')
      expect(factWithoutAttestations.expected_value).toEqual('22')
      expect(factWithoutAttestations.sources).toEqual(['passport'])
      expect(factWithoutAttestations.attestations.length).toEqual(0)
    })
  })

  describe('isValid', () => {
    it('validates a fact', async () => {
      expect(Fact.isValid({ fact: 'supu' })).toBeFalsy()
      expect(Fact.isValid({ fact: 'email_address' })).toBeTruthy()
      expect(Fact.isValid({ sources: ['user_specified'], fact: 'email_address' })).toBeTruthy()
      expect(Fact.isValid({ sources: ['passport'], fact: 'email_address' })).toBeFalsy()
      expect(Fact.isValid({ sources: ['driving_license'], fact: 'email_address' })).toBeFalsy()
      expect(Fact.isValid({ sources: ['driving_license'], fact: 'email_address' })).toBeFalsy()
    })
  })
})
