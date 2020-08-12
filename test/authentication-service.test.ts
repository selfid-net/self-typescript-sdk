import Jwt from '../src/jwt'
import IdentityService from '../src/identity-service'
import AuthenticationService from '../src/authentication-service'
import Messaging from '../src/messaging'

import { WebSocket, Server } from 'mock-socket'
import { Message } from 'self-protos/message_pb'
import { MsgType } from 'self-protos/msgtype_pb'

/**
 * Attestation test
 */
describe('AuthenticationService', () => {
  let auth: AuthenticationService
  let jwt: Jwt
  let ms: Messaging
  let mockServer: Server
  let URL = require('url').URL

  beforeEach(async () => {
    let pk = 'UZXk4PSY6LN29R15jUVuDabsoH7VhFkVWGApA0IYLaY'
    let sk = 'GVV4WqN6qQdfD7VQYV/VU7/9CTmWceXtSN4mykhzk7Q'
    jwt = await Jwt.build('appID', sk, { ntp: false })

    let is = new IdentityService(jwt)

    const fakeURL = 'ws://localhost:8080'
    mockServer = new Server(fakeURL)

    ms = new Messaging('', jwt, is)
    ms.ws = new WebSocket(fakeURL)
    ms.connected = true

    auth = new AuthenticationService(jwt, ms, is, 'test')
  })

  afterEach(async () => {
    jwt.stop()
    mockServer.close()
  })

  describe('AuthenticationService::request', () => {
    it('happy path', async () => {
      const axios = require('axios')
      jest.mock('axios')
      axios.get.mockResolvedValue({
        status: 200,
        data: ['deviceID']
      })

      const msMock = jest.spyOn(ms, 'request').mockImplementation(
        (cid: string, data): Promise<any> => {
          // The cid is automatically generated
          expect(cid.length).toEqual(36)
          // The cid is automatically generated
          let msg = Message.deserializeBinary(data.valueOf() as Uint8Array)

          // Envelope
          expect(msg.getId().length).toEqual(36)
          expect(msg.getRecipient()).toEqual('selfid:deviceID')
          expect(msg.getSender()).toEqual('appID:1')
          expect(msg.getType()).toEqual(MsgType.MSG)

          // Check ciphertext
          let input = msg.getCiphertext_asB64()
          let ciphertext = JSON.parse(Buffer.from(input, 'base64').toString())
          let payload = JSON.parse(Buffer.from(ciphertext['payload'], 'base64').toString())
          expect(payload.typ).toEqual('identities.authenticate.req')
          expect(payload.iss).toEqual('appID')
          expect(payload.sub).toEqual('selfid')
          expect(payload.aud).toEqual('selfid')
          expect(payload.cid).toEqual(cid)
          expect(payload.jti.length).toEqual(36)

          return new Promise(resolve => {
            resolve({ status: 'accepted' })
          })
        }
      )

      let res = await auth.request('selfid')
      expect(res).toBeTruthy()
    })

    it('rejected auth request', async () => {
      const axios = require('axios')
      jest.mock('axios')
      axios.get.mockResolvedValue({
        status: 200,
        data: ['deviceID']
      })

      const msMock = jest.spyOn(ms, 'request').mockImplementation(
        (cid: string, data): Promise<any> => {
          return new Promise(resolve => {
            resolve({ status: 'rejected' })
          })
        }
      )

      let res = await auth.request('selfid')
      expect(res).toBeFalsy()
    })

    it('happy path with custom cid', async () => {
      const axios = require('axios')
      jest.mock('axios')
      axios.get.mockResolvedValue({
        status: 200,
        data: ['deviceID']
      })

      const msMock = jest.spyOn(ms, 'request').mockImplementation(
        (cid: string, data): Promise<any> => {
          // The cid is automatically generated
          expect(cid).toEqual('cid')
          // The cid is automatically generated
          let msg = Message.deserializeBinary(data.valueOf() as Uint8Array)
          let input = msg.getCiphertext_asB64()
          let ciphertext = JSON.parse(Buffer.from(input, 'base64').toString())
          let payload = JSON.parse(Buffer.from(ciphertext['payload'], 'base64').toString())
          expect(payload.cid).toEqual('cid')

          return new Promise(resolve => {
            resolve({ status: 'accepted' })
          })
        }
      )

      let res = await auth.request('selfid', { cid: 'cid' })
      expect(res).toBeTruthy()
    })
  })

  describe('AuthenticationService::generateDeepLink', () => {
    it('happy path', async () => {
      let callback = 'http://callback.com'
      let link = auth.generateDeepLink(callback)
      const url = new URL(link)

      let callbackURL = new URL(url.searchParams.get('link'))
      expect(callbackURL.host).toEqual('callback.com')

      let ciphertext = JSON.parse(
        Buffer.from(callbackURL.searchParams.get('qr'), 'base64').toString()
      )
      let payload = JSON.parse(Buffer.from(ciphertext['payload'], 'base64').toString())
      expect(payload.typ).toEqual('identities.authenticate.req')
      expect(payload.iss).toEqual('appID')
      expect(payload.sub).toEqual('-')
      expect(payload.aud).toEqual('-')
      expect(payload.jti.length).toEqual(36)
    })

    it('happy path with custom options', async () => {
      let callback = 'http://callback.com'
      let link = auth.generateDeepLink(callback, { selfid: 'selfid', cid: 'cid' })
      const url = new URL(link)

      let callbackURL = new URL(url.searchParams.get('link'))
      expect(callbackURL.host).toEqual('callback.com')

      let ciphertext = JSON.parse(
        Buffer.from(callbackURL.searchParams.get('qr'), 'base64').toString()
      )
      let payload = JSON.parse(Buffer.from(ciphertext['payload'], 'base64').toString())
      expect(payload.typ).toEqual('identities.authenticate.req')
      expect(payload.iss).toEqual('appID')
      expect(payload.sub).toEqual('selfid')
      expect(payload.aud).toEqual('selfid')
      expect(payload.cid).toEqual('cid')
      expect(payload.jti.length).toEqual(36)
    })

    it('happy path for development', async () => {
      let callback = 'http://callback.com'
      auth.env = 'development'
      let link = auth.generateDeepLink(callback, { selfid: 'selfid', cid: 'cid' })
      const url = new URL(link)

      let callbackURL = new URL(url.searchParams.get('link'))
      expect(callbackURL.host).toEqual('callback.com')

      let ciphertext = JSON.parse(
        Buffer.from(callbackURL.searchParams.get('qr'), 'base64').toString()
      )
      let payload = JSON.parse(Buffer.from(ciphertext['payload'], 'base64').toString())
      expect(payload.typ).toEqual('identities.authenticate.req')
      expect(payload.iss).toEqual('appID')
      expect(payload.sub).toEqual('selfid')
      expect(payload.aud).toEqual('selfid')
      expect(payload.cid).toEqual('cid')
      expect(payload.jti.length).toEqual(36)
    })

    it('happy path for production', async () => {
      let callback = 'http://callback.com'
      auth.env = ''
      let link = auth.generateDeepLink(callback, { selfid: 'selfid', cid: 'cid' })
      const url = new URL(link)

      let callbackURL = new URL(url.searchParams.get('link'))
      expect(callbackURL.host).toEqual('callback.com')

      let ciphertext = JSON.parse(
        Buffer.from(callbackURL.searchParams.get('qr'), 'base64').toString()
      )
      let payload = JSON.parse(Buffer.from(ciphertext['payload'], 'base64').toString())
      expect(payload.typ).toEqual('identities.authenticate.req')
      expect(payload.iss).toEqual('appID')
      expect(payload.sub).toEqual('selfid')
      expect(payload.aud).toEqual('selfid')
      expect(payload.cid).toEqual('cid')
      expect(payload.jti.length).toEqual(36)
    })
  })

  describe('AuthenticationService::generateQR', () => {
    it('happy path', async () => {
      let qr = auth.generateQR()
      expect(qr).not.toBe('')
    })
  })

  describe('AuthenticationService::subscribe', () => {
    it('happy path', async () => {
      const msMock = jest
        .spyOn(ms, 'subscribe')
        .mockImplementation((messageType: string, callback: (n: any) => any) => {
          expect(messageType).toEqual('identities.authenticate.resp')
        })

      expect(auth.subscribe((n: any): any => {})).toBeUndefined()
    })
  })
})
