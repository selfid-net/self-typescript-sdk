// Copyright 2020 Self Group Ltd. All Rights Reserved.

import SelfSDK from '../../src/self-sdk'
import { exit } from 'process';

async function manageConnections(appID: string, appSecret: string, user: string) {
    // const SelfSDK = require("self-sdk");
    const sdk = await SelfSDK.build(appID, appSecret, "random", __dirname + "/.self_storage", {env: "review"});
    console.log("CONNECTIONS EXAMPLE")

    // Remove all existing connections
    let conns = await sdk.messaging().allowedConnections()
    console.log("List existing connections")
    console.log(" - connections : " + conns.join(","))

    
    // Block connections from *
    console.log("Block all connections")
    let success = await sdk.messaging().revokeConnection("*")
    if(!success) {
        throw new Error("problem revoking connection")
    }

    // List should be empty
    conns = await sdk.messaging().allowedConnections()
    console.log(" - connections : " + conns.join(","))
    
    // Allow connections from user
    console.log("Permit connections from a specific ID")
    success = await sdk.messaging().permitConnection(user)
    if(!success) {
        throw new Error("problem permitting connection")
    }
    conns = await sdk.messaging().allowedConnections()
    console.log(" - connections : " + conns.join(","))

    
    // Allow connections from *
    console.log("Permit all connections (replaces all other entries with a wildcard entry)")
    success = await sdk.messaging().permitConnection("*")
    if(!success) {
        throw new Error("problem permitting connection")
    }
    conns = await sdk.messaging().allowedConnections()
    console.log(" - connections : " + conns.join(","))
    console.log("")
    
    // Allow connections from user
    console.log("Permit connection from a specific ID (no change as the list already contains a wildcard entry)")
    success = await sdk.messaging().permitConnection(user)
    if(!success) {
        throw new Error("problem permitting connection")
    }
    conns = await sdk.messaging().allowedConnections()
    console.log(" - connections : " + conns.join(","))
    console.log("")

    sdk.stop()
    exit();
}

async function main() {
    console.log("managing connections")
    let appID = process.env["SELF_APP_ID"]
    let appSecret = process.env["SELF_APP_SECRET"]
    let selfID = process.env["SELF_USER_ID"]

    await manageConnections(appID, appSecret, selfID);
    console.log("managing done")
}

main();



