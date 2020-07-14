// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
  // import "core-js/fn/array.find"
  // ...
export default class SelfSDK {
    appID: string;
    appKey: string;
    storageKey: string;

    constructor(appID: string, appKey: string, storageKey: string) {
        this.appID = appID;
        this.appKey = appKey;
        this.storageKey = storageKey;
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
}
