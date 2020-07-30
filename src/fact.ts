import Attestation from './attestation'
import Jwt from './jwt'
import IdentityService from './identity-service'

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
}
