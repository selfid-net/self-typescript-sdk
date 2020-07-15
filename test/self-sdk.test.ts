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

  it("default urls point to production", () => {
    const sdk = new SelfSDK("appId", "appKey", "storageKey")
    expect(sdk.baseURL).toEqual(sdk.defaultBaseURL)
    expect(sdk.messagingURL).toEqual(sdk.defaultMessagingURL)
  })

  it("urls vary for each environment", () => {
    const sdk = new SelfSDK("appId", "appKey", "storageKey", {env: "review"})
    expect(sdk.baseURL).toEqual(`https://api.review.selfid.net`)
    expect(sdk.messagingURL).toEqual(`wss://messaging.review.selfid.net/v1/messaging`)

    const sdkSandbox = new SelfSDK("appId", "appKey", "storageKey", {env: "sandbox"})
    expect(sdkSandbox.baseURL).toEqual(`https://api.sandbox.selfid.net`)
    expect(sdkSandbox.messagingURL).toEqual(`wss://messaging.sandbox.selfid.net/v1/messaging`)
  })

  it("forced urls take prevalence", () => {
    const sdk = new SelfSDK("appId", "appKey", "storageKey", {env: "review", baseURL: "http://localhost", messagingURL:"ws://localhost"})
    expect(sdk.baseURL).toEqual("http://localhost")
    expect(sdk.messagingURL).toEqual("ws://localhost")
  })
})
