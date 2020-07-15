import SelfSDK from '../src/self-sdk';
import IdentityService from "../src/identity-service"

/**
 * Identity service test
 */

let sdk: SelfSDK;

describe("Identity service", () => {
    beforeEach(async () => {
        sdk = new SelfSDK("appId", "appKey", "storageKey")
    })

    it("devices is an empty list", () => {
        let req = sdk.identity().devices("myselfid")
        expect(req.length).toBe(0)
    })

    it("devices is an empty list", () => {
        let req = sdk.identity().publicKeys("myselfid")
        expect(req.length).toBe(0)
    })

    it("get is truthy", () => {
        let req = sdk.identity().get("myselfid")
        expect(req).toBeTruthy()
    })
})
