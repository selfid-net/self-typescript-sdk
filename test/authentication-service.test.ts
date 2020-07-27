import SelfSDK from '../src/self-sdk'

/**
 * Authentication service test
 */

let sdk: SelfSDK

describe('Authentication service', () => {
  beforeEach(async () => {
    sdk = await SelfSDK.build(
      '109a21fdd1bfaffa2717be1b4edb57e9',
      'RmfQdahde0n5SSk1iF4qA2xFbm116RNjjZe47Swn1s4',
      'random'
    )
  })

  afterEach(async () => {
    sdk.stop()
  })

  it('authentication workflow', async () => {
    jest.setTimeout(30000000)

    console.log('authentication')
    let res = await sdk.authentication().request('35918759412')
    expect(res).toBeTruthy()
  })
})
