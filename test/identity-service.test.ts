import SelfSDK from '../src/self-sdk';
import IdentityService from "../src/identity-service"

/**
 * Identity service test
 */

let sdk: SelfSDK;

describe("Identity service", () => {
    beforeEach(async () => {
        sdk = await SelfSDK.build( "109a21fdd1bfaffa2717be1b4edb57e9", "RmfQdahde0n5SSk1iF4qA2xFbm116RNjjZe47Swn1s4", "random");
    })

    afterEach(async () => {
        sdk.jwt.stop()
    })

    it("identity devices", async() => {
        let devices = await sdk.identity().devices("35918759412")
        console.log(devices)

    })

    it("identity public keys", async() => {
        let pks = await sdk.identity().publicKeys("35918759412")
        console.log(pks)
    })

    it("get is truthy", async() => {
        let identity = await sdk.identity().get("35918759412")
        console.log(identity)
    })
})
