const _sodium = require('libsodium-wrappers');

export default class Jwt {
    appID: string
    appKey: string

    constructor(appID: string, appKey: string) {
        this.appID = appID
        this.appKey = appKey;
    }

    do() {
        (async() => {
            await _sodium.ready;
            const sodium = _sodium;
            console.log("booo");

            let seed = sodium.from_base64(this.appKey)
            console.log(".....")
            console.log(seed.toString())
            console.log(".....")

            let keypair = sodium.crypto_sign_ed25519_pk_to_curve25519(seed)

            console.log("++++")
            console.log(keypair.toString())
            console.log("++++")

            console.log("end");
            });

    }


}