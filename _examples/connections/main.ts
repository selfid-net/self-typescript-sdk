async function manageConnections(appID, appSecret, connection) {
    const SelfSDK = require("../../src/self-sdk.ts");
    const sdk = await SelfSDK.build( "109a21fdd1bfaffa2717be1b4edb57e9", "RmfQdahde0n5SSk1iF4qA2xFbm116RNjjZe47Swn1s4", "random");

    let success = await sdk.messaging().permitConnection("35918759412")
    if(!success) {
        throw new Error("problem permitting connection")
    }


    let connections = await sdk.messaging().allowedConnections()
    console.log("Allowed connections are:")
    console.log(connections)


    success = await sdk.messaging().revokeConnection("35918759412")
    if(!success) {
        throw new Error("problem revoking connection")
    }

    connections = await sdk.messaging().allowedConnections()
    console.log("Allowed connections are:")
    console.log(connections)
}

async function main() {
    console.log("managing connections")
    await manageConnections("109a21fdd1bfaffa2717be1b4edb57e9", "RmfQdahde0n5SSk1iF4qA2xFbm116RNjjZe47Swn1s4", "35918759412");
    console.log("managing done")
}

main();



