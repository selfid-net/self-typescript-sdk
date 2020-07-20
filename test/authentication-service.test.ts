import SelfSDK from '../src/self-sdk';
import AuthenticationService from '../src/authentication-service';

/**
 * Authentication service test
 */

let sdk: SelfSDK;

describe("Authentication service", () => {
    beforeEach(async () => {
        sdk = await SelfSDK.build( "109a21fdd1bfaffa2717be1b4edb57e9", "RmfQdahde0n5SSk1iF4qA2xFbm116RNjjZe47Swn1s4", "random");
    })

    afterEach(async () => {
        sdk.jwt.stop()
    })

    it("request is truthy", () => {
        let req = sdk.authentication().request("myselfid")
        expect(req).toBeTruthy()
    })

    it("generateQR is truthy", () => {
        let req = sdk.authentication().generateQR()
        expect(req).toBeTruthy()
    })

    it("generateDeepLink is truthy", () => {
        let req = sdk.authentication().generateDeepLink(() => {
            console.log("called back")
        })
        expect(req).toBeTruthy()
    })

    it("subscribe is truthy", () => {
        let req = sdk.authentication().subscribe(() => {
            console.log("called back")
        })
        expect(req).toBeTruthy()
    })
})
