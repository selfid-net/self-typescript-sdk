# QR based authentication request

A Self user will be authenticated on your platform by scanning a QR code and accepting the authentication request on his phone.

As part of this process, you have to share the generated QR code with your users, and wait for a response

## Running this example

In order to run this example, you must have a valid app keypair. Self-keypairs are issued by [Self Developer portal](https://developer.joinself.com/) when you create a new app.

Once you have your valid `SELF_APP_ID` and `SELF_APP_SECRET` you can run this example with:

```bash
$ tsc main.ts && SELF_APP_ID=XXXXX SELF_APP_SECRET=XXXXXXXX SELF_USER_ID="<your_self_id>" node main.js
```

## Process diagram

This diagram shows how does a QR based authentication request process works internally.

![Diagram](https://static.joinself.com/images/authentication_qr_diagram.png)

1. Generate Self authentication request QR code
2. Share generated QR code with your user
3. The user scans the Self authentication request QR code
4. The user sends back a signed approved response
5. Self SDK verifies the response has been signed by the user based on its public keys.
6. Your app gets an approved verified auth response
