// Copyright 2020 Self Group Ltd. All Rights Reserved.

import Attestation from './attestation'
import Jwt from './jwt'
import IdentityService from './identity-service'
import './sources'

export default class Fact {
  fact: string
  operator?: string
  expected_value?: string
  sources?: string[]
  attestations?: Attestation[]

  public static async parse(input: any, jwt: Jwt, is: IdentityService): Promise<Fact> {
    let f = new Fact()
    f.fact = input.fact
    f.operator = input.operator
    f.expected_value = input.expected_value

    f.sources = []
    if ('sources' in input) {
      f.sources = input.sources
    }

    f.attestations = []
    if ('attestations' in input) {
      for (const a of input.attestations) {
        f.attestations.push(await Attestation.parse(f.fact, a, jwt, is))
      }
    }

    return f
  }

  public isValid(): boolean {
    let errInvalidFactToSource = 'provided source does not support given fact'
    let errInvalidSource = 'provided fact does not specify a valid source'
    let errInvalidFactName = 'provided fact does not specify a name'

    if (this.fact == '') {
      console.log(errInvalidFactName)
      return false
    }

    let validSources = [
      SOURCE_USER_SPECIFIED,
      SOURCE_PASSPORT,
      SOURCE_DRIVING_LICENSE,
      SOURCE_IDENTITY_CARD
    ]
    let factsForPassport = [
      FACT_DOCUMENT_NUMBER,
      FACT_SURNAME,
      FACT_GIVEN_NAMES,
      FACT_DATE_OF_BIRTH,
      FACT_DATE_OF_EXPIRATION,
      FACT_SEX,
      FACT_NATIONALITY,
      FACT_COUNTRY_OF_ISSUANCE
    ]

    let factsForDL = [
      FACT_DOCUMENT_NUMBER,
      FACT_SURNAME,
      FACT_GIVEN_NAMES,
      FACT_DATE_OF_BIRTH,
      FACT_DATE_OF_ISSUANCE,
      FACT_DATE_OF_EXPIRATION,
      FACT_ADDRESS,
      FACT_ISSUING_AUTHORITY,
      FACT_PLACE_OF_BIRTH,
      FACT_COUNTRY_OF_ISSUANCE
    ]

    let factsForUser = [FACT_DOCUMENT_NUMBER, FACT_DISPLAY_NAME, FACT_EMAIL, FACT_PHONE]

    this.sources.forEach(s => {
      if (validSources.includes(s)) {
        throw new TypeError(errInvalidSource)
      }
      if (s == SOURCE_PASSPORT || s == SOURCE_IDENTITY_CARD) {
        if (!factsForPassport.includes(this.fact)) {
          console.log(errInvalidFactToSource)
          return false
        }
      }
      if (s == SOURCE_DRIVING_LICENSE) {
        if (!factsForDL.includes(this.fact)) {
          console.log(errInvalidFactToSource)
          return false
        }
      }
      if (s == SOURCE_USER_SPECIFIED) {
        if (!factsForUser.includes(this.fact)) {
          console.log(errInvalidFactToSource)
          return false
        }
      }
    })

    return true
  }
}
