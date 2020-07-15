// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
  // import "core-js/fn/array.find"
import AuthenticationService from './authentication-service';
import FactsService from './facts-service';
import IdentityService from './identity-service';
import MessagingService from './messaging-service';
  // ...
  export default class SelfSDK {
    appID: string;
    appKey: string;
    storageKey: string;
    baseURL: string;
    messagingURL: string;
    autoReconnect: boolean;

    private authenticationService: AuthenticationService;
    private factsService: FactsService;
    private identityService: IdentityService;
    private messagingService: MessagingService;


    defaultBaseURL = "https://api.selfid.net";
    defaultMessagingURL = "wss://messaging.selfid.net/v1/messaging"

    constructor(
        appID: string,
        appKey: string,
        storageKey: string,
        opts?: { baseURL?: string, messagingURL?: string, env?: string, autoReconnect?: boolean },
    ) {
        this.appID = appID;
        this.appKey = appKey;
        this.storageKey = storageKey;

        this.baseURL = this.calculateBaseURL(opts)
        this.messagingURL = this.calculateMessagingURL(opts)
        this.autoReconnect = opts?.autoReconnect ? opts?.autoReconnect : true;

        this.authenticationService = new AuthenticationService();
        this.factsService = new FactsService();
        this.identityService = new IdentityService();
        this.messagingService = new MessagingService();
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

    private calculateBaseURL(opts?: { baseURL?: string, env?: string }) {
        if(opts?.baseURL) {
            return opts?.baseURL
        }
        if(opts?.env) {
            return `https://api.${opts?.env}.selfid.net`
        }

        return this.defaultBaseURL
    }

    private calculateMessagingURL(opts?: { messagingURL?: string, env?: string }) {
        if(opts?.messagingURL) {
            return opts?.messagingURL
        }
        if(opts?.env) {
            return `wss://messaging.${opts?.env}.selfid.net/v1/messaging`
        }

        return this.defaultMessagingURL
    }
}
