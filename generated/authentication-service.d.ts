declare type MessageProcessor = (n: number) => any;
export default class AuthenticationService {
    request(selfid: string, callback?: MessageProcessor, opts?: {
        cid?: string;
    }): boolean;
    generateQR(opts?: {
        selfid?: string;
        cid?: string;
    }): boolean;
    generateDeepLink(callback: MessageProcessor, opts?: {
        selfid?: string;
        cid?: string;
    }): boolean;
    subscribe(callback: MessageProcessor): boolean;
}
export {};
