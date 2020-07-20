import SelfSDK from '../src/self-sdk';
import Fact from "../src/facts-service"

/**
 * Facts service test
 */

let sdk: SelfSDK;

describe("Facts service", () => {
    beforeEach(async () => {
        sdk = await SelfSDK.build( "109a21fdd1bfaffa2717be1b4edb57e9", "RmfQdahde0n5SSk1iF4qA2xFbm116RNjjZe47Swn1s4", "random");
    })

    afterEach(async () => {
        sdk.jwt.stop()
    })

    it("request is truthy", () => {
        let facts:Fact[] = []
        let req = sdk.facts().request("myselfid", facts, () => {
            console.log("called back")
        })
        expect(req).toBeTruthy()
    })

    it("request via intermediary is truthy", () => {
        let facts:Fact[] = []
        let req = sdk.facts().requestViaIntermediary("myselfid", facts, () => {
            console.log("called back")
        })
        expect(req).toBeTruthy()
    })


    it("generateQR is truthy", () => {
        let facts:Fact[] = []
        let req = sdk.facts().generateQR(facts)
        expect(req).toBeTruthy()
    })

    it("generateDeepLink is truthy", () => {
        let facts:Fact[] = []
        let req = sdk.facts().generateDeepLink(facts, () => {
            console.log("called back")
        })
        expect(req).toBeTruthy()
    })

    it("subscribe is truthy", () => {
        let req = sdk.facts().subscribe(() => {
            console.log("called back")
        })
        expect(req).toBeTruthy()
    })

})
