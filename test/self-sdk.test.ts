import SelfSDK from '../src/self-sdk'
import AuthenticationService from '../src/authentication-service'
import FactsService from '../src/facts-service'
import MessagingService from '../src/messaging-service'
import IdentityService from '../src/identity-service'
import { WebSocket, Server } from 'mock-socket'

/**
 * SelfSDK test
 */

describe('SelfSDK test', () => {
  let sdk: SelfSDK
  let sk: string

  beforeEach(async () => {
    sk = 'GVV4WqN6qQdfD7VQYV/VU7/9CTmWceXtSN4mykhzk7Q'

    sdk = await SelfSDK.build('appID', sk, 'random', { messagingURL: '', ntp: false })
  })

  afterEach(async () => {
    sdk.stop()
  })

  it('is instantiable', () => {
    expect(sdk).toBeInstanceOf(SelfSDK)
  })

  it('returns an authentication service', () => {
    expect(sdk.authentication()).toBeInstanceOf(AuthenticationService)
  })

  it('returns an facts service', () => {
    expect(sdk.facts()).toBeInstanceOf(FactsService)
  })

  it('returns an messaging service', () => {
    expect(sdk.messaging()).toBeInstanceOf(MessagingService)
  })

  it('returns an identity service', () => {
    expect(sdk.identity()).toBeInstanceOf(IdentityService)
  })

  it('default urls point to production', () => {
    expect(sdk['calculateBaseURL']({})).toEqual(sdk.defaultBaseURL)
    expect(sdk['calculateBaseURL']()).toEqual(sdk.defaultBaseURL)

    expect(sdk['calculateMessagingURL']({})).toEqual(sdk.defaultMessagingURL)
    expect(sdk['calculateMessagingURL']()).toEqual(sdk.defaultMessagingURL)
  })

  it('urls vary for each environment', async () => {
    expect(sdk['calculateBaseURL']({ env: 'review' })).toEqual(`https://api.review.joinself.com`)
    expect(sdk['calculateMessagingURL']({ env: 'review' })).toEqual(
      `wss://messaging.review.joinself.com/v1/messaging`
    )

    expect(sdk['calculateBaseURL']({ env: 'sandbox' })).toEqual(`https://api.sandbox.joinself.com`)
    expect(sdk['calculateMessagingURL']({ env: 'sandbox' })).toEqual(
      `wss://messaging.sandbox.joinself.com/v1/messaging`
    )
  })

  it('forced urls take prevalence', async () => {
    let bURL = 'http://www.google.com'
    expect(sdk['calculateBaseURL']({ baseURL: bURL })).toEqual(bURL)

    let mURL = 'http://www.google.com'
    expect(sdk['calculateMessagingURL']({ messagingURL: mURL })).toEqual(mURL)
  })
})
