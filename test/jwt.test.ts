import Jwt from '../src/jwt';
import SelfSDK from '../src/self-sdk';

/**
 * Jwt test
 */
let sdk: SelfSDK;

describe("jwt", () => {
    beforeEach(async () => {
        sdk = await SelfSDK.build( "109a21fdd1bfaffa2717be1b4edb57e9", "RmfQdahde0n5SSk1iF4qA2xFbm116RNjjZe47Swn1s4", "random");
    })

    afterEach(async () => {
        sdk.jwt.stop()
    })

    it("signs and verifies with valid keys", async() => {
        let token = sdk.jwt.authToken()
        console.log(`curl -X GET -H 'Accept: application/json' -H "Authorization: Bearer ${token}" https://api.review.selfid.net/v1/identities/35918759412/devices`)
        let verified = sdk.jwt.verify(token, sdk.jwt.keypair.publicKey)

        expect(verified).toBeTruthy()
    })

    it("calculates dates based on ntp server", async() => {
        console.log((new Date()).valueOf())
        console.log(sdk.jwt.now())
    })

})
