import IdentityService from './identity-service'
import crypto from 'self-crypto'

export default class Crypto {
  client: any
  device: string
  storage_key: string
  storage_folder: string
  path: string
  account: Account
  account_pickle_file: string

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
    this.account_pickle_file = `${storage_folder}/account.pickle`

    const fs = require('fs')

    if (fs.existsSync(this.account_pickle_file)) {
      // 1a) if alice's account file exists load the pickle from the file
      this.account = crypto.unpickle_account(this.account_pickle_file, this.storage_key)
    } else {
      // 1b-i) if create a new account for alice if one doesn't exist already
      this.account = crypto.create_olm_account_derrived_keys(this.client.jwt.appKey)

      // 1b-ii) generate some keys for alice and publish them
      crypto.create_account_one_time_keys(this.account, 100)

      // 1b-iii) convert those keys to json
      let oneTimeKeys = JSON.parse(crypto.one_time_keys(this.account))

      let keys = Object.keys(oneTimeKeys['curve25519']).map(function (id) {
        return {id: id, key: oneTimeKeys['curve25519'][id]}
      });

      // 1b-iv) post those keys to POST /v1/identities/<selfid>/devices/1/pre_keys/
      this.client.postRaw(
        `${this.client.url}/v1/identities/${this.client.jwt.appID}/devices/1/pre_keys`,
        keys
      )
      // TODO: (@adriacidre) : do not save this file if the response is != 200
      // 1b-v) store the account to a file
      let pickle = crypto.pickle_account(this.account, this.storage_key)
      fs.writeFileSync(this.account_pickle_file, pickle, { mode: 0o600 })
    }
  }

  public encrypt(message: string, recipient: string, recipient_device: string): string {
    let session_file_name = `${this.storage_folder}/${recipient}:${recipient_device}-session.pickle`
    let session_with_bob

    const fs = require('fs')

    if (fs.existsSync(session_file_name)) {
      // 2a) if bob's session file exists load the pickle from the file
      let session = fs.readFileSync(session_file_name)
      session_with_bob = crypto.unpickle_session(session, this.storage_key)
    } else {
      // 2b-i) if you have not previously sent or recevied a message to/from bob,
      //       you must get his identity key from GET /v1/identities/bob/
      let ed25519_identity_key = this.client.publicKeys(recipient)[0].key

      // 2b-ii) get a one time key for bob
      let one_time_key = this.client.getRaw(
        `${this.client.url}/v1/identities/${this.client.jwt.appID}/devices/${recipient_device}/pre_keys`
      ).key

      // 2b-iii) convert bobs ed25519 identity key to a curve25519 key
      let curve25519_identity_key = crypto.ed25519_pk_to_curve25519(ed25519_identity_key)

      // 2b-iv) create the session with bob
      session_with_bob = crypto.create_oubound_session(this.account, curve25519_identity_key, one_time_key)

      // 2b-v) store the session to a file
      let pickle = crypto.pickle_session(session_with_bob, this.storage_key)
      fs.writeFileSync(session_file_name, pickle, { mode: 0o600 })
    }

    // 3) create a group session and set the identity of the account youre using
    let group_session = crypto.create_group_session(`${this.client.appID}:${this.client.deviceID}`)

    // 4) add all recipients and their sessions
    crypto.add_group_participant(group_session, `${recipient}:${recipient_device}`, session_with_bob)

    // 5) encrypt a message
    let ciphertext = crypto.group_encrypt(group_session, message)

    // 6) store the session to a file
    let pickle = crypto.pickle_session(session_with_bob, this.storage_key)
    fs.writeFileSync(session_file_name, pickle, { mode: 0o600 })

    return ciphertext
  }

  public decrypt(message: string, sender: string, sender_device: string): string {
    let session_file_name = `${this.storage_folder}/${sender}:${sender_device}-session.pickle`
    let session_with_bob

    const fs = require('fs')

    if (fs.existsSync(session_file_name)) {
      // 7a) if bobs's session file exists load the pickle from the file
      let session = fs.readFileSync(session_file_name)
      session_with_bob = crypto.unpickle_session(session, this.storage_key)
    } else {
      // 7b-i) if you have not previously sent or received a message to/from bob,
      //       you should extract the initial message from the group message intended
      //       for your account id.
      let group_message_json = JSON.parse(message)
      let one_time_message = group_message_json['recipients'][`${this.client.appID}:${this.client.deviceID}`]['ciphertext']

      // 7b-ii) use the initial message to create a session for bob or carol
      session_with_bob = crypto.create_inbound_session(this.account, one_time_message)

      // 7b-iii) store the session to a file
      let pickle = crypto.pickle_session(session_with_bob, this.storage_key)
      fs.writeFileSync(session_file_name, pickle, { mode: 0o600 })

      // 7c-i) remove the sessions prekey from the account
      crypto.remove_one_time_keys(this.account, session_with_bob)

      // 7d-i) publish new prekeys if the amount of remaining keys has fallen below a threshold
      let currentOneTimeKeys = JSON.parse(crypto.one_time_keys(this.account))

      if (Object.keys(currentOneTimeKeys['curve25519']).length < 10) {
        // 7d-ii) generate some keys for alice and publish them
        crypto.create_account_one_time_keys(this.account, 100)

        let oneTimeKeys = JSON.parse(crypto.one_time_keys(this.account))

        let keys: Array<any>

        Object.keys(oneTimeKeys['curve25519']).forEach(kid => {
          if (!(kid in currentOneTimeKeys)) {
            keys.push({id: kid, key: oneTimeKeys['curve25519'][kid]})
          }
        })

        // 7d-iii) post those keys to POST /v1/identities/<selfid>/devices/1/pre_keys/
        this.client.postRaw(
          `${this.client.url}/v1/identities/${this.client.jwt.appID}/devices/1/pre_keys`,
          keys
        )

        // TODO: (@adriacidre) : retry if the response is != 200
      }

      // 7e-i) save the account state
      let account_pickle = crypto.pickle_account(this.account, this.storage_key)
      fs.writeFileSync(this.account_pickle_file, account_pickle, { mode: 0o600 })
    }

    // 8) create a group session and set the identity of the account you're using
    let group_session = crypto.create_group_session(`${this.client.appID}:${this.client.deviceID}`)

    // 9) add all recipients and their sessions
    crypto.add_group_participant(group_session, `${sender}:${sender_device}`, session_with_bob)

    // 10) decrypt the message ciphertext
    let plaintextext = crypto.group_encrypt(group_session, `${sender}:${sender_device}`, message)

    // 11) store the session to a file
    let pickle = crypto.pickle_session(session_with_bob, this.storage_key)
    fs.writeFileSync(session_file_name, pickle, { mode: 0o600 })

    return plaintextext
  }
}
