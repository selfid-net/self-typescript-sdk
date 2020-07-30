interface Attestation {
}
declare type MessageProcessor = (n: number) => any;
export default interface Fact {
    name: string;
    operator: string;
    expected_value: string;
    sources: string[];
    attestations: Attestation[];
}
export default class FactsService {
    DEFAULT_INTERMEDIARY: string;
    request(selfid: string, facts: Fact[], callback: MessageProcessor, opts?: {
        cid?: string;
        exp_timeout?: BigInteger;
    }): boolean;
    requestViaIntermediary(selfid: string, facts: Fact[], callback: MessageProcessor, opts?: {
        cid?: string;
        exp_timeout?: BigInteger;
    }): boolean;
    subscribe(callback: MessageProcessor): boolean;
    generateQR(facts: Fact[], opts?: {
        selfid?: string;
        cid?: string;
    }): boolean;
    generateDeepLink(facts: Fact[], callback: MessageProcessor, opts?: {
        selfid?: string;
        cid?: string;
    }): boolean;
}
export {};
