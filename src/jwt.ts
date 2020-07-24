import { v4 as uuidv4 } from 'uuid';
import {NTPClient} from 'ntpclient';


const _sodium = require('libsodium-wrappers');

export default class Jwt {
    appID: string
    appKey: string
    sodium: any
    keypair: any
    date: any
    ntpSynchronization: any
    diffDates: any

    constructor() {
        this.appID = ""
        this.appKey = ""
    }


    public static async build(appID: string, appKey: string): Promise<Jwt>{
        let jwt = new Jwt;
        jwt.appID = appID
        jwt.appKey = appKey;

        await Promise.all([jwt.ntpsync(), _sodium.ready]);

        jwt.sodium = _sodium;

        let seed = jwt.sodium.from_base64(jwt.appKey, jwt.sodium.base64_variants.ORIGINAL_NO_PADDING)
        jwt.keypair = jwt.sodium.crypto_sign_seed_keypair(seed)
        jwt.ntpSynchronization = setInterval(jwt.ntpsync, 50000);

        return jwt
    }


    public authToken(): string {
        let header = this.header()
        let fiveMins = 5*60*1000
        let anHour = 60*60*1000

        let now = this.now()
        let jsonBody = JSON.stringify({
            jti: uuidv4(),
            iat: Math.floor((now - fiveMins) / 1000),
            exp: Math.floor((now + anHour) / 1000),
            iss: this.appID,
            typ: 'api-token'
        })
        let body = this.encode(jsonBody)

        let payload = `${header}.${body}`
        let signature = this.sign(payload)

        return `${payload}.${signature}`
    }

    public prepare(input: any) {
        let jsonBody = JSON.stringify(input)
        let body = this.encode(jsonBody)

        let payload = `${this.header()}.${body}`
        let signature = this.sign(payload)

        return this.encode(JSON.stringify({
            payload: body,
            protected: this.header(),
            signature: signature
          }))
    }

    public sign(input: string) {
        let signature = this.sodium.crypto_sign_detached(input, this.keypair.privateKey)
        return this.sodium.to_base64(signature, this.sodium.base64_variants.URLSAFE_NO_PADDING)
    }

    public verify(input: string, pk: any) {
        let parts = input.split(".")
        let msg = `${parts[0]}.${parts[1]}`
        let sig = this.sodium.from_base64(parts[2], this.sodium.base64_variants.URLSAFE_NO_PADDING)

        return this.sodium.crypto_sign_verify_detached(sig, msg, pk)
    }

    public now() {
        return this.diffDates = (new Date()).valueOf() - this.diffDates
    }

    public stop() {
        clearInterval(this.ntpSynchronization)
    }

    private async ntpsync(): Promise<void | Date> {
        return new NTPClient({
            server: 'time.google.com',
            port: 123,
            replyTimeout: 40 * 1000, // 40 seconds
          })
            .getNetworkTime()
            .then(date => {
                this.diffDates = (new Date()).valueOf() - date.valueOf()
            })
            .catch(err => console.error(err));
    }

    private header() {
        return this.encode(`{"alg":"EdDSA","typ":"JWT"}`)
    }

    encode(input: string) {
        return this.sodium.to_base64(input, this.sodium.base64_variants.URLSAFE_NO_PADDING)
    }
}