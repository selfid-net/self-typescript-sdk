// Copyright 2020 Self Group Ltd. All Rights Reserved.

import at from './attestation'

const fact = {
  fact: 'phone_number',
  operator: '==',
  expected_value: '22',
  sources: ['passport'],
  attestations: [at]
}

export default fact
