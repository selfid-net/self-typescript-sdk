import Jwt from './jwt';
import IdentityService from './identity-service';
export interface Request {
    [details: string]: any;
}
export interface ACLRule {
    [source: string]: Date;
}
export default class MessagingService {
    is: IdentityService;
    ms: any;
    constructor(url: string, jwt: Jwt, is: IdentityService);
    static build(url: string, jwt: Jwt, is: IdentityService): Promise<MessagingService>;
    subscribe(type: string, callback: any): boolean;
    permitConnection(selfid: string): Promise<boolean>;
    close(): void;
    allowedConnections(): Promise<ACLRule[]>;
    revokeConnection(selfid: string): Promise<boolean>;
    deviceID(): string;
    send(recipient: string, request: Request): boolean;
    notify(recipient: string, message: string): boolean;
}
