import { v4 as uuidv4 } from 'uuid';


const _sodium = require('libsodium-wrappers');

export default class Jwt {
    appID: string
    appKey: string
    sodium: any
    keypair: any

    constructor(appID: string, appKey: string) {
        this.appID = appID
        this.appKey = appKey;
    }

    private async load() {
        if(this.sodium) {
            return
        }
        await _sodium.ready;
        this.sodium = _sodium;
        let seed = this.sodium.from_base64(this.appKey)
        this.keypair = this.sodium.crypto_sign_seed_keypair(seed)
    }

    async authToken() {
        let header = await this.header()
        let fiveMins = 5*60*1000
        let anHour = 60*60*1000

        // TODO : timestamps must be calculated within a NTP server
        let body = await this.encode(JSON.stringify({
            jti: uuidv4(),
            iat: Math.floor(Date.now() - fiveMins / 1000),
            exp: Math.floor(Date.now() + anHour / 1000),
            iss: this.appID
        }))

        let payload = `${header}.${body}`
        let signature = await this.sign(header + body)

        return `${payload}.${signature}`
    }

    private async sign(input: string) {
        try {
            await this.load()
            let signature = this.sodium.crypto_sign_detached(input, this.keypair.privateKey)
            return this.sodium.to_base64(signature, this.sodium.base64_variants.URLSAFE_NO_PADDING)
        } catch (error) {
            console.log(error)
        }
    }

    private async header() {
        return this.encode(`{"alg":"EdDSA","typ":"JWT"}`)
    }

    private async encode(input: string) {
        try {
            await this.load()
            return this.sodium.to_base64(input, this.sodium.base64_variants.URLSAFE_NO_PADDING)
        } catch (error) {
            console.log(error)
        }
    }


}