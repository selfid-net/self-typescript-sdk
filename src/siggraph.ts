// Copyright 2020 Self Group Ltd. All Rights Reserved.
const ACTION_ADD = 'key.add'
const ACTION_REVOKE = 'key.revoke'
const KEY_TYPE_DEVICE = 'device.key'
const KEY_TYPE_RECOVERY = 'recovery.key'

type Action = {
  kid: string
  did: string
  type: string
  from: number
  key: string
  action: string
}

class Operation {
  sequence: any
  previous: any
  timestamp: any
  actions: Array<Action>
  version: string
  signingKey: string
  jws: string

  constructor(operation: any) {
    this.jws = operation

    let op = JSON.parse(Buffer.from(this.jws['payload'], 'base64').toString())
    let hdr = JSON.parse(Buffer.from(this.jws['protected'], 'base64').toString())

    this.sequence = op['sequence']
    this.previous = op['previous']
    this.timestamp = op['timestamp']
    this.version = op['version']
    this.actions = op['actions']
    this.signingKey = hdr['kid']

    this.validate()
  }

  validate() {
    if (this.version != '1.0.0') {
      throw new Error('unknown operation version')
    }
    if (this.sequence < 0) {
      throw new Error('invalid operation sequence')
    }
    if (this.previous == undefined) {
      throw new Error('operation does not specify a previous signature')
    }
    if (this.timestamp < 1) {
      throw new Error('invalid operation timestamp')
    }

    if (this.actions == undefined) {
      throw new Error('operation does not specify any actions')
    }
    if (this.actions.length < 1) {
      throw new Error('operation does not specify any actions')
    }
    if (this.signingKey == '') {
      throw new Error('operation does not specify an identifier for the signing key')
    }
  }

  revokes(kid: string): Boolean {
    for (var i = 0; i < this.actions.length; i++) {
      if (this.actions[i].kid == kid && this.actions[i].action == ACTION_REVOKE) {
        return true
      }
    }
    return false
  }
}

export class Key {
  kid: string
  did: string
  type: string
  created: number
  revoked: number
  publicKey: Key
  rawPublicKey: string
  incoming: Array<Key>
  outgoing: Array<Key>

  constructor(action: Action, sodium: any) {
    this.kid = action.kid
    this.did = action.did
    this.type = action.type
    this.created = action.from
    this.revoked = 0

    this.rawPublicKey = action.key
    this.publicKey = sodium.from_base64(
      this.rawPublicKey,
      sodium.base64_variants.URLSAFE_NO_PADDING
    )
    this.incoming = []
    this.outgoing = []
  }

  validAt(at: number): Boolean {
    return (this.created <= at && this.revoked == 0) || (this.created <= at && this.revoked > at)
  }

  revoke(at: number) {
    this.revoked = at
  }

  isRevoked(): boolean {
    return this.revoked > 0
  }

  childKeys(): Array<Key> {
    let keys = []
    keys = keys.concat(this.outgoing)

    for (var i = 0; i < this.outgoing.length; i++) {
      keys = keys.concat(this.outgoing[i].childKeys())
    }

    return keys
  }
}

export default class SignatureGraph {
  root: Key
  keys: Record<string, Key>
  devices: Record<string, Key>
  signatures: any
  operations: Array<Operation>
  recoveryKey: Key
  sodium: any

  constructor(history: Array<any>, sodium: any) {
    this.root = undefined
    this.keys = {}
    this.devices = {}
    this.signatures = {}
    this.operations = []
    this.recoveryKey = undefined
    this.sodium = sodium

    for (var i = 0; i < history.length; i++) {
      this.execute(history[i])
    }
  }

  public static async build(history: Array<any>): Promise<SignatureGraph> {
    const _sodium = require('libsodium-wrappers')
    await _sodium.ready
    const sodium = _sodium

    let sg = new SignatureGraph(history, sodium)
    return sg
  }

  keyByID(kid: string): Key {
    if (!(kid in this.keys)) {
      throw new Error('key not (kid:' + kid + ') found')
    }
    return this.keys[kid]
  }

  keyByDevice(did: string): Key {
    if (!(did in this.devices)) {
      throw new Error('key not (did:' + did + ') found')
    }
    return this.devices[did]
  }

