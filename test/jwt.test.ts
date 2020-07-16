import Jwt from '../src/jwt';

/**
 * Jwt test
 */
describe("lol", () => {
    it("works", async() => {
        let jwt = new Jwt("738a9ba67b14520a2282a892efd8f696", "IWtkmYLTLq+yhVaFnXOetjuOAF5pv3J7QkfdP00EeZA");

        let t = await jwt.authToken()
        console.log(`curl -X GET -H 'Accept: application/json' -H "Authorization: Bearer ${t}" https://api.review.selfid.net/v1/identities/48931618754/devices`)

        let verified = await jwt.verify(t, jwt.keypair.publicKey)
        expect(verified).toBeTruthy()
    })
})
