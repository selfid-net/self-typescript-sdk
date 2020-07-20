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
        sdk = await SelfSDK.build( "109a21fdd1bfaffa2717be1b4edb57e9", "RmfQdahde0n5SSk1iF4qA2xFbm116RNjjZe47Swn1s4", "random");
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

    it("urls vary for each environment", async() => {
        const sdkReview = await SelfSDK.build("109a21fdd1bfaffa2717be1b4edb57e9", "RmfQdahde0n5SSk1iF4qA2xFbm116RNjjZe47Swn1s4", "random", {env: "review"});
        expect(sdkReview.baseURL).toEqual(`https://api.review.selfid.net`)
        expect(sdkReview.messagingURL).toEqual(`wss://messaging.review.selfid.net/v1/messaging`)

        const sdkSandbox = await SelfSDK.build("109a21fdd1bfaffa2717be1b4edb57e9", "RmfQdahde0n5SSk1iF4qA2xFbm116RNjjZe47Swn1s4", "random", {env: "sandbox"});
        expect(sdkSandbox.baseURL).toEqual(`https://api.sandbox.selfid.net`)
        expect(sdkSandbox.messagingURL).toEqual(`wss://messaging.sandbox.selfid.net/v1/messaging`)
    })

    it("forced urls take prevalence", async() => {
        let opts = {env: "review", baseURL: "http://localhost", messagingURL: "ws://localhost"}
        const localSDK = await SelfSDK.build("109a21fdd1bfaffa2717be1b4edb57e9", "RmfQdahde0n5SSk1iF4qA2xFbm116RNjjZe47Swn1s4", "random", opts);

        expect(localSDK.baseURL).toEqual(opts["baseURL"])
        expect(localSDK.messagingURL).toEqual(opts["messagingURL"])
    })
})
