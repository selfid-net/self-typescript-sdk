// Copyright 2020 Self Group Ltd. All Rights Reserved.

import SignatureGraph from '../src/siggraph'

describe('signature graph', () => {
  it('should be valid single entry', async () => {
    const history = require('./__fixtures__/valid_single_entry.json')
    let sg = await SignatureGraph.build(history)

    let k = sg.keyByID('0')
    expect(k.kid).toEqual('0')
    expect('device-1').toEqual(k.did)
    expect('device.key').toEqual(k.type)
    expect(1598356708).toEqual(k.created)
    expect(0).toEqual(k.revoked)
    expect(false).toEqual(k.isRevoked())
    expect(true).toEqual(k.validAt(1598356709))
    expect(true).toEqual(k.validAt(1598356708))
    expect(false).toEqual(k.validAt(1598356707))
    expect(false).toEqual(k.publicKey == undefined)

    k = sg.keyByID('1')
    expect(k.kid).toEqual('1')
    expect(k.did).toEqual(undefined)
    expect('recovery.key').toEqual(k.type)
    expect(1598356708).toEqual(k.created)
    expect(0).toEqual(k.revoked)
    expect(false).toEqual(k.isRevoked())
    expect(true).toEqual(k.validAt(1598356709))
    expect(true).toEqual(k.validAt(1598356708))
    expect(false).toEqual(k.validAt(1598356707))
    expect(false).toEqual(k.publicKey == undefined)
  })

  it('should be valid_multi_entry', async () => {
    const history = require('./__fixtures__/valid_multi_entry.json')
    let sg = await SignatureGraph.build(history)

    let k = sg.keyByID('0')
    expect(k.kid).toEqual('0')
    expect('device-1').toEqual(k.did)
    expect('device.key').toEqual(k.type)
    expect(1598356708).toEqual(k.created)
    expect(0).toEqual(k.revoked)
    expect(false).toEqual(k.isRevoked())
    expect(true).toEqual(k.validAt(1598356709))
    expect(true).toEqual(k.validAt(1598356708))
    expect(false).toEqual(k.validAt(1598356707))
    expect(false).toEqual(k.publicKey == undefined)

    k = sg.keyByID('1')
    expect(k.kid).toEqual('1')
    expect(k.did).toEqual(undefined)
    expect('recovery.key').toEqual(k.type)
    expect(1598356708).toEqual(k.created)
    expect(0).toEqual(k.revoked)
    expect(false).toEqual(k.isRevoked())
    expect(true).toEqual(k.validAt(1598356709))
    expect(true).toEqual(k.validAt(1598356708))
    expect(false).toEqual(k.validAt(1598356707))
    expect(false).toEqual(k.publicKey == undefined)

    k = sg.keyByID('2')
    expect(k.kid).toEqual('2')
    expect(k.did).toEqual('device-2')
    expect('device.key').toEqual(k.type)
    expect(1598356709).toEqual(k.created)
    expect(1598356712).toEqual(k.revoked)
    expect(true).toEqual(k.isRevoked())
    expect(true).toEqual(k.validAt(1598356710))
    expect(true).toEqual(k.validAt(1598356709))
    expect(false).toEqual(k.validAt(1598356708))
    expect(false).toEqual(k.validAt(1598356712))
    expect(false).toEqual(k.validAt(1598356713))
    expect(false).toEqual(k.publicKey == undefined)

    k = sg.keyByID('3')
    expect(k.kid).toEqual('3')
    expect(k.did).toEqual('device-3')
    expect('device.key').toEqual(k.type)
    expect(1598356710).toEqual(k.created)
    expect(0).toEqual(k.revoked)
    expect(false).toEqual(k.isRevoked())
    expect(true).toEqual(k.validAt(1598356711))
    expect(true).toEqual(k.validAt(1598356710))
    expect(false).toEqual(k.validAt(1598356709))
    expect(false).toEqual(k.publicKey == undefined)

    k = sg.keyByID('4')
    expect(k.kid).toEqual('4')
    expect(k.did).toEqual('device-4')
    expect('device.key').toEqual(k.type)
    expect(1598356711).toEqual(k.created)
    expect(0).toEqual(k.revoked)
    expect(false).toEqual(k.isRevoked())
    expect(true).toEqual(k.validAt(1598356712))
    expect(true).toEqual(k.validAt(1598356711))
    expect(false).toEqual(k.validAt(1598356710))
    expect(false).toEqual(k.publicKey == undefined)

    k = sg.keyByID('5')
    expect(k.kid).toEqual('5')
    expect(k.did).toEqual('device-2')
    expect('device.key').toEqual(k.type)
    expect(1598356712).toEqual(k.created)
    expect(0).toEqual(k.revoked)
    expect(false).toEqual(k.isRevoked())
    expect(true).toEqual(k.validAt(1598356713))
    expect(true).toEqual(k.validAt(1598356712))
    expect(false).toEqual(k.validAt(1598356711))
    expect(false).toEqual(k.publicKey == undefined)
  })

  it('should be valid_multi_entry_with_recovery', async () => {
    const history = require('./__fixtures__/valid_multi_entry_with_recovery.json')
    let sg = await SignatureGraph.build(history)

    let k = sg.keyByID('0')
    expect(k.kid).toEqual('0')
    expect('device-1').toEqual(k.did)
    expect('device.key').toEqual(k.type)
    expect(1598356708).toEqual(k.created)
    expect(1598356713).toEqual(k.revoked)
    expect(true).toEqual(k.isRevoked())
    expect(true).toEqual(k.validAt(1598356709))
    expect(true).toEqual(k.validAt(1598356708))
    expect(false).toEqual(k.validAt(1598356707))
    expect(false).toEqual(k.publicKey == undefined)

    k = sg.keyByID('1')
    expect(k.kid).toEqual('1')
    expect(undefined).toEqual(k.did)
    expect('recovery.key').toEqual(k.type)
    expect(1598356708).toEqual(k.created)
    expect(1598356713).toEqual(k.revoked)
    expect(true).toEqual(k.isRevoked())
    expect(true).toEqual(k.validAt(1598356709))
    expect(true).toEqual(k.validAt(1598356708))
    expect(false).toEqual(k.validAt(1598356707))
    expect(false).toEqual(k.publicKey == undefined)

    k = sg.keyByID('2')
    expect(k.kid).toEqual('2')
    expect('device-2').toEqual(k.did)
    expect('device.key').toEqual(k.type)
    expect(1598356709).toEqual(k.created)
    expect(1598356712).toEqual(k.revoked)
    expect(true).toEqual(k.isRevoked())
    expect(true).toEqual(k.validAt(1598356710))
    expect(true).toEqual(k.validAt(1598356709))
    expect(false).toEqual(k.validAt(1598356708))
    expect(false).toEqual(k.validAt(1598356712))
    expect(false).toEqual(k.validAt(1598356713))
    expect(false).toEqual(k.publicKey == undefined)

    k = sg.keyByID('3')
    expect(k.kid).toEqual('3')
    expect('device-3').toEqual(k.did)
    expect('device.key').toEqual(k.type)
    expect(1598356710).toEqual(k.created)
    expect(1598356713).toEqual(k.revoked)
    expect(true).toEqual(k.isRevoked())
    expect(true).toEqual(k.validAt(1598356711))
    expect(true).toEqual(k.validAt(1598356710))
    expect(false).toEqual(k.validAt(1598356709))
    expect(false).toEqual(k.publicKey == undefined)

    k = sg.keyByID('4')
    expect(k.kid).toEqual('4')
    expect('device-4').toEqual(k.did)
    expect('device.key').toEqual(k.type)
    expect(1598356711).toEqual(k.created)
    expect(1598356713).toEqual(k.revoked)
    expect(true).toEqual(k.isRevoked())
    expect(true).toEqual(k.validAt(1598356712))
    expect(true).toEqual(k.validAt(1598356711))
    expect(false).toEqual(k.validAt(1598356710))
    expect(false).toEqual(k.publicKey == undefined)

    k = sg.keyByID('5')
    expect(k.kid).toEqual('5')
    expect('device-2').toEqual(k.did)
    expect('device.key').toEqual(k.type)
    expect(1598356712).toEqual(k.created)
    expect(1598356713).toEqual(k.revoked)
    expect(true).toEqual(k.isRevoked())
    expect(true).toEqual(k.validAt(1598356712))
    expect(false).toEqual(k.validAt(1598356711))
    expect(false).toEqual(k.publicKey == undefined)

    k = sg.keyByID('6')
    expect(k.kid).toEqual('6')
    expect('device-1').toEqual(k.did)
    expect('device.key').toEqual(k.type)
    expect(1598356713).toEqual(k.created)
    expect(0).toEqual(k.revoked)
    expect(false).toEqual(k.isRevoked())
    expect(true).toEqual(k.validAt(1598356714))
    expect(true).toEqual(k.validAt(1598356713))
    expect(false).toEqual(k.validAt(1598356712))
    expect(false).toEqual(k.publicKey == undefined)

    k = sg.keyByID('7')
    expect(k.kid).toEqual('7')
    expect(undefined).toEqual(k.did)
    expect('recovery.key').toEqual(k.type)
    expect(1598356713).toEqual(k.created)
    expect(0).toEqual(k.revoked)
    expect(false).toEqual(k.isRevoked())
    expect(true).toEqual(k.validAt(1598356714))
    expect(true).toEqual(k.validAt(1598356713))
    expect(false).toEqual(k.validAt(1598356712))
    expect(false).toEqual(k.publicKey == undefined)
  })

  it('should be invalid_sequence_ordering', async () => {
    const history = require('./__fixtures__/invalid_sequence_ordering.json')
    await expect(SignatureGraph.build(history)).rejects.toThrowError(
      'operation sequence is out of order'
    )
  })

  it('should be test_invalid_timestamp', async () => {
    const history = require('./__fixtures__/invalid_timestamp.json')
    await expect(SignatureGraph.build(history)).rejects.toThrowError(
      'operation timestamp occurs before previous operation'
    )
  })

  it('should be test_invalid_previous_signature', async () => {
    const history = require('./__fixtures__/invalid_previous_signature.json')
    await expect(SignatureGraph.build(history)).rejects.toThrowError(
      'operation previous signature does not match'
    )
  })

  it('should be test_invalid_duplicate_key_identifier', async () => {
    const history = require('./__fixtures__/invalid_duplicate_key_identifier.json')
    await expect(SignatureGraph.build(history)).rejects.toThrowError(
      'operation contains a key with a duplicate identifier'
    )
  })

  it('should be invalid_no_active_keys', async () => {
    const history = require('./__fixtures__/invalid_no_active_keys.json')
    await expect(SignatureGraph.build(history)).rejects.toThrowError(
      'signature graph does not contain any active or valid keys'
    )
  })

  it('should be invalid_no_active_recovery_keys', async () => {
    const history = require('./__fixtures__/invalid_no_active_recovery_keys.json')
    await expect(SignatureGraph.build(history)).rejects.toThrowError(
      'signature graph does not contain a valid recovery key'
    )
  })

  it('should be invalid_multiple_recovery_keys', async () => {
    const history = require('./__fixtures__/invalid_multiple_recovery_keys.json')
    await expect(SignatureGraph.build(history)).rejects.toThrowError(
      'operation contains more than one active recovery key'
    )
  })

  it('should be invalid_multiple_device_keys', async () => {
    const history = require('./__fixtures__/invalid_multiple_device_keys.json')
    await expect(SignatureGraph.build(history)).rejects.toThrowError(
      'operation contains more than one active key for a device'
    )
  })

  it('should be invalid_revoked_key_creation', async () => {
    const history = require('./__fixtures__/invalid_revoked_key_creation.json')
    await expect(SignatureGraph.build(history)).rejects.toThrowError(
      'operation was signed by a key that was revoked at the time of signing'
    )
  })

  it('should be invalid_signing_key', async () => {
    const history = require('./__fixtures__/invalid_signing_key.json')
    await expect(SignatureGraph.build(history)).rejects.toThrowError(
      'operation specifies a signing key that does not exist'
    )
  })

  it('should be invalid_recovery_no_revoke', async () => {
    const history = require('./__fixtures__/invalid_recovery_no_revoke.json')
    await expect(SignatureGraph.build(history)).rejects.toThrowError(
      'account recovery operation does not revoke the current active recovery key'
    )
  })

  it('should be invalid_empty_actions', async () => {
    const history = require('./__fixtures__/invalid_empty_actions.json')
    await expect(SignatureGraph.build(history)).rejects.toThrowError(
      'operation does not specify any actions'
    )
  })

  it('should be invalid_already_revoked_key', async () => {
    const history = require('./__fixtures__/invalid_already_revoked_key.json')
    await expect(SignatureGraph.build(history)).rejects.toThrowError(
      'operation tries to revoke a key that has already been revoked'
    )
  })

  it('should be invalid_key_reference', async () => {
    const history = require('./__fixtures__/invalid_key_reference.json')
    await expect(SignatureGraph.build(history)).rejects.toThrowError(
      'operation tries to revoke a key that does not exist'
    )
  })

  it('should be invalid_root_operation_key_revocation', async () => {
    const history = require('./__fixtures__/invalid_root_operation_key_revocation.json')
    await expect(SignatureGraph.build(history)).rejects.toThrowError(
      'root operation cannot revoke keys'
    )
  })
  it('should be invalid_operation_signature', async () => {
    const history = require('./__fixtures__/invalid_operation_signature.json')
    await expect(SignatureGraph.build(history)).rejects.toThrowError(
      'signature verification failed!'
    )
  })
  it('should be invalid_operation_signature_root', async () => {
    const history = require('./__fixtures__/invalid_operation_signature_root.json')
    await expect(SignatureGraph.build(history)).rejects.toThrowError(
      'signature verification failed!'
    )
  })

  it('should be invalid_revocation_before_root_operation_timestamp', async () => {
    const history = require('./__fixtures__/invalid_revocation_before_root_operation_timestamp.json')
    await expect(SignatureGraph.build(history)).rejects.toThrowError(
      'operation was signed with a key that was revoked'
    )
  })
})
