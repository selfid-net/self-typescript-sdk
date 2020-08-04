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
    let response: any

    try {
      const axios = require('axios').default

      const options = {
        headers: { Authorization: `Bearer ${this.jwt.authToken()}` }
      }

      // TODO change this hardcoded url by this.url
      response = await axios.get(
        `https://api.review.selfid.net/v1/identities/${selfid}/devices`,
        options
      )
    } catch (error) {
      throw this.errInternal
    }

    if (response.status === 200) {
      devices = response.data
    } else if (response.status === 401) {
      throw this.errUnauthorized
    } else if (response.status === 404) {
      throw this.errUnexistingIdentity
    }

    return devices
  }

  async publicKeys(selfid: string): Promise<PublicKey[]> {
    let keys: any
    let response: any

    try {
      const axios = require('axios').default
      const options = {
        headers: { Authorization: `Bearer ${this.jwt.authToken()}` }
      }

      response = await axios.get(
        `https://api.review.selfid.net/v1/identities/${selfid}/public_keys`,
        options
      )
    } catch (error) {
      throw this.errInternal
    }

    if (response.status === 200) {
      return response.data
    } else if (response.status === 401) {
      throw this.errUnauthorized
    } else if (response.status === 404) {
      throw this.errUnexistingIdentity
    }

    return keys
  }

  async get(selfid: string): Promise<Identity> {
    let identity: any
    let response: any

    try {
      const axios = require('axios').default

      const options = {
        headers: { Authorization: `Bearer ${this.jwt.authToken()}` }
      }

      response = await axios.get(`https://api.review.selfid.net/v1/identities/${selfid}`, options)
    } catch (error) {
      throw this.errInternal
    }

    if (response.status === 200) {
      identity = response.data
      identity.publicKeys = response.data.public_keys
      delete identity.public_keys
    } else if (response.status === 401) {
      throw this.errUnauthorized
    } else if (response.status === 404) {
      throw this.errUnexistingIdentity
    }

    return identity
  }
}
