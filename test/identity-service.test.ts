// Copyright 2020 Self Group Ltd. All Rights Reserved.

import Jwt from '../src/jwt'
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
    sk = '1:GVV4WqN6qQdfD7VQYV/VU7/9CTmWceXtSN4mykhzk7Q'
    jwt = await Jwt.build('appID', sk, { ntp: false })
    is = new IdentityService(jwt, 'https://api.joinself.com/')
  })

  afterEach(async () => {
    jwt.stop()
  })

  describe('IdentityService::devices', () => {
    it('happy path', async () => {
      const axios = require('axios')

      jest.mock('axios')
      axios.get.mockResolvedValue({
        status: 200,
        data: ['deviceID']
      })

      let devices = await is.devices('selfid')
      expect(devices.length).toEqual(1)
      expect(devices[0]).toEqual('deviceID')
    })

    it('unauthorized response', async () => {
      const axios = require('axios')

      jest.mock('axios')
      axios.get.mockResolvedValue({
        status: 401,
        data: []
      })

      try {
        await is.devices('selfid')
      } catch (e) {
        expect(e.message).toBe("you're not authorized to interact with this identity")
      }
    })

    it('not found identity', async () => {
      const axios = require('axios')

      jest.mock('axios')
      axios.get.mockResolvedValue({
        status: 404,
        data: pks
      })

      try {
        await is.devices('selfid')
      } catch (e) {
        expect(e.message).toBe('identity does not exist')
      }
    })

    it('internal error', async () => {
      const axios = require('axios')
      jest.spyOn(axios, 'get').mockRejectedValue(new Error('error'))

      try {
        await is.devices('selfid')
      } catch (e) {
        expect(e.message).toBe('internal error')
      }
    })
  })

  describe('IdentityService::publicKeys', () => {
    it('happy path', async () => {
      const axios = require('axios')

      jest.mock('axios')
      axios.get.mockResolvedValue({
        status: 200,
        data: pks
      })

      let publicKeys = await is.publicKeys('selfid')
      expect(publicKeys.length).toEqual(1)
      expect(publicKeys[0].id).toEqual(0)
      expect(publicKeys[0].key).toEqual(pks[0].key)
    })

    it('unauthorized response', async () => {
      const axios = require('axios')

      jest.mock('axios')
      axios.get.mockResolvedValue({
        status: 401,
        data: pks
      })

      try {
        await is.publicKeys('selfid')
      } catch (e) {
        expect(e.message).toBe("you're not authorized to interact with this identity")
      }
    })

    it('not found identity', async () => {
      const axios = require('axios')

      jest.mock('axios')
      axios.get.mockResolvedValue({
        status: 404,
        data: pks
      })

      try {
        await is.publicKeys('selfid')
      } catch (e) {
        expect(e.message).toBe('identity does not exist')
      }
    })

    it('internal error', async () => {
      const axios = require('axios')
      jest.spyOn(axios, 'get').mockRejectedValue(new Error('error'))

      try {
        await is.publicKeys('selfid')
      } catch (e) {
        expect(e.message).toBe('internal error')
      }
    })
  })

  describe('IdentityService::get', () => {
    it('happy path', async () => {
      const axios = require('axios')

      jest.mock('axios')
      axios.get.mockResolvedValue({
        status: 200,
        data: { id: '1112223334', public_keys: pks }
      })

      let identity = await is.get('selfid')
      expect(identity.id).toEqual('1112223334')
      expect(identity.publicKeys.length).toEqual(1)
      expect(identity.publicKeys[0].id).toEqual(0)
      expect(identity.publicKeys[0].key).toEqual(pks[0].key)
    })

    it('unauthorized response', async () => {
      const axios = require('axios')

      jest.mock('axios')
      axios.get.mockResolvedValue({
        status: 401,
        data: { id: '1112223334', public_keys: pks }
      })

      try {
        await is.get('selfid')
      } catch (e) {
        expect(e.message).toBe("you're not authorized to interact with this identity")
      }
    })

    it('not found identity', async () => {
      const axios = require('axios')

      jest.mock('axios')
      axios.get.mockResolvedValue({
        status: 404,
        data: { id: '1112223334', public_keys: pks }
      })

      try {
        await is.get('selfid')
      } catch (e) {
        expect(e.message).toBe('identity does not exist')
      }
    })

    it('internal error', async () => {
      const axios = require('axios')
      jest.spyOn(axios, 'get').mockRejectedValue(new Error('error'))

      try {
        await is.get('selfid')
      } catch (e) {
        expect(e.message).toBe('internal error')
      }
    })
  })
})
