// Copyright 2020 Self Group Ltd. All Rights Reserved.

import Jwt from './jwt'

/**
 * A PublicKey representation
 */
type PublicKey = {
  id: number
  key: string
}

/**
 * An identity object representing both apps and users.
 */
type Identity = {
  id: string
  publicKeys: PublicKey[]
}

/**
 * An app object representing both apps.
 */
type App = {
  id: string
  publicKeys: PublicKey[]
  name: string
  image: string
  paid_actions: boolean
  core: boolean
}

/**
 * A service to manage all requests against Self servers.
 */
export default class IdentityService {
  jwt: Jwt
  url: string

  readonly errUnauthorized = new Error("you're not authorized to interact with this identity")
  readonly errUnexistingIdentity = new Error('identity does not exist')
  readonly errInternal = new Error('internal error')

  /**
   * Creates an instance of IdentityService
   * @param jwt a valid Jwt object
   * @param url the url where the api is located
   */
  constructor(jwt: Jwt, url: string) {
    this.jwt = jwt
    this.url = url
  }

  /**
   * Returns a list of the device identifiers for a specific user.
   * @param selfid the user you want to query the devices.
   */
  async devices(selfid: string): Promise<string[]> {
    let devices: string[] = []
    let response: any

    try {
      const axios = require('axios').default

      const options = {
        headers: { Authorization: `Bearer ${this.jwt.authToken()}` }
      }

      response = await axios.get(`${this.url}/v1/identities/${selfid}/devices`, options)
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

  /**
   * Gets a list with the public keys for a specific user.
   * @param selfid the user's selfid you want the public keys.
   */
  async publicKeys(selfid: string): Promise<PublicKey[]> {
    let keys: any
    let response: any

    try {
      const axios = require('axios').default
      const options = {
        headers: { Authorization: `Bearer ${this.jwt.authToken()}` }
      }

      response = await axios.get(`${this.url}/v1/identities/${selfid}/public_keys`, options)
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

  /**
   * Gets the details of a specific identity.
   * @param selfid self identifier for the identity.
   */
  async get(selfid: string): Promise<Identity> {
    return <Promise<Identity>>this.getIdentity(selfid, 'identities')
  }

  /**
   * Gets the details of a specific app.
   * @param selfid self identifier for the app.
   */
  async app(selfid: string): Promise<App> {
    return <Promise<App>>this.getIdentity(selfid, 'apps')
  }

  private async getIdentity(selfid: string, typ: string): Promise<Identity | App> {
    let identity: any
    let response: any

    try {
      const axios = require('axios').default

      const options = {
        headers: { Authorization: `Bearer ${this.jwt.authToken()}` }
      }

      response = await axios.get(`${this.url}/v1/${typ}/${selfid}`, options)
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
