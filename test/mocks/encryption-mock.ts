// Copyright 2020 Self Group Ltd. All Rights Reserved.

import IdentityService from '../../src/identity-service'

export default class EncryptionMock {
  client: IdentityService
  device: string
  storageKey: string
  storageFolder: string
  path: string
  account: Account
  accountPickleFile: string

  public async encrypt(
    message: string,
    recipient: string,
    recipientDevice: string
  ): Promise<string> {
    return message
  }

  public decrypt(message: string, sender: string, sender_device: string): Promise<string> {
    return new Promise(resolve => {
      message
    })
  }
}
