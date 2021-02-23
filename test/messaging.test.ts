// Copyright 2020 Self Group Ltd. All Rights Reserved.

import Jwt from '../src/jwt'
import IdentityService from '../src/identity-service'
import Messaging from '../src/messaging'
import { WebSocket, Server } from 'mock-socket'
import { Message } from 'self-protos/message_pb'
import { MsgType } from 'self-protos/msgtype_pb'

/**
 * Attestation test
 */
describe('jwt', () => {
  let jwt: Jwt
  let pk: any
  let sk: any
  let is: IdentityService
  let ms: Messaging

  beforeEach(async () => {
    pk = 'UZXk4PSY6LN29R15jUVuDabsoH7VhFkVWGApA0IYLaY'
    sk = '1:GVV4WqN6qQdfD7VQYV/VU7/9CTmWceXtSN4mykhzk7Q'

    jwt = await Jwt.build('appID', sk, { ntp: false })
    is = new IdentityService(jwt, 'https://api.joinself.com/')

    ms = new Messaging('', jwt, is)
  })

  afterEach(async () => {
    // ms.close()
    jwt.stop()
  })

  describe('Messaging::processIncommingMessage', () => {
    it('happy path', async () => {
      const axios = require('axios')

      jest.mock('axios')
      axios.get.mockResolvedValue({
        status: 200,
        data: [{ id: 0, key: 'CXK4hLAWtdZPGvwLMTPX6Gb2qoDHBuhVqUpf0sDA0+4' }]
      })

      let subscription = ms.subscribe('identities.facts.query.resp', (res: any): any => {
        expect(res.jti).toEqual('a41415a7-9de8-4c46-8263-415d3fbf12fe')
        expect(res.cid).toEqual('568487bd-9271-43dc-95a0-04d40d1db371')
        expect(res.status).toEqual('accepted')
        expect(res.typ).toEqual('identities.facts.query.resp')
        expect(res.aud).toEqual('0f61af4946c11163a837d8bd8d2a9d05')
        expect(res.iss).toEqual('84099724068')
        expect(res.sub).toEqual('84099724068')
        expect(res.iat).toEqual('2020-08-04T17:44:32Z')
        expect(res.exp).toEqual('2020-08-07T17:44:32Z')
        expect(res.facts.length).toEqual(1)

        let fact = res.facts[0]
        expect(fact.fact).toEqual('phone_number')

        let attestation = res.attestationValuesFor('phone_number')
        expect(attestation['0']).toEqual('+441234567890')
      })

      let c =
        'eyJwYXlsb2FkIjoiZXlKbVlXTjBjeUk2VzNzaVptRmpkQ0k2SW5Cb2IyNWxYMjUxYldKbGNpSXNJbUYwZEdWemRHRjBhVzl1Y3lJNlczc2ljR0Y1Ykc5aFpDSTZJbVY1U25Ga1IydHBUMmxKTWs5SFNtaFBWRkV6VFhrd2QwMXFTbTFNVkZKcFRtcEZkRTlYV1RKWlV6QTFUa1JaTlU5WFdUVlBWMXB0V1RKRmFVeERTbnBrVjBscFQybEpORTVFUVRWUFZHTjVUa1JCTWs5RFNYTkpiV3g2WTNsSk5rbHVUbXhpUjFwbVpHMVdlV0ZYV25CWk1rWXdZVmM1ZFVscGQybGhWMFl3U1dwdmFVMXFRWGxOUXpCM1Rua3dlVTlXVVhkUFJHOTRUVlJ2ZUU1RE5EUk5WR3QzVFdwTk5FNXFVbUZKYVhkcFl6STVNV050VG14SmFtOXBaRmhPYkdOc09YcGpSMVpxWVZkYWNGcFhVV2xNUTBveVdsaEtjRnB0Ykd4YVEwazJaRWhLTVZwVGQybGpSMmgyWW0xV1ptSnVWblJaYlZaNVNXcHZhVXQ2VVRCTlZFbDZUa1JWTWs1Nlp6Vk5RMG81SWl3aWNISnZkR1ZqZEdWa0lqb2laWGxLYUdKSFkybFBhVXBHV2tWU1ZGRlRTamtpTENKemFXZHVZWFIxY21VaU9pSnVjMkkzZEZjMVNVUjFiRFpRVDA5MmJFeE5YMU5hUW5aMGVVaDFhVjlhZFRZMmIySkxha1ZzUWs1SldrNDJjREl4ZUhoNlMyTXlNVW94VUZkc1VVZzBNemhtUmpSQ2FVaENWVWxuWDFwc1JIZGtRMjlEWnlKOVhYMWRMQ0pxZEdraU9pSmhOREUwTVRWaE55MDVaR1U0TFRSak5EWXRPREkyTXkwME1UVmtNMlppWmpFeVptVWlMQ0pqYVdRaU9pSTFOamcwT0RkaVpDMDVNamN4TFRRelpHTXRPVFZoTUMwd05HUTBNR1F4WkdJek56RWlMQ0p6ZEdGMGRYTWlPaUpoWTJObGNIUmxaQ0lzSW5SNWNDSTZJbWxrWlc1MGFYUnBaWE11Wm1GamRITXVjWFZsY25rdWNtVnpjQ0lzSW1GMVpDSTZJakJtTmpGaFpqUTVORFpqTVRFeE5qTmhPRE0zWkRoaVpEaGtNbUU1WkRBMUlpd2liM0IwYVc5dWN5STZleUpzYjJOaGRHbHZibDlwWkNJNklpSXNJblpwYzJsMFgybGtJam9pTTJJNU1EYzJOamt0WVRneU55MDBOVEl3TFdGbFlqa3RPR1kzWXprMFpHTTVaamM1SW4wc0ltbHpjeUk2SWpnME1EazVOekkwTURZNElpd2ljM1ZpSWpvaU9EUXdPVGszTWpRd05qZ2lMQ0pwWVhRaU9pSXlNREl3TFRBNExUQTBWREUzT2pRME9qTXlXaUlzSW1WNGNDSTZJakl3TWpBdE1EZ3RNRGRVTVRjNk5EUTZNekphSW4wIiwicHJvdGVjdGVkIjoiZXlKaGJHY2lPaUpGWkVSVFFTSjkiLCJzaWduYXR1cmUiOiIzMkhRaUtLbjk0clFValFCNUVCN3ZBbWxyR3U5bjREaVdOaVNhSDRpV2kycndUZlllYjFXRDZWWEk1cWpCbUdQSjl6NGRqdUVlOXJmVDBvUXpNeDZBQSJ9'
      await ms['processIncommingMessage'](c, 0)

      await Promise.all([subscription])
    })

    it('authentication happy path', async () => {
      const axios = require('axios')

      jest.mock('axios')
      axios.get.mockResolvedValue({
        status: 200,
        data: [{ id: 0, key: 'CXK4hLAWtdZPGvwLMTPX6Gb2qoDHBuhVqUpf0sDA0+4' }]
      })

      let subscription = ms.subscribe('identities.authenticate.resp', (res: any): any => {
        expect(res.status).toEqual('accepted')
        expect(res.sub).toEqual('84099724068')
        expect(res.aud).toEqual('0f61af4946c11163a837d8bd8d2a9d05')
        expect(res.iss).toEqual('84099724068')
        expect(res.iat).toEqual('2020-08-05T07:51:43Z')
        expect(res.exp).toEqual('2020-08-08T07:51:43Z')
        expect(res.jti).toEqual('6903241f-806f-4a0b-980f-7c02093f1121')
        expect(res.cid).toEqual('403a0171-9dc0-4b15-900f-488ae4dfa1ec')
        expect(res.device_id).toEqual('dCW4ztbqTIi8WXoCQ0tBdt')
        expect(res.typ).toEqual('identities.authenticate.resp')
      })

      let c =
        'eyJwYXlsb2FkIjoiZXlKemRHRjBkWE1pT2lKaFkyTmxjSFJsWkNJc0luTjFZaUk2SWpnME1EazVOekkwTURZNElpd2lZWFZrSWpvaU1HWTJNV0ZtTkRrME5tTXhNVEUyTTJFNE16ZGtPR0prT0dReVlUbGtNRFVpTENKcGMzTWlPaUk0TkRBNU9UY3lOREEyT0NJc0ltTmhiR3hpWVdOcklqcHVkV3hzTENKcFlYUWlPaUl5TURJd0xUQTRMVEExVkRBM09qVXhPalF6V2lJc0ltVjRjQ0k2SWpJd01qQXRNRGd0TURoVU1EYzZOVEU2TkROYUlpd2lhblJwSWpvaU5qa3dNekkwTVdZdE9EQTJaaTAwWVRCaUxUazRNR1l0TjJNd01qQTVNMll4TVRJeElpd2lZMmxrSWpvaU5EQXpZVEF4TnpFdE9XUmpNQzAwWWpFMUxUa3dNR1l0TkRnNFlXVTBaR1poTVdWaklpd2laR1YyYVdObFgybGtJam9pWkVOWE5IcDBZbkZVU1drNFYxaHZRMUV3ZEVKa2RDSXNJblI1Y0NJNkltbGtaVzUwYVhScFpYTXVZWFYwYUdWdWRHbGpZWFJsTG5KbGMzQWlmUSIsInByb3RlY3RlZCI6ImV5SmhiR2NpT2lKRlpFUlRRU0o5Iiwic2lnbmF0dXJlIjoiSndUUm5hVlRqMlY0V0hMRF9aN1RVUWFnZWczMFZVdnhZQmZaSUZ4Q2FZMklQUHhnVnVncTRuT1QzTUdiTkhBakhPbGZtU0dla2dhRzkyV0dJOUhnQlEifQ=='
      await ms['processIncommingMessage'](c, 0)

      await Promise.all([subscription])
    })

    it('unverified message', async () => {
      const axios = require('axios')

      jest.mock('axios')
      axios.get.mockResolvedValue({
        status: 200,
        data: [{ id: 0, key: 'CXK4hLAWtdZPGvwLMTPX6Gb2qoDHBuhVqUpf0sDA0+5' }]
      })
      let count = false
      let subscription = ms.subscribe('identities.facts.query.resp', (res: any): any => {
        count = true
      })

      let c =
        'eyJwYXlsb2FkIjoiZXlKbVlXTjBjeUk2VzNzaVptRmpkQ0k2SW5Cb2IyNWxYMjUxYldKbGNpSXNJbUYwZEdWemRHRjBhVzl1Y3lJNlczc2ljR0Y1Ykc5aFpDSTZJbVY1U25Ga1IydHBUMmxKTWs5SFNtaFBWRkV6VFhrd2QwMXFTbTFNVkZKcFRtcEZkRTlYV1RKWlV6QTFUa1JaTlU5WFdUVlBWMXB0V1RKRmFVeERTbnBrVjBscFQybEpORTVFUVRWUFZHTjVUa1JCTWs5RFNYTkpiV3g2WTNsSk5rbHVUbXhpUjFwbVpHMVdlV0ZYV25CWk1rWXdZVmM1ZFVscGQybGhWMFl3U1dwdmFVMXFRWGxOUXpCM1Rua3dlVTlXVVhkUFJHOTRUVlJ2ZUU1RE5EUk5WR3QzVFdwTk5FNXFVbUZKYVhkcFl6STVNV050VG14SmFtOXBaRmhPYkdOc09YcGpSMVpxWVZkYWNGcFhVV2xNUTBveVdsaEtjRnB0Ykd4YVEwazJaRWhLTVZwVGQybGpSMmgyWW0xV1ptSnVWblJaYlZaNVNXcHZhVXQ2VVRCTlZFbDZUa1JWTWs1Nlp6Vk5RMG81SWl3aWNISnZkR1ZqZEdWa0lqb2laWGxLYUdKSFkybFBhVXBHV2tWU1ZGRlRTamtpTENKemFXZHVZWFIxY21VaU9pSnVjMkkzZEZjMVNVUjFiRFpRVDA5MmJFeE5YMU5hUW5aMGVVaDFhVjlhZFRZMmIySkxha1ZzUWs1SldrNDJjREl4ZUhoNlMyTXlNVW94VUZkc1VVZzBNemhtUmpSQ2FVaENWVWxuWDFwc1JIZGtRMjlEWnlKOVhYMWRMQ0pxZEdraU9pSmhOREUwTVRWaE55MDVaR1U0TFRSak5EWXRPREkyTXkwME1UVmtNMlppWmpFeVptVWlMQ0pqYVdRaU9pSTFOamcwT0RkaVpDMDVNamN4TFRRelpHTXRPVFZoTUMwd05HUTBNR1F4WkdJek56RWlMQ0p6ZEdGMGRYTWlPaUpoWTJObGNIUmxaQ0lzSW5SNWNDSTZJbWxrWlc1MGFYUnBaWE11Wm1GamRITXVjWFZsY25rdWNtVnpjQ0lzSW1GMVpDSTZJakJtTmpGaFpqUTVORFpqTVRFeE5qTmhPRE0zWkRoaVpEaGtNbUU1WkRBMUlpd2liM0IwYVc5dWN5STZleUpzYjJOaGRHbHZibDlwWkNJNklpSXNJblpwYzJsMFgybGtJam9pTTJJNU1EYzJOamt0WVRneU55MDBOVEl3TFdGbFlqa3RPR1kzWXprMFpHTTVaamM1SW4wc0ltbHpjeUk2SWpnME1EazVOekkwTURZNElpd2ljM1ZpSWpvaU9EUXdPVGszTWpRd05qZ2lMQ0pwWVhRaU9pSXlNREl3TFRBNExUQTBWREUzT2pRME9qTXlXaUlzSW1WNGNDSTZJakl3TWpBdE1EZ3RNRGRVTVRjNk5EUTZNekphSW4wIiwicHJvdGVjdGVkIjoiZXlKaGJHY2lPaUpGWkVSVFFTSjkiLCJzaWduYXR1cmUiOiIzMkhRaUtLbjk0clFValFCNUVCN3ZBbWxyR3U5bjREaVdOaVNhSDRpV2kycndUZlllYjFXRDZWWEk1cWpCbUdQSjl6NGRqdUVlOXJmVDBvUXpNeDZBQSJ9'
      await ms['processIncommingMessage'](c, 0)

      await Promise.all([subscription])
      expect(count).toBeFalsy()
    })

    it('invalid input message', async () => {
      const axios = require('axios')

      jest.mock('axios')
      axios.get.mockResolvedValue({
        status: 200,
        data: [{ id: 0, key: 'CXK4hLAWtdZPGvwLMTPX6Gb2qoDHBuhVqUpf0sDA0+4' }]
      })
      let count = false
      let subscription = ms.subscribe('identities.facts.query.resp', (res: any): any => {
        count = true
      })

      let c = 'lol'
      await ms['processIncommingMessage'](c, 0)

      await Promise.all([subscription])
      expect(count).toBeFalsy()
    })

    it('happy path subscribed by cid', async () => {
      const axios = require('axios')
      const cid = '568487bd-9271-43dc-95a0-04d40d1db371'

      jest.mock('axios')
      axios.get.mockResolvedValue({
        status: 200,
        data: [{ id: 0, key: 'CXK4hLAWtdZPGvwLMTPX6Gb2qoDHBuhVqUpf0sDA0+4' }]
      })

      let req = { data: '' }
      ms.requests.set(cid, req)

      let c =
        'eyJwYXlsb2FkIjoiZXlKbVlXTjBjeUk2VzNzaVptRmpkQ0k2SW5Cb2IyNWxYMjUxYldKbGNpSXNJbUYwZEdWemRHRjBhVzl1Y3lJNlczc2ljR0Y1Ykc5aFpDSTZJbVY1U25Ga1IydHBUMmxKTWs5SFNtaFBWRkV6VFhrd2QwMXFTbTFNVkZKcFRtcEZkRTlYV1RKWlV6QTFUa1JaTlU5WFdUVlBWMXB0V1RKRmFVeERTbnBrVjBscFQybEpORTVFUVRWUFZHTjVUa1JCTWs5RFNYTkpiV3g2WTNsSk5rbHVUbXhpUjFwbVpHMVdlV0ZYV25CWk1rWXdZVmM1ZFVscGQybGhWMFl3U1dwdmFVMXFRWGxOUXpCM1Rua3dlVTlXVVhkUFJHOTRUVlJ2ZUU1RE5EUk5WR3QzVFdwTk5FNXFVbUZKYVhkcFl6STVNV050VG14SmFtOXBaRmhPYkdOc09YcGpSMVpxWVZkYWNGcFhVV2xNUTBveVdsaEtjRnB0Ykd4YVEwazJaRWhLTVZwVGQybGpSMmgyWW0xV1ptSnVWblJaYlZaNVNXcHZhVXQ2VVRCTlZFbDZUa1JWTWs1Nlp6Vk5RMG81SWl3aWNISnZkR1ZqZEdWa0lqb2laWGxLYUdKSFkybFBhVXBHV2tWU1ZGRlRTamtpTENKemFXZHVZWFIxY21VaU9pSnVjMkkzZEZjMVNVUjFiRFpRVDA5MmJFeE5YMU5hUW5aMGVVaDFhVjlhZFRZMmIySkxha1ZzUWs1SldrNDJjREl4ZUhoNlMyTXlNVW94VUZkc1VVZzBNemhtUmpSQ2FVaENWVWxuWDFwc1JIZGtRMjlEWnlKOVhYMWRMQ0pxZEdraU9pSmhOREUwTVRWaE55MDVaR1U0TFRSak5EWXRPREkyTXkwME1UVmtNMlppWmpFeVptVWlMQ0pqYVdRaU9pSTFOamcwT0RkaVpDMDVNamN4TFRRelpHTXRPVFZoTUMwd05HUTBNR1F4WkdJek56RWlMQ0p6ZEdGMGRYTWlPaUpoWTJObGNIUmxaQ0lzSW5SNWNDSTZJbWxrWlc1MGFYUnBaWE11Wm1GamRITXVjWFZsY25rdWNtVnpjQ0lzSW1GMVpDSTZJakJtTmpGaFpqUTVORFpqTVRFeE5qTmhPRE0zWkRoaVpEaGtNbUU1WkRBMUlpd2liM0IwYVc5dWN5STZleUpzYjJOaGRHbHZibDlwWkNJNklpSXNJblpwYzJsMFgybGtJam9pTTJJNU1EYzJOamt0WVRneU55MDBOVEl3TFdGbFlqa3RPR1kzWXprMFpHTTVaamM1SW4wc0ltbHpjeUk2SWpnME1EazVOekkwTURZNElpd2ljM1ZpSWpvaU9EUXdPVGszTWpRd05qZ2lMQ0pwWVhRaU9pSXlNREl3TFRBNExUQTBWREUzT2pRME9qTXlXaUlzSW1WNGNDSTZJakl3TWpBdE1EZ3RNRGRVTVRjNk5EUTZNekphSW4wIiwicHJvdGVjdGVkIjoiZXlKaGJHY2lPaUpGWkVSVFFTSjkiLCJzaWduYXR1cmUiOiIzMkhRaUtLbjk0clFValFCNUVCN3ZBbWxyR3U5bjREaVdOaVNhSDRpV2kycndUZlllYjFXRDZWWEk1cWpCbUdQSjl6NGRqdUVlOXJmVDBvUXpNeDZBQSJ9'
      await ms['processIncommingMessage'](c, 0)

      let r = ms.requests.get(cid)
      expect(r.responded).toBeTruthy()
    })
  })

  describe('processIncommingACL', () => {
    it('ACL not found', () => {
      let input = `[{"acl_source":"*","acl_exp":"2120-07-05T08:13:25.367860183Z"},{"acl_source":"84099724068","acl_exp":"3018-12-07T07:25:47.616Z"}]`
      ms['processIncommingACL']('cid', input)

      let r = ms.requests.get('cid')
      expect(r).toBeUndefined()
    })

    it('happy path', () => {
      ms.requests.set('cid', { data: '' })

      let input = `[{"acl_source":"*","acl_exp":"2120-07-05T08:13:25.367860183Z"},{"acl_source":"84099724068","acl_exp":"3018-12-07T07:25:47.616Z"}]`
      ms['processIncommingACL']('cid', input)

      let r = ms.requests.get('cid')
      expect(r.response).toBeTruthy()
      expect(r.acknowledged).toBeTruthy()
      expect(r.response.length).toEqual(2)
    })
  })

  describe('setup', () => {
    it('happy path', async () => {
      const fakeURL = 'ws://localhost:8080'
      const mockServer = new Server(fakeURL)

      mockServer.on('connection', socket => {
        socket.on('message', async input => {
          let msg = Message.deserializeBinary(input.valueOf() as Uint8Array)

          expect(msg.getType()).toEqual(MsgType.AUTH)

          // Stop listening for response
          let req = ms.requests.get(msg.getId())
          req.acknowledged = true
          req.responded = true

          ms.requests.set(msg.getId(), req)
        })
        socket.on('close', () => {})
      })

      ms.ws = new WebSocket(fakeURL)
      ms.connected = true

      await ms['setup']()
      mockServer.close()
    })
  })

  describe('send and wait', () => {
    it('happy path waiting for response', async () => {
      const fakeURL = 'ws://localhost:8080'
      const mockServer = new Server(fakeURL)
      const uuid = 'cid'
      const reqBody = 'foo'
      const resBody = 'bar'

      mockServer.on('connection', socket => {
        socket.on('message', async input => {
          expect(input).toEqual(reqBody)

          // Stop listening for response
          let req = ms.requests.get(uuid)
          req.acknowledged = true
          req.responded = true
          req.response = resBody

          ms.requests.set(uuid, req)
        })
        socket.on('close', () => {})
      })

      ms.ws = new WebSocket(fakeURL)
      ms.connected = true

      let res = await ms.send_and_wait(uuid, { data: reqBody, waitForResponse: true })
      expect(res).toEqual(resBody)

      mockServer.close()
    })

    it('happy path not waiting for response', async () => {
      const fakeURL = 'ws://localhost:8080'
      const mockServer = new Server(fakeURL)
      const uuid = 'cid'
      const reqBody = 'foo'
      const resBody = 'bar'

      mockServer.on('connection', socket => {
        socket.on('message', async input => {
          expect(input).toEqual(reqBody)

          // Stop listening for response
          let req = ms.requests.get(uuid)
          req.acknowledged = true
          req.responded = true
          req.response = resBody

          ms.requests.set(uuid, req)
        })
        socket.on('close', () => {})
      })

      ms.ws = new WebSocket(fakeURL)
      ms.connected = true

      let res = await ms.send_and_wait(uuid, { data: reqBody })
      expect(res).toBeTruthy()

      mockServer.close()
    })
  })

  describe('mark_as_acknowledged', () => {
    it('happy path waiting for response', async () => {
      ms.requests.set('cid', { data: 'kk' })
      let req = ms.requests.get('cid')
      expect(req.acknowledged).toBeFalsy()

      ms['mark_as_acknowledged']('cid')

      req = ms.requests.get('cid')
      expect(req.acknowledged).toBeTruthy()
    })
  })

  describe('request', () => {
    it('happy path', async () => {
      const fakeURL = 'ws://localhost:8080'
      const mockServer = new Server(fakeURL)
      const uuid = 'cid'
      const reqBody = 'foo'
      const resBody = 'bar'

      mockServer.on('connection', socket => {
        socket.on('message', async input => {
          expect(input).toEqual(reqBody)

          // Stop listening for response
          let req = ms.requests.get(uuid)
          req.acknowledged = true
          req.responded = true
          req.response = resBody

          ms.requests.set(uuid, req)
        })
        socket.on('close', () => {})
      })

      ms.ws = new WebSocket(fakeURL)
      ms.connected = true

      let res = await ms.request(uuid, reqBody)
      expect(res).toEqual(resBody)

      mockServer.close()
    })
  })

  describe('onmessage', () => {
    it('type error', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

      let msg = new Message()
      msg.setId('cid')
      msg.setType(MsgType.ERR)
      await ms['onmessage'](msg)

      expect(consoleSpy).toHaveBeenCalledWith('error processing cid')
    })

    it('type acknowledge', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

      let msg = new Message()
      msg.setId('cid')
      msg.setType(MsgType.ACK)
      await ms['onmessage'](msg)

      expect(consoleSpy).toHaveBeenCalledWith('acknowledged cid')
    })

    it('type ACL', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

      let msg = new Message()
      msg.setId('cid')
      msg.setType(MsgType.ACL)
      try {
        await ms['onmessage'](msg)
      } catch (error) {
        expect(consoleSpy).toHaveBeenCalledWith('ACL cid')
      }
    })

    it('type MSG', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

      let msg = new Message()
      msg.setId('cid')
      msg.setType(MsgType.MSG)
      try {
        await ms['onmessage'](msg)
      } catch (error) {
        expect(consoleSpy).toHaveBeenCalledWith('message received cid')
      }
    })
  })
})
