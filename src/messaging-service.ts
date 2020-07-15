export interface Request {
    [details: string] : any;
}

export interface ACLRule {
    [source: string] : Date;
}

export default class MessagingService {
    subscribe(type: string, callback: MessageProcessor) {
        return true
    }

    permitConnection(selfid: string): boolean {
        return true
    }

    allowedConnections(): ACLRule[]{
        let connections:ACLRule[] = [];

        return connections;
    }

    revokeConnection(selfid: string): boolean {
        return true
    }

    deviceID(): string {
        return "1"
    }

    send(recipient: string, request: Request): boolean{
        return true
    }

    notify(recipient: string, message: string): boolean {
        return true
    }
}