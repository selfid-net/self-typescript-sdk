import Jwt from './jwt'

type PublicKey = {
  id: number
  key: string
}

type Identity = {
  id: string
  publicKeys: PublicKey[]
}

export default class IdentityService {
  jwt: Jwt

  readonly errUnauthorized = new Error("you're not authorized to interact with this identity")
  readonly errUnexistingIdentity = new Error('identity does not exist')
  readonly errInternal = new Error('internal error')

  constructor(jwt: Jwt) {
    this.jwt = jwt
  }

  async devices(selfid: string): Promise<string[]> {
    let devices: string[] = []

    try {
      const axios = require('axios').default

      const options = {
        headers: { Authorization: `Bearer ${this.jwt.authToken()}` }
      }

      const response = await axios.get(
        `https://api.review.selfid.net/v1/identities/${selfid}/devices`,
        options
      )
      if (response.status === 200) {
        devices = response.data
      } else if (response.status === 401) {
        throw this.errUnauthorized
      } else if (response.status === 404) {
        throw this.errUnexistingIdentity
      }
    } catch (error) {
      console.error(error)
      throw this.errInternal
    }

    return devices
  }

  async publicKeys(selfid: string): Promise<PublicKey[]> {
    let identity = await this.get(selfid)

    return identity.publicKeys
  }

  async get(selfid: string): Promise<Identity> {
    let identity: any

    try {
      const axios = require('axios').default

      const options = {
        headers: { Authorization: `Bearer ${this.jwt.authToken()}` }
      }

      const response = await axios.get(
        `https://api.review.selfid.net/v1/identities/${selfid}`,
        options
      )
      if (response.status === 200) {
        console.log(response.data)
        identity = response.data
        identity.publicKeys = response.data.public_keys
        delete identity.public_keys
      } else if (response.status === 401) {
        throw this.errUnauthorized
      } else if (response.status === 404) {
        throw this.errUnexistingIdentity
      }
    } catch (error) {
      console.error(error)
      throw this.errInternal
    }

    return identity
  }
}
