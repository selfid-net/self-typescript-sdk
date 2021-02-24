// Copyright 2020 Self Group Ltd. All Rights Reserved.

import Jwt from '../src/jwt'
import IdentityService from '../src/identity-service'
import Messaging from '../src/messaging'
import FactsService from '../src/facts-service'
import MessagingService from '../src/messaging-service'

import { WebSocket, Server } from 'mock-socket'
import { Message } from 'self-protos/message_pb'
import { MsgType } from 'self-protos/msgtype_pb'

/**
 * Attestation test
 */
describe('AuthenticationService', () => {
  let fs: FactsService
  let jwt: Jwt
  let ms: Messaging
  let is: IdentityService
  let messagingService: MessagingService
  let mockServer: Server
  let URL = require('url').URL

  beforeEach(async () => {
    let pk = 'UZXk4PSY6LN29R15jUVuDabsoH7VhFkVWGApA0IYLaY'
    let sk = '1:GVV4WqN6qQdfD7VQYV/VU7/9CTmWceXtSN4mykhzk7Q'
    jwt = await Jwt.build('appID', sk, { ntp: false })

    is = new IdentityService(jwt, 'https://api.joinself.com/')

    const fakeURL = 'ws://localhost:8080'
    mockServer = new Server(fakeURL)

    ms = new Messaging('', jwt, is)
    ms.ws = new WebSocket(fakeURL)
    ms.connected = true
    messagingService = new MessagingService(jwt, ms, is)

    fs = new FactsService(jwt, messagingService, is, 'test')
  })

  afterEach(async () => {
    jwt.stop()
    mockServer.close()
  })

  describe('FactsService::request', () => {
    it('happy path', async () => {
      const axios = require('axios')
      jest.mock('axios')
      axios.get.mockResolvedValue({
        status: 200,
        data: ['deviceID']
      })
      jest.spyOn(is, 'app').mockImplementation(
        (appID: string): Promise<any> => {
          return new Promise(resolve => {
            resolve({ paid_actions: true })
          })
        }
      )
      jest.spyOn(messagingService, 'isPermited').mockImplementation(
        (selfid: string): Promise<Boolean> => {
          return new Promise(resolve => {
            resolve(true)
          })
        }
      )

      const msMock = jest.spyOn(ms, 'request').mockImplementation(
        (cid: string, data): Promise<any> => {
          // The cid is automatically generated
          expect(cid.length).toEqual(36)
          // The cid is automatically generated
          let msg = Message.deserializeBinary(data[0].valueOf() as Uint8Array)

          // Envelope
          expect(msg.getId().length).toEqual(36)
          expect(msg.getRecipient()).toEqual('selfid:deviceID')
          expect(msg.getSender()).toEqual('appID:1')
          expect(msg.getType()).toEqual(MsgType.MSG)

          // Check ciphertext
          let input = msg.getCiphertext_asB64()
          let ciphertext = JSON.parse(Buffer.from(input, 'base64').toString())
          let payload = JSON.parse(Buffer.from(ciphertext['payload'], 'base64').toString())
          expect(payload.typ).toEqual('identities.facts.query.req')
          expect(payload.iss).toEqual('appID')
          expect(payload.sub).toEqual('selfid')
          expect(payload.aud).toEqual('selfid')
          expect(payload.cid).toEqual(cid)
          expect(payload.jti.length).toEqual(36)
          expect(payload.facts).toEqual([{ fact: 'phone_number' }])

          return new Promise(resolve => {
            resolve({ status: 'accepted' })
          })
        }
      )

      let res = await fs.request('selfid', [{ fact: 'phone_number' }])
      expect(res).toBeTruthy()
    })

    it('fails when not enough credits', async () => {
      const axios = require('axios')
      jest.mock('axios')
      axios.get.mockResolvedValue({
        status: 200,
        data: ['deviceID']
      })
      jest.spyOn(is, 'app').mockImplementation(
        (appID: string): Promise<any> => {
          return new Promise(resolve => {
            resolve({ paid_actions: false })
          })
        }
      )
      jest.spyOn(is, 'app').mockImplementation(
        (appID: string): Promise<any> => {
          return new Promise(resolve => {
            resolve({ paid_actions: false })
          })
        }
      )

      await expect(fs.request('selfid', [{ fact: 'phone_number' }])).rejects.toThrowError(
        'Your credits have expired, please log in to the developer portal and top up your account.'
      )
    })

    it('fails when callback connection is not permitted', async () => {
      const axios = require('axios')
      jest.mock('axios')
      axios.get.mockResolvedValue({
        status: 200,
        data: ['deviceID']
      })

      jest.spyOn(is, 'app').mockImplementation(
        (appID: string): Promise<any> => {
          return new Promise(resolve => {
            resolve({ paid_actions: true })
          })
        }
      )

      jest.spyOn(messagingService, 'isPermited').mockImplementation(
        (selfid: string): Promise<Boolean> => {
          return new Promise(resolve => {
            resolve(false)
          })
        }
      )

      await expect(fs.request('selfid', [{ fact: 'phone_number' }])).rejects.toThrowError(
        "You're not permitting connections from selfid"
      )
    })

    it('happy path with custom cid', async () => {
      const axios = require('axios')
      jest.mock('axios')
      axios.get.mockResolvedValue({
        status: 200,
        data: ['deviceID']
      })
      jest.spyOn(is, 'app').mockImplementation(
        (appID: string): Promise<any> => {
          return new Promise(resolve => {
            resolve({ paid_actions: true })
          })
        }
      )
      jest.spyOn(messagingService, 'isPermited').mockImplementation(
        (selfid: string): Promise<Boolean> => {
          return new Promise(resolve => {
            resolve(true)
          })
        }
      )

      const msMock = jest.spyOn(ms, 'request').mockImplementation(
        (cid: string, data): Promise<any> => {
          // The cid is automatically generated
          expect(cid).toEqual('cid')
          // The cid is automatically generated
          let msg = Message.deserializeBinary(data[0].valueOf() as Uint8Array)
          let input = msg.getCiphertext_asB64()
          let ciphertext = JSON.parse(Buffer.from(input, 'base64').toString())
          let payload = JSON.parse(Buffer.from(ciphertext['payload'], 'base64').toString())
          expect(payload.cid).toEqual('cid')

          return new Promise(resolve => {
            resolve({ status: 'accepted' })
          })
        }
      )

      let res = await fs.request('selfid', [{ fact: 'phone_number' }], { cid: 'cid', exp: 200 })
      expect(res).toBeTruthy()
    })
  })

  describe('FactsService::requestViaIntermediary', () => {
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
          expect(msg.getRecipient()).toEqual('self_intermediary:deviceID')
          expect(msg.getSender()).toEqual('appID:1')
          expect(msg.getType()).toEqual(MsgType.MSG)

          // Check ciphertext
          let input = msg.getCiphertext_asB64()
          let ciphertext = JSON.parse(Buffer.from(input, 'base64').toString())
          let payload = JSON.parse(Buffer.from(ciphertext['payload'], 'base64').toString())
          expect(payload.typ).toEqual('identities.facts.query.req')
          expect(payload.iss).toEqual('appID')
          expect(payload.sub).toEqual('selfid')
          expect(payload.aud).toEqual('selfid')
          expect(payload.cid).toEqual(cid)
          expect(payload.jti.length).toEqual(36)
          expect(payload.facts).toEqual([{ fact: 'phone_number' }])

          return new Promise(resolve => {
            resolve({ status: 'accepted' })
          })
        }
      )

      let res = await fs.requestViaIntermediary('selfid', [{ fact: 'phone_number' }])
      expect(res).toBeTruthy()
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
          expect(msg.getRecipient()).toEqual('intermediary:deviceID')
          let input = msg.getCiphertext_asB64()
          let ciphertext = JSON.parse(Buffer.from(input, 'base64').toString())
          let payload = JSON.parse(Buffer.from(ciphertext['payload'], 'base64').toString())
          expect(payload.cid).toEqual('cid')

          return new Promise(resolve => {
            resolve({ status: 'accepted' })
          })
        }
      )

      let res = await fs.requestViaIntermediary('selfid', [{ fact: 'phone_number' }], {
        cid: 'cid',
        intermediary: 'intermediary'
      })
      expect(res).toBeTruthy()
    })
  })

  describe('FactsService::generateDeepLink', () => {
    it('happy path', async () => {
      let callback = 'http://callback.com'
      let link = fs.generateDeepLink(callback, [{ fact: 'phone_number' }])
      const url = new URL(link)

      let callbackURL = new URL(url.searchParams.get('link'))
      expect(callbackURL.host).toEqual('callback.com')

      let ciphertext = JSON.parse(
        Buffer.from(callbackURL.searchParams.get('qr'), 'base64').toString()
      )
      let payload = JSON.parse(Buffer.from(ciphertext['payload'], 'base64').toString())
      expect(payload.typ).toEqual('identities.facts.query.req')
      expect(payload.iss).toEqual('appID')
      expect(payload.sub).toEqual('-')
      expect(payload.aud).toEqual('-')
      expect(payload.jti.length).toEqual(36)
      expect(payload.facts).toEqual([{ fact: 'phone_number' }])
    })

    it('happy path with custom options', async () => {
      let callback = 'http://callback.com'
      let link = fs.generateDeepLink(callback, [{ fact: 'phone_number' }], {
        cid: 'cid',
        selfid: 'selfid'
      })
      const url = new URL(link)

      let callbackURL = new URL(url.searchParams.get('link'))
      expect(callbackURL.host).toEqual('callback.com')

      let ciphertext = JSON.parse(
        Buffer.from(callbackURL.searchParams.get('qr'), 'base64').toString()
      )
      let payload = JSON.parse(Buffer.from(ciphertext['payload'], 'base64').toString())
      expect(payload.typ).toEqual('identities.facts.query.req')
      expect(payload.iss).toEqual('appID')
      expect(payload.sub).toEqual('selfid')
      expect(payload.aud).toEqual('selfid')
      expect(payload.cid).toEqual('cid')
      expect(payload.facts).toEqual([{ fact: 'phone_number' }])
      expect(payload.jti.length).toEqual(36)
    })

    it('happy path for development', async () => {
      let callback = 'http://callback.com'
      fs.env = 'development'
      let link = fs.generateDeepLink(callback, [{ fact: 'phone_number' }])
      const url = new URL(link)

      let callbackURL = new URL(url.searchParams.get('link'))
      expect(callbackURL.host).toEqual('callback.com')

      let ciphertext = JSON.parse(
        Buffer.from(callbackURL.searchParams.get('qr'), 'base64').toString()
      )
      let payload = JSON.parse(Buffer.from(ciphertext['payload'], 'base64').toString())
      expect(payload.typ).toEqual('identities.facts.query.req')
      expect(payload.iss).toEqual('appID')
      expect(payload.sub).toEqual('-')
      expect(payload.aud).toEqual('-')
      expect(payload.jti.length).toEqual(36)
      expect(payload.facts).toEqual([{ fact: 'phone_number' }])
    })

    it('happy path for production', async () => {
      let callback = 'http://callback.com'
      fs.env = ''
      let link = fs.generateDeepLink(callback, [{ fact: 'phone_number' }])
      const url = new URL(link)

      let callbackURL = new URL(url.searchParams.get('link'))
      expect(callbackURL.host).toEqual('callback.com')

      let ciphertext = JSON.parse(
        Buffer.from(callbackURL.searchParams.get('qr'), 'base64').toString()
      )
      let payload = JSON.parse(Buffer.from(ciphertext['payload'], 'base64').toString())
      expect(payload.typ).toEqual('identities.facts.query.req')
      expect(payload.iss).toEqual('appID')
      expect(payload.sub).toEqual('-')
      expect(payload.aud).toEqual('-')
      expect(payload.jti.length).toEqual(36)
      expect(payload.facts).toEqual([{ fact: 'phone_number' }])
    })
  })

  describe('FactsService::generateQR', () => {
    it('happy path', async () => {
      let qr = fs.generateQR([{ fact: 'phone_number' }])
      expect(qr).not.toBe('')
    })
    it('happy path custom selfid', async () => {
      let qr = fs.generateQR([{ fact: 'phone_number' }], { selfid: 'selfid' })
      expect(qr).not.toBe('')
    })
  })

  describe('FactsService::subscribe', () => {
    it('happy path', async () => {
      const msMock = jest
        .spyOn(ms, 'subscribe')
        .mockImplementation((messageType: string, callback: (n: any) => any) => {
          expect(messageType).toEqual('identities.facts.query.resp')
        })

      expect(fs.subscribe((n: any): any => {})).toBeUndefined()
    })
  })
})
