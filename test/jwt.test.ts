import Jwt from '../src/jwt';

/**
 * Jwt test
 */
describe("lol", () => {
    it("works", async() => {
        let jwt = new Jwt("6d0c13fa84fb4f6dcc0ac66c9b230bff", "cTPCVQEWBpJoWjIcNqchT9hLwCCmg47dvlXjra3vo3E");

        let t = await jwt.authToken()
        console.log(".......")
        console.log(".......")
        console.log(".......")
        console.log(t)
        console.log(".......")
        console.log(".......")
        console.log(".......")
        console.log(".......")
    })
})
