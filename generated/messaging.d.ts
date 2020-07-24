import Jwt from './jwt';
interface Request {
    data: string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView;
    acknowledged?: boolean;
    waitForResponse?: boolean;
    responded?: boolean;
    response?: any;
}
export default class Messaging {
    url: string;
    jwt: Jwt;
    ws: WebSocket;
    connected: boolean;
    requests: Map<string, Request>;
    constructor(url: string, jwt: Jwt);
    private processIncommingACL;
    static build(url: string, jwt: Jwt): Promise<Messaging>;
    close(): void;
    private processIncommingMessage;
    private connect;
    private authenticate;
    send_and_wait(id: string, request: Request): Promise<Response | boolean>;
    request(id: string, data: string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView): Promise<Response | boolean>;
    private send;
    private wait;
    private wait_for_ack;
    private wait_for_response;
    private wait_for_connection;
    private mark_as_acknowledged;
    private delay;
}
export {};
