import Jwt from '../src/jwt'
import SelfSDK from '../src/self-sdk'

/**
 * Jwt test
 */

describe('jwt', () => {
  let jwt: Jwt
  let pk: any
  let sk: any

  beforeEach(async () => {
    pk = 'UZXk4PSY6LN29R15jUVuDabsoH7VhFkVWGApA0IYLaY'
    sk = 'GVV4WqN6qQdfD7VQYV/VU7/9CTmWceXtSN4mykhzk7Q'
    jwt = await Jwt.build('appID', sk, { ntp: false })
  })

  afterEach(async () => {
    jwt.stop()
  })

  it('signs and verifies with valid keys', () => {
    let token = jwt.authToken()
    let parts = token.split('.')
    let input = {
      protected: parts[0],
      payload: parts[1],
      signature: parts[2]
    }
    let verified = jwt.verify(input, pk)

    expect(verified).toBeTruthy()
  })

  it('calculates dates based on ntp server', () => {
    let before = new Date().valueOf()
    let middle = new Date().valueOf()
    let now = jwt.now()
    expect(now).toBeGreaterThanOrEqual(before)

    let after = new Date().valueOf()
    expect(now).toBeLessThanOrEqual(after)
  })

  it('prepares a message to be sent', () => {
    let output = jwt.prepare({ random: 'object' })
    let expectation =
      'eyJwYXlsb2FkIjoiZXlKeVlXNWtiMjBpT2lKdlltcGxZM1FpZlEiLCJwcm90ZWN0ZWQiOiJleUpoYkdjaU9pSkZaRVJUUVNJc0luUjVjQ0k2SWtwWFZDSjkiLCJzaWduYXR1cmUiOiJoREhaemg1bTZVUzRlNWZmOU9YUkNuU2d4N3M5UjFyY1EwS2hxVGtsWHU3d01QTDJEVHY5aWF3cENuMEpKS2FOcWFaSDBZZnNZM2JnR1diNmVfYWhEUSJ9'
    expect(output).toEqual(expectation)
  })
})
