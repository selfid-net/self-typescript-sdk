import AuthenticationService from './authentication-service';
import FactsService from './facts-service';
import IdentityService from './identity-service';
import MessagingService from './messaging-service';
export default class SelfSDK {
    appID: string;
    appKey: string;
    storageKey: string;
    baseURL: string;
    messagingURL: string;
    autoReconnect: boolean;
    jwt: any;
    private authenticationService;
    private factsService;
    private identityService;
    private messagingService;
    defaultBaseURL: string;
    defaultMessagingURL: string;
    constructor(appID: string, appKey: string, storageKey: string, opts?: {
        baseURL?: string;
        messagingURL?: string;
        env?: string;
        autoReconnect?: boolean;
    });
    static build(appID: string, appKey: string, storageKey: string, opts?: {
        baseURL?: string;
        messagingURL?: string;
        env?: string;
        autoReconnect?: boolean;
    }): Promise<SelfSDK>;
    stop(): void;
    authentication(): AuthenticationService;
    facts(): FactsService;
    identity(): IdentityService;
    messaging(): MessagingService;
    private calculateBaseURL;
    private calculateMessagingURL;
}
