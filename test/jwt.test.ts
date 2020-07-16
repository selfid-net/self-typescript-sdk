import Jwt from '../src/jwt';

/**
 * Jwt test
 */
describe("jwt", () => {
    it("signs and verifies with valid keys", async() => {
        let jwt = new Jwt("738a9ba67b14520a2282a892efd8f696", "IWtkmYLTLq+yhVaFnXOetjuOAF5pv3J7QkfdP00EeZA");

        let token = await jwt.authToken()
        let verified = await jwt.verify(token, jwt.keypair.publicKey)

        expect(verified).toBeTruthy()
    })
})
