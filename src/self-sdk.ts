// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
import AuthenticationService from './authentication-service'
import FactsService from './facts-service'
import IdentityService from './identity-service'
import MessagingService from './messaging-service'
import Jwt from './jwt'
import Messaging from './messaging'

// ...
export default class SelfSDK {
  appID: string
  appKey: string
  storageKey: string
  baseURL: string
  messagingURL: string
  autoReconnect: boolean
  jwt: any
  ms: any

  private authenticationService: any
  private factsService: any
  private identityService: any
  private messagingService: any

  defaultBaseURL = 'https://api.selfid.net'
  defaultMessagingURL = 'wss://messaging.selfid.net/v1/messaging'

  constructor(
    appID: string,
    appKey: string,
    storageKey: string,
    opts?: { baseURL?: string; messagingURL?: string; env?: string; autoReconnect?: boolean }
  ) {
    this.appID = appID
    this.appKey = appKey
    this.storageKey = storageKey

    this.baseURL = this.calculateBaseURL(opts)
    this.messagingURL = this.calculateMessagingURL(opts)
    // this.autoReconnect = opts?.autoReconnect ? opts?.autoReconnect : true;
  }

  public static async build(
    appID: string,
    appKey: string,
    storageKey: string,
    opts?: { baseURL?: string; messagingURL?: string; env?: string; autoReconnect?: boolean }
  ): Promise<SelfSDK> {
    const sdk = new SelfSDK(appID, appKey, storageKey, opts)
    sdk.jwt = await Jwt.build(appID, appKey)

    sdk.identityService = new IdentityService(sdk.jwt)
    sdk.ms = await Messaging.build(sdk.baseURL, sdk.jwt, sdk.identityService)

    sdk.messagingService = new MessagingService(sdk.jwt, sdk.identityService, sdk.ms)

    let options = opts ? opts : {}
    let env = options.env ? options.env : '-'
    sdk.factsService = new FactsService(sdk.jwt, sdk.messagingService.ms, sdk.identityService, env)
    sdk.authenticationService = new AuthenticationService(
      sdk.jwt,
      sdk.messagingService.ms,
      sdk.identityService,
      env
    )

    return sdk
  }

  stop() {
    this.jwt.stop()
    this.messagingService.close()
  }

  authentication(): AuthenticationService {
    return this.authenticationService
  }

  facts(): FactsService {
    return this.factsService
  }

  identity(): IdentityService {
    return this.identityService
  }

  messaging(): MessagingService {
    return this.messagingService
  }

  private calculateBaseURL(opts?: { baseURL?: string; env?: string }) {
    if (!opts) {
      return this.defaultBaseURL
    }

    if (opts.baseURL) {
      return opts.baseURL
    }
    if (opts.env) {
      return `https://api.${opts.env}.selfid.net`
    }

    return this.defaultBaseURL
  }

  private calculateMessagingURL(opts?: { messagingURL?: string; env?: string }) {
    if (!opts) {
      return this.defaultMessagingURL
    }

    if (opts.messagingURL) {
      return opts.messagingURL
    }
    if (opts.env) {
      return `wss://messaging.${opts.env}.selfid.net/v1/messaging`
    }

    return this.defaultMessagingURL
  }
}
