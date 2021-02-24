import fs from 'fs'

import IdentityService from './identity-service'
import crypto from 'self-crypto'

export default class Crypto {
  client: any
  device: string
  storage_key: string
  storage_folder: string
  path: string
  account: Account

  constructor(
    client: IdentityService,
    device: string,
    storage_folder: string,
    storage_key: string
  ) {
    this.client = client
    this.device = device
    this.storage_folder = storage_folder
    this.storage_key = storage_key

    let pickle_file = `${storage_folder}/account.pickle`
    if (fs.existsSync(pickle_file)) {
      // 1a) if alice's account file exists load the pickle from the file
      // @account = SelfCrypto::Account.from_pickle(File.read('account.pickle'), @storage_key)
      let account = crypto.unpickle_account(pickle_file)
    } else {
      // 1b-i) if create a new account for alice if one doesn't exist already
      // @account = SelfCrypto::Account.from_seed(@client.jwt.key)
      let account = crypto.create_olm_account_derrived_keys(this.client.jwt.appKey)

      // 1b-ii) generate some keys for alice and publish them
      // @account.gen_otk(100)

      // 1b-iii) convert those keys to json
      // keys = @account.otk['curve25519'].map{|k,v| {id: k, key: v}}.to_json

      // 1b-iv) post those keys to POST /v1/identities/<selfid>/devices/1/pre_keys/
      let keys: string[]
      this.client.postRaw(
        `${this.client.url}/v1/identities/${this.client.jwt.appID}/devices/1/pre_keys`,
        keys
      )
      // TODO: (@adriacidre) : do not save this file if the response is != 200

      // 1b-v) store the account to a file
      // File.write('account.pickle', @account.to_pickle(storage_key))
    }
  }

  public encrypt(message: string, recipient: string, recipient_device: string): string {
    let session_file_name = `${this.storage_folder}/${recipient}:${recipient_device}-session.pickle`

    if (fs.existsSync(session_file_name)) {
      // # 2a) if bob's session file exists load the pickle from the file
      // session_with_bob = SelfCrypto::Session.from_pickle(File.read(session_file_name), @storage_key)
    } else {
      // # 2b-i) if you have not previously sent or recevied a message to/from bob,
      // #       you must get his identity key from GET /v1/identities/bob/
      // ed25519_identity_key = @client.public_keys(recipient).first[:key]
      let ed25519_identity_key = this.client.publicKeys(recipient)[0].key

      // # 2b-ii) get a one time key for bob
      let one_time_key = this.client.getRaw(
        `${this.client.url}/v1/identities/${this.client.jwt.appID}/devices/${recipient_device}/pre_keys`
      ).key

      // # 2b-iii) convert bobs ed25519 identity key to a curve25519 key
      // curve25519_identity_key = SelfCrypto::Util.ed25519_pk_to_curve25519(ed25519_identity_key)

      // # 2b-iv) create the session with bob
      // session_with_bob = @account.outbound_session(curve25519_identity_key, one_time_key)

      // # 2b-v) store the session to a file
      // File.write(session_file_name, session_with_bob.to_pickle(@storage_key))
    }

    // # 3) create a group session and set the identity of the account youre using
    // gs = SelfCrypto::GroupSession.new("#{@client.jwt.id}:#{@device}")

    // # 4) add all recipients and their sessions
    // gs.add_participant("#{recipient}:#{recipient_device}", session_with_bob)

    // # 5) encrypt a message
    // gs.encrypt(message).to_s
    return message
  }

  public decrypt(message: string, sender: string, sender_device: string): string {
    let session_file_name = `${this.storage_folder}/${sender}:${sender_device}-session.pickle`

    if (fs.existsSync(session_file_name)) {
      // # 7a) if carol's session file exists load the pickle from the file
      // session_with_bob = SelfCrypto::Session.from_pickle(File.read(session_file_name), @storage_key)
    } else {
      // # 7b-i) if you have not previously sent or received a message to/from bob,
      // #       you should extract the initial message from the group message intended
      // #       for your account id.
      // m = SelfCrypto::GroupMessage.new(message.to_s).get_message("#{@client.jwt.id}:#{@device}")
      // # 7b-ii) use the initial message to create a session for bob or carol
      // session_with_bob = @account.inbound_session(m)
      // # 7b-iii) store the session to a file
      // File.write(session_file_name, session_with_bob.to_pickle(@storage_key))
    }

    // # 8) create a group session and set the identity of the account you're using
    // gs = SelfCrypto::GroupSession.new("#{@client.jwt.id}:#{@device}")

    // # 9) add all recipients and their sessions
    // gs.add_participant("#{sender}:#{sender_device}", session_with_bob)

    // # 10) decrypt the message ciphertext
    // gs.decrypt("#{sender}:#{sender_device}", message).to_s
    // end
    return message
  }
}
