// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
  // import "core-js/fn/array.find"
  // ...
  export default class SelfSDK {
    appID: string;
    appKey: string;
    storageKey: string;
    baseURL: string;
    messagingURL: string;
    autoReconnect: boolean;

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
    }

    authentication() {
        console.log("authentication");
        return true
    }

    facts() {
        console.log("facts")
        return true
    }

    identity() {
        console.log("identity")
        return true
    }

    messaging() {
        console.log("messaging")
        return true
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
