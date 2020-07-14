import SelfSDK from "../src/self-sdk"

/**
 * SelfSDK test
 */
describe("SelfSDK test", () => {
  it("works if true is truthy", () => {
    expect(true).toBeTruthy()
  })

  it("SelfSDK is instantiable", () => {
    expect(new SelfSDK("appId", "appKey", "storageKey")).toBeInstanceOf(SelfSDK)
  })

  it("SelfSDK authentication is callable", () => {
    const sdk = new SelfSDK("appId", "appKey", "storageKey")
    expect(sdk.authentication()).toBeTruthy()
  })

  it("SelfSDK facts is callable", () => {
    const sdk = new SelfSDK("appId", "appKey", "storageKey")
    expect(sdk.facts()).toBeTruthy()
  })

  it("SelfSDK identity is callable", () => {
    const sdk = new SelfSDK("appId", "appKey", "storageKey")
    expect(sdk.identity()).toBeTruthy()
  })

  it("SelfSDK messaging is callable", () => {
    const sdk = new SelfSDK("appId", "appKey", "storageKey")
    expect(sdk.messaging()).toBeTruthy()
  })
})
