import SelfSDK from 'self-sdk'
import { exit } from 'process';

async function request(appID: string, appSecret: string, selfID: string) {
    const SelfSDK = require("self-sdk");
    const sdk = await SelfSDK.build( appID, appSecret, "random", {env: "review"});

    console.log("requesting facts...")
    let res = await sdk.facts().request(selfID, [{ fact: 'phone_number' }])
    console.log(res.attestationValuesFor('phone_number')[0])

    sdk.stop()
    exit();
}

async function main() {
    let appID = process.env["SELF_APP_ID"]
    let appSecret = process.env["SELF_APP_SECRET"]
    let selfID = process.env["SELF_USER_ID"]

    await request(appID, appSecret, selfID);
}

main();



