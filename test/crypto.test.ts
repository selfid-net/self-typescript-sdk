// Copyright 2020 Self Group Ltd. All Rights Reserved.

import Jwt from '../src/jwt'
import IdentityService from '../src/identity-service'
import Crypto from '../src/crypto'

/**
 * Crypto test
 */
describe('crypto', () => {
  let jwt: Jwt
  let pk: any
  let sk: any
  let is: IdentityService

  beforeEach(async () => {
    pk = 'HFVVpSs8W804ok2khjn_a_ccHc6yvzhg2lvwKKxjQM0'
    sk = '1:GVV4WqN6qQdfD7VQYV/VU7/9CTmWceXtSN4mykhzk7Q'
  })

  afterEach(async () => {
    // jwt.stop()
  })

  it('encrypt / decrypt', async () => {
    let bobJWT = await Jwt.build('bobID', sk, { ntp: false })
    let bobIS = new IdentityService(bobJWT, 'https://api.joinself.com/')

    let aliceJWT = await Jwt.build('aliceID', sk, { ntp: false })
    let aliceIS = new IdentityService(aliceJWT, 'https://api.joinself.com/')

    jest.spyOn(aliceIS, 'postRaw').mockImplementation(
      (url: string, body: any): Promise<number> => {
        return new Promise(resolve => {
          resolve(200)
        })
      }
    )

    jest.spyOn(bobIS, 'postRaw').mockImplementation(
      (url: string, body: any): Promise<number> => {
        return new Promise(resolve => {
          resolve(200)
        })
      }
    )

    jest.spyOn(bobIS, 'devicePublicKey').mockImplementation(
      (selfid: string, did: string): Promise<string> => {
        return new Promise(resolve => {
          resolve('nNa1aFIDgomyJ1o90vALAIYERA9VGaP015CYpU0jHgc')
        })
      }
    )

    jest.spyOn(bobIS, 'getRaw').mockImplementation(
      (url: string): Promise<any> => {
        return new Promise(resolve => {
          resolve({ status: 200, data: { key: 'SZtuxEF539SKOP1AL6z/HTpNfNdYvQPcA7RBXsxkQHc' } })
        })
      }
    )

    let bobC = await Crypto.build(bobIS, '1', '/tmp/bob/', 'storage_key')
    let aliceC = await Crypto.build(aliceIS, '1', '/tmp/alice/', 'storage_key')

    let encryptedString = await bobC.encrypt('hello alice', 'aliceID', '1')
    console.log('ENCRYPTED STRING:')
    console.log('=======================')
    let coc = String.fromCharCode.apply(null, encryptedString)
    console.log(coc)

    let decryptedString = await aliceC.decrypt(coc, 'bobID', '1')
    console.log('DECRYPTED STRING:')
    console.log('=======================')
    console.log(decryptedString)
  })
})
