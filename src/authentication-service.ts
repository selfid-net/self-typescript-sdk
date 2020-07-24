type MessageProcessor = (n: number) => any;

export default class AuthenticationService {
    request(selfid: string, callback?: MessageProcessor, opts?: { cid?: string }) {
        return true
    }

    generateQR(opts?: { selfid?: string, cid?: string }) {
        return true
    }

    generateDeepLink(callback: MessageProcessor, opts?: { selfid?: string, cid?: string }) {
        return true
    }

    subscribe(callback: MessageProcessor) {
        return true
    }
}
