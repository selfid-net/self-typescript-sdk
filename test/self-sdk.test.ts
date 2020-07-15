import SelfSDK from '../src/self-sdk';
import AuthenticationService from '../src/authentication-service';
import FactsService from '../src/facts-service';
import MessagingService from '../src/messaging-service';
import IdentityService from '../src/identity-service';


/**
 * SelfSDK test
 */

let sdk: SelfSDK;

describe("SelfSDK test", () => {
    beforeEach(async () => {
        sdk = new SelfSDK("appId", "appKey", "storageKey")
    })

    it("is instantiable", () => {
        expect(new SelfSDK("appId", "appKey", "storageKey")).toBeInstanceOf(SelfSDK)
    })

    it("returns an authentication service", () => {
        expect(sdk.authentication()).toBeInstanceOf(AuthenticationService)
    })

    it("returns an facts service", () => {
        expect(sdk.facts()).toBeInstanceOf(FactsService)
    })

    it("returns an messaging service", () => {
        expect(sdk.messaging()).toBeInstanceOf(MessagingService)
    })

    it("returns an identity service", () => {
        expect(sdk.identity()).toBeInstanceOf(IdentityService)
    })

    it("default urls point to production", () => {
        expect(sdk.baseURL).toEqual(sdk.defaultBaseURL)
        expect(sdk.messagingURL).toEqual(sdk.defaultMessagingURL)
    })

    it("urls vary for each environment", () => {
        const sdkReview = new SelfSDK("appId", "appKey", "storageKey", {env: "review"})
        expect(sdkReview.baseURL).toEqual(`https://api.review.selfid.net`)
        expect(sdkReview.messagingURL).toEqual(`wss://messaging.review.selfid.net/v1/messaging`)

        const sdkSandbox = new SelfSDK("appId", "appKey", "storageKey", {env: "sandbox"})
        expect(sdkSandbox.baseURL).toEqual(`https://api.sandbox.selfid.net`)
        expect(sdkSandbox.messagingURL).toEqual(`wss://messaging.sandbox.selfid.net/v1/messaging`)
    })

    it("forced urls take prevalence", () => {
        let opts = {env: "review", baseURL: "http://localhost", messagingURL: "ws://localhost"}
        let localSDK = new SelfSDK("appId", "appKey", "storageKey", opts)

        expect(localSDK.baseURL).toEqual(opts["baseURL"])
        expect(localSDK.messagingURL).toEqual(opts["messagingURL"])
    })
})
