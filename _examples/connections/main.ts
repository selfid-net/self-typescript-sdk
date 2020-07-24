import SelfSDK from '../../dist/lib/self-sdk.js'
import { exit } from 'process';

async function manageConnections(appID: string, appSecret: string, connection: string) {
    // const SelfSDK = require("../../src/self-sdk.ts");
    const sdk = await SelfSDK.build( appID, appSecret, "random", {env: "review"});

    console.log("\nPermitting connection "+connection)
    console.log("----------------------------")
    let success = await sdk.messaging().permitConnection(connection)
    if(!success) {
        throw new Error("problem permitting connection")
    }


    let connections = await sdk.messaging().allowedConnections()
    console.log("\nAllowed connections are:")
    console.log("----------------------------")
    console.log(connections)


    console.log("\nRevoking connection "+connection)
    console.log("----------------------------")
    success = await sdk.messaging().revokeConnection(connection)
    if(!success) {
        throw new Error("problem revoking connection")
    }

    connections = await sdk.messaging().allowedConnections()
    console.log("\nAllowed connections are:")
    console.log("----------------------------")
    console.log(connections)

    sdk.stop()
    exit();
}

async function main() {
    console.log("managing connections")
    let appID = process.env["SELF_APP_ID"]
    let appSecret = process.env["SELF_APP_SECRET"]
    let selfID = process.env["SELF_USER_ID"]

    // tsc main.ts && SELF_APP_ID="109a21fdd1bfaffa2717be1b4edb57e9" SELF_APP_SECRET="RmfQdahde0n5SSk1iF4qA2xFbm116RNjjZe47Swn1s4" SELF_USER_ID="35918759412" node main.js
    await manageConnections(appID, appSecret, selfID);
    console.log("managing done")
}

main();



