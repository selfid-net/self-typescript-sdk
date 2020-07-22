interface Attestation {}
type MessageProcessor = (n: number) => any;


export default interface Fact {
    name: string
    operator: string
    expectedValue: string
    sources: string[]
    attestations: Attestation[]
}

export default class FactsService {
    DEFAULT_INTERMEDIARY = "self_intermediary"

    request(selfid: string, facts: Fact[], callback: MessageProcessor, opts?: { cid?: string, exp_timeout?: BigInteger }) {
        return true
    }

    requestViaIntermediary(selfid: string, facts: Fact[], callback: MessageProcessor, opts?: { cid?: string, exp_timeout?: BigInteger }) {
        return true
    }

    subscribe(callback: MessageProcessor) {
        return true
    }

    generateQR(facts: Fact[], opts?: { selfid?: string, cid?: string }) {
        return true
    }

    generateDeepLink(facts: Fact[], callback: MessageProcessor, opts?: { selfid?: string, cid?: string }) {
        return true
    }

}
