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

    sdk.facts().subscribe((res: any): any => {
      console.log(res.attestationValuesFor('phone_number')[0])
    })

    // Generate a QR code to authenticate
    let buf = sdk.facts().generateQR([{ fact: 'phone_number' }])

    const fs = require('fs').promises
    await fs.writeFile('/tmp/qr.png', buf)
    console.log('Open /tmp/qr.png and scan it with your device')

    // Wait til the response is received
    const wait = seconds => new Promise(resolve => setTimeout(() => resolve(true), seconds * 1000))
    await wait(30000)
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
