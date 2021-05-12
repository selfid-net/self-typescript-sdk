// Copyright 2020 Self Group Ltd. All Rights Reserved.

import IdentityService from '../../src/identity-service'
import { Recipient } from '../../src/crypto';

export default class EncryptionMock {
  client: IdentityService
  device: string
  storageKey: string
  storageFolder: string
  path: string
  account: Account

  public async encrypt(
    message: string,
    recipients: Recipient[],
  ): Promise<string> {
    const encode = (str: string): string => Buffer.from(str, 'binary').toString('base64')
    return encode(message)
  }

  public decrypt(message: string, sender: string, sender_device: string): string {
    return message
  }

  public accountPath(): string {
    return `/tmp/account.pickle`
  }

  public sessionPath(selfid: string, device: string): string {
    return `/tmp/random-session.pickle`
  }

  getInboundSessionWithBob(message: string, session_file_name: string): any {}
  async getOutboundSessionWithBob(recipient, recipientDevice, session_file_name: string): Promise<any> {}
}
