// Copyright 2020 Self Group Ltd. All Rights Reserved.

import SelfSDK from '../../src/self-sdk'
import { exit } from 'process';

async function request(appID: string, appSecret: string, selfID: string) {
    // const SelfSDK = require("self-sdk");
    const sdk = await SelfSDK.build( appID, appSecret, "random", {env: "review"});

    console.log("requesting facts through intermediary...")
    let res = await sdk.facts().requestViaIntermediary(selfID, [{
        fact: 'email_address',
        operator: '==',
        sources: ['user_specified'],
        expected_value: 'test@test.org'
    }])
    if(res.status === "unauthorized") {
        console.log("you are unauthorized to run this action")
    } else {
        console.log("your assertion is....")
        console.log(res.attestationValuesFor('email_address')[0])
    }

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