  execute(operation) {
    let op = new Operation(operation)

    if (op.sequence != this.operations.length) {
      throw new Error('operation sequence is out of order')
    }

    if (op.sequence > 0) {
      if (this.signatures[op.previous] != op.sequence - 1) {
        throw new Error('operation previous signature does not match')
      }

      if (this.operations[op.sequence - 1].timestamp >= op.timestamp) {
        throw new Error('operation timestamp occurs before previous operation')
      }

      let sk = this.keys[op.signingKey]
      if (sk == undefined) {
        throw new Error('operation specifies a signing key that does not exist (A)')
      }

      if (sk.isRevoked() && op.timestamp > sk.revoked) {
        throw new Error('operation was signed by a key that was revoked at the time of signing')
      }

      if (sk.type == KEY_TYPE_RECOVERY && op.revokes(op.signingKey) == false) {
        throw new Error(
          'account recovery operation does not revoke the current active recovery key'
        )
      }
    }

    this.executeActions(op)
    let sk = this.keys[op.signingKey]

    if (op.timestamp < sk.created || (sk.isRevoked() && op.timestamp > sk.revoked)) {
      throw new Error('operation was signed with a key that was revoked')
    }

    let msg = `${op.jws['protected']}.${op.jws['payload']}`
    let sig = this.sodium.from_base64(
      op.jws['signature'],
      this.sodium.base64_variants.URLSAFE_NO_PADDING
    )
    if (this.sodium.crypto_sign_verify_detached(sig, msg, sk.publicKey) == false) {
      throw new Error('signature verification failed!')
    }

    let hasValidKey = false
    for (let k in this.keys) {
      if (!this.keys[k].isRevoked()) {
        hasValidKey = true
      }
    }

    if (!hasValidKey) {
      throw new Error('signature graph does not contain any active or valid keys')
    }
    if (this.recoveryKey == undefined) {
      throw new Error('signature graph does not contain a valid recovery key')
    }
    if (this.recoveryKey.isRevoked()) {
      throw new Error('signature graph does not contain a valid recovery key')
    }

    this.operations.push(op)
    this.signatures[op.jws['signature']] = op.sequence
  }

  private executeActions(op: Operation) {
    for (var i = 0; i < op.actions.length; i++) {
      let action = op.actions[i]
      if (action.kid == undefined) {
        throw new Error('operation action does not provide a key identifier')
      }

      if (action.type != KEY_TYPE_DEVICE && action.type != KEY_TYPE_RECOVERY) {
        throw new Error('operation action does not provide a valid type')
      }

      if (action.action != ACTION_ADD && action.action != ACTION_REVOKE) {
        throw new Error('operation action does not provide a valid action')
      }

      if (action.action == ACTION_ADD && action.key == undefined) {
        throw new Error('operation action does not provide a valid public key')
      }

      if (
        action.action == ACTION_ADD &&
        action.type == KEY_TYPE_DEVICE &&
        action.did == undefined
      ) {
        throw new Error('operation action does not provide a valid device id')
      }

      if (action.from < 0) {
        throw new Error(
          'operation action does not provide a valid timestamp for the action to take effect from'
        )
      }

      switch (action.action) {
        case ACTION_ADD:
          action.from = op.timestamp
          this.add(op, action)
          break
        case ACTION_REVOKE:
          this.revoke(op, action)
          break
      }
    }
  }

  private add(operation: Operation, action: Action) {
    if (action.kid in this.keys) {
      throw new Error('operation contains a key with a duplicate identifier')
    }

    let k = new Key(action, this.sodium)
    switch (action.type) {
      case KEY_TYPE_DEVICE:
        if (action.did in this.devices) {
          if (!this.devices[action.did].revoked) {
            throw new Error('operation contains more than one active key for a device')
          }
        }
        let dk = this.devices[action.did]
        break
      case KEY_TYPE_RECOVERY:
        if (this.recoveryKey != undefined) {
          if (!this.recoveryKey.isRevoked()) {
            throw new Error('operation contains more than one active recovery key')
          }
        }
        this.recoveryKey = k
        break
    }
    this.keys[k.kid] = k
    this.devices[k.did] = k

    if (operation.sequence == 0 && operation.signingKey == action.kid) {
      this.root = k
      return
    }

    if (!(operation.signingKey in this.keys)) {
      throw new Error('operation specifies a signing key that does not exist (B)')
    }
    let parent = this.keys[operation.signingKey]
    if (parent == undefined) {
      throw new Error('operation specifies a signing key that does not exist (C)')
    }

    k.incoming.push(parent)
    parent.outgoing.push(k)
  }

  private revoke(operation: Operation, action: Action) {
    if (!(action.kid in this.keys)) {
      throw new Error('operation tries to revoke a key that does not exist')
    }
    let k = this.keys[action.kid]
    if (k == undefined) {
      throw new Error('operation tries to revoke a key that does not exist')
    }
    if (operation.sequence < 1) {
      throw new Error('root operation cannot revoke keys')
    }
    if (k.isRevoked()) {
      throw new Error('operation tries to revoke a key that has already been revoked')
    }

    k.revoke(action.from)
    let sk = this.keys[operation.signingKey]

    if (!(operation.signingKey in this.keys)) {
      throw new Error('operation specifies a signing key that does not exist (D)')
    }
    if (sk == undefined) {
      throw new Error('operation specifies a signing key that does not exist (E)')
    }

    // if this is an account recovery, nuke all existing keys
    if (sk.type == KEY_TYPE_RECOVERY) {
      this.root.revoke(action.from)
      let cks = this.root.childKeys()
      for (var i = 0; i < cks.length; i++) {
        if (!cks[i].revoked) {
          cks[i].revoke(action.from)
        }
      }

      return
    }

    let cks = k.childKeys()
    for (var i = 0; i < cks.length; i++) {
      if (!(cks[i].created < action.from)) {
        cks[i].revoke(action.from)
      }
    }
  }
}
