import Jwt from '../src/jwt'
import IdentityService from '../src/identity-service'
import Messaging from '../src/messaging'
import FactsService from '../src/facts-service'

import { WebSocket, Server } from 'mock-socket'
import { Message } from '../generated/message_pb'
import { MsgType } from '../generated/msgtype_pb'
import MessagingService from '../src/messaging-service'
import { AccessControlList } from '../generated/acl_pb'
import { ACLCommand } from '../generated/aclcommand_pb'

describe('Messaging service', () => {
  let mss: MessagingService
  let jwt: Jwt
  let ms: Messaging
  let mockServer: Server

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
            resolve([{ acl_source: 'source', acl_exp: 'xxxx' }])
          })
        }
      )

      let res = await mss.allowedConnections()
      expect(res['source']).toEqual('xxxx')
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
})
