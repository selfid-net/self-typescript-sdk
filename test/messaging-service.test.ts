// Copyright 2020 Self Group Ltd. All Rights Reserved.

import Jwt from '../src/jwt'
import IdentityService from '../src/identity-service'
import Messaging from '../src/messaging'
import FactsService from '../src/facts-service'

import { WebSocket, Server } from 'mock-socket'
import { Message } from 'self-protos/message_pb'
import { MsgType } from 'self-protos/msgtype_pb'
import MessagingService from '../src/messaging-service'
import { AccessControlList } from 'self-protos/acl_pb'
import { ACLCommand } from 'self-protos/aclcommand_pb'
import EncryptionMock from './mocks/encryption-mock'

describe('Messaging service', () => {
  let mss: MessagingService
  let jwt: Jwt
  let ms: Messaging
  let mockServer: Server

  beforeEach(async () => {
    let pk = 'UZXk4PSY6LN29R15jUVuDabsoH7VhFkVWGApA0IYLaY'
    let sk = '1:GVV4WqN6qQdfD7VQYV/VU7/9CTmWceXtSN4mykhzk7Q'
    jwt = await Jwt.build('appID', sk, { ntp: false })

    let is = new IdentityService(jwt, 'https://api.joinself.com/')

    const fakeURL = 'ws://localhost:8080'
    mockServer = new Server(fakeURL)

    let ec = new EncryptionMock()
    ms = new Messaging('', jwt, is, ec)

    ms.ws = new WebSocket(fakeURL)
    ms.connected = true

    mss = new MessagingService(jwt, ms, is)
  })

  afterEach(async () => {
    jwt.stop()
    mockServer.close()
  })

  describe('MessagingService::permitConnection', () => {
    it('happy path', async () => {
      const msMock = jest.spyOn(ms, 'send_and_wait').mockImplementation(
        (cid: string, data): Promise<any | Response> => {
          // The cid is automatically generated
          expect(cid.length).toEqual(36)
          // The cid is automatically generated
          let msg = AccessControlList.deserializeBinary(data.data.valueOf() as Uint8Array)

          // Envelope
          expect(msg.getId().length).toEqual(36)
          expect(msg.getType()).toEqual(MsgType.ACL)
          expect(msg.getCommand()).toEqual(ACLCommand.PERMIT)

          // Check ciphertext
          let input = msg.getPayload_asB64()
          let j = JSON.parse(Buffer.from(input, 'base64').toString())
          let payload = JSON.parse(Buffer.from(j['payload'], 'base64').toString())

          expect(payload.iss).toEqual('appID')
          expect(payload.acl_source).toEqual('selfid')

          return new Promise(resolve => {
            resolve(true)
          })
        }
      )

      let res = await mss.permitConnection('selfid')
      expect(res).toBeTruthy()
    })
  })

  describe('MessagingService::revokeConnection', () => {
    it('happy path', async () => {
      const msMock = jest.spyOn(ms, 'send_and_wait').mockImplementation(
        (cid: string, data): Promise<any | Response> => {
          // The cid is automatically generated
          expect(cid.length).toEqual(36)
          // The cid is automatically generated
          let msg = AccessControlList.deserializeBinary(data.data.valueOf() as Uint8Array)

          // Envelope
          expect(msg.getId().length).toEqual(36)
          expect(msg.getType()).toEqual(MsgType.ACL)
          expect(msg.getCommand()).toEqual(ACLCommand.REVOKE)

          // Check ciphertext
          let input = msg.getPayload_asB64()
          let j = JSON.parse(Buffer.from(input, 'base64').toString())
          let payload = JSON.parse(Buffer.from(j['payload'], 'base64').toString())

          expect(payload.iss).toEqual('appID')

          return new Promise(resolve => {
            resolve(true)
          })
        }
      )

      let res = await mss.revokeConnection('selfid')
      expect(res).toBeTruthy()
    })
  })

  describe('MessagingService::allowedConnections', () => {
    it('happy path', async () => {
      const msMock = jest.spyOn(ms, 'request').mockImplementation(
        (cid: string, data): Promise<any | Response> => {
          // The cid is automatically generated
          expect(cid.length).toEqual(36)
          // The cid is automatically generated
          let msg = AccessControlList.deserializeBinary(data.valueOf() as Uint8Array)

          // Envelope
          expect(msg.getId().length).toEqual(36)
          expect(msg.getType()).toEqual(MsgType.ACL)
          expect(msg.getCommand()).toEqual(ACLCommand.LIST)

          return new Promise(resolve => {
            resolve(['a', 'b'])
          })
        }
      )

      let res = await mss.allowedConnections()
      expect(res).toEqual(['a', 'b'])
    })
  })

  describe('MessagingService::isPermitted', () => {
    it('permissions by id', async () => {
      const msMock = jest.spyOn(ms, 'request').mockImplementation(
        (cid: string, data): Promise<any | Response> => {
          // The cid is automatically generated
          expect(cid.length).toEqual(36)
          // The cid is automatically generated
          let msg = AccessControlList.deserializeBinary(data.valueOf() as Uint8Array)

          // Envelope
          expect(msg.getId().length).toEqual(36)
          expect(msg.getType()).toEqual(MsgType.ACL)
          expect(msg.getCommand()).toEqual(ACLCommand.LIST)

          return new Promise(resolve => {
            resolve(['a', 'b'])
          })
        }
      )

      expect(await mss.isPermited('c')).toBeFalsy()
      expect(await mss.isPermited('a')).toBeTruthy()
    })
    it('permissions by wildcard', async () => {
      const msMock = jest.spyOn(ms, 'request').mockImplementation(
        (cid: string, data): Promise<any | Response> => {
          // The cid is automatically generated
          expect(cid.length).toEqual(36)
          // The cid is automatically generated
          let msg = AccessControlList.deserializeBinary(data.valueOf() as Uint8Array)

          // Envelope
          expect(msg.getId().length).toEqual(36)
          expect(msg.getType()).toEqual(MsgType.ACL)
          expect(msg.getCommand()).toEqual(ACLCommand.LIST)

          return new Promise(resolve => {
            resolve(['*'])
          })
        }
      )

      expect(await mss.isPermited('a')).toBeTruthy()
    })
  })

  describe('MessagingService::subscribe', () => {
    it('happy path', async () => {
      const msMock = jest
        .spyOn(ms, 'subscribe')
        .mockImplementation((messageType: string, callback: (n: any) => any) => {
          expect(messageType).toEqual('test')
        })

      expect(ms.subscribe('test', (n: any): any => {})).toBeUndefined()
    })
  })

  describe('MessagingService::send', () => {
    it('happy path', async () => {
      const axios = require('axios')
      jest.mock('axios')
      axios.get.mockResolvedValue({
        status: 200,
        data: ['deviceID']
      })

      const msMock = jest.spyOn(ms, 'send').mockImplementation(
        (recipient: string, data): Promise<any | Response> => {
          // The cid is automatically generated
          expect(recipient).toEqual('selfid')
          // The cid is automatically generated
          let msg = Message.deserializeBinary(data.data.valueOf() as Uint8Array)

          // Envelope
          expect(msg.getId().length).toEqual(36)
          expect(msg.getType()).toEqual(MsgType.MSG)

          // Check ciphertext
          let input = msg.getCiphertext_asB64()
          let ciphertext = JSON.parse(Buffer.from(input, 'base64').toString())
          let payload = JSON.parse(Buffer.from(ciphertext['payload'], 'base64').toString())
          expect(payload.jti.length).toEqual(36)
          expect(payload.cid.length).toEqual(36)
          expect(payload.iss).toEqual('appID')
          expect(payload.sub).toEqual('selfid')

          return new Promise(resolve => {
            resolve(true)
          })
        }
      )

      await mss.send('selfid', {})
    })
  })

  describe('MessagingService::notify', () => {
    it('happy path', async () => {
      const axios = require('axios')
      jest.mock('axios')
      axios.get.mockResolvedValue({
        status: 200,
        data: ['deviceID']
      })

      const msMock = jest.spyOn(ms, 'send').mockImplementation(
        (recipient: string, data): Promise<any | Response> => {
          // The cid is automatically generated
          expect(recipient).toEqual('selfid')
          // The cid is automatically generated
          let msg = Message.deserializeBinary(data.data.valueOf() as Uint8Array)

          // Envelope
          expect(msg.getId().length).toEqual(36)
          expect(msg.getType()).toEqual(MsgType.MSG)

          // Check ciphertext
          let input = msg.getCiphertext_asB64()
          let ciphertext = JSON.parse(Buffer.from(input, 'base64').toString())
          let payload = JSON.parse(Buffer.from(ciphertext['payload'], 'base64').toString())
          expect(payload.jti.length).toEqual(36)
          expect(payload.cid.length).toEqual(36)
          expect(payload.iss).toEqual('appID')
          expect(payload.sub).toEqual('selfid')
          expect(payload.description).toEqual('hello world!')

          return new Promise(resolve => {
            resolve(true)
          })
        }
      )

      await mss.notify('selfid', 'hello world!')
    })
  })
})
