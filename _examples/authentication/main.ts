// Copyright 2020 Self Group Ltd. All Rights Reserved.

import SelfSDK from 'self-sdk'
import { exit } from 'process';

async function authenticate(appID: string, appSecret: string, selfID: string) {
    const SelfSDK = require("self-sdk");
    const sdk = await SelfSDK.build( appID, appSecret, "random", {env: "review"});

    console.log("authentication")
    let authenticated = await sdk.authentication().request(selfID)
    if(authenticated) {
        console.log("User is now authenticated 🤘")
    } else {
        console.log("Authentication request has been rejected")
    }

    sdk.stop()
    exit();
}

async function main() {
    console.log("managing connections")
    let appID = process.env["SELF_APP_ID"]
    let appSecret = process.env["SELF_APP_SECRET"]
    let selfID = process.env["SELF_USER_ID"]

    // tsc main.ts && SELF_APP_ID="109a21fdd1bfaffa2717be1b4edb57e9" SELF_APP_SECRET="RmfQdahde0n5SSk1iF4qA2xFbm116RNjjZe47Swn1s4" SELF_USER_ID="35918759412" node main.js
    await authenticate(appID, appSecret, selfID);
}

main();



