export default class Jwt {
    appID: string;
    appKey: string;
    sodium: any;
    keypair: any;
    date: any;
    ntpSynchronization: any;
    diffDates: any;
    constructor();
    static build(appID: string, appKey: string): Promise<Jwt>;
    authToken(): string;
    prepare(input: any): any;
    sign(input: string): any;
    verify(input: string, pk: any): any;
    now(): number;
    stop(): void;
    private ntpsync;
    private header;
    encode(input: string): any;
}
