// Copyright 2020 Self Group Ltd. All Rights Reserved.

import SelfSDK from 'self-sdk'
import { exit } from 'process';

async function qrFactRequest(appID: string, appSecret: string, selfID: string) {
    const SelfSDK = require("self-sdk");
    const sdk = await SelfSDK.build( appID, appSecret, "random", {env: "review"});

    sdk.facts().subscribe((res: any): any => {
        console.log(res.attestationValuesFor('phone_number')[0])
        exit()
    })

    // Generate a QR code to authenticate
    let buf = sdk.facts().generateQR([{ fact: 'phone_number' }])

    const fs = require('fs').promises;
    await fs.writeFile('/tmp/qr.png', buf);
    console.log("Open /tmp/qr.png and scan it with your device")

    // Wait til the response is received
    const wait = (seconds) =>
        new Promise(resolve =>
            setTimeout(() => resolve(true), seconds * 1000)
    );
    await wait(30000)

    sdk.stop()
    exit()
}

async function main() {
    console.log("managing qr authentication")
    let appID = process.env["SELF_APP_ID"]
    let appSecret = process.env["SELF_APP_SECRET"]
    let selfID = process.env["SELF_USER_ID"]

    // tsc main.ts && SELF_APP_ID="109a21fdd1bfaffa2717be1b4edb57e9" SELF_APP_SECRET="RmfQdahde0n5SSk1iF4qA2xFbm116RNjjZe47Swn1s4" SELF_USER_ID="35918759412" node main.js
    await qrFactRequest(appID, appSecret, selfID);
}

main();



