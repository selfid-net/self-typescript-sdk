import SelfSDK from '../src/self-sdk'
import Fact from '../src/fact'

/**
 * Facts service test
 */

let sdk: SelfSDK

describe('Facts service', () => {
  beforeEach(async () => {
    sdk = await SelfSDK.build(
      '0f61af4946c11163a837d8bd8d2a9d05',
      'GVV4WqN6qQdfD7VQYV/VU7/9CTmWceXtSN4mykhzk7Q',
      'random'
    )
  })

  afterEach(async () => {
    sdk.stop()
  })

  it('request is truthy', async () => {
    jest.setTimeout(30000000)

    console.log('fact request')

    let res = await sdk.facts().request('84099724068', [{ fact: 'phone_number' }])

    console.log(res.facts[0].attestations[0].value)
  })
  /*
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
*/
})
