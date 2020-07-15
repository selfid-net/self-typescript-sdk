import Jwt from '../src/jwt';

/**
 * Jwt test
 */
describe("lol", () => {
    it("works", () => {
        let appID = "id"
        let appKey = "key"

        let jwt = new Jwt(appID, appKey)

        jwt.do()
    })
})
