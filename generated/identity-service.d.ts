import Jwt from './jwt';
declare type PublicKey = {
    id: number;
    key: string;
};
declare type Identity = {
    id: string;
    publicKeys: PublicKey[];
};
export default class IdentityService {
    jwt: Jwt;
    readonly errUnauthorized: Error;
    readonly errUnexistingIdentity: Error;
    readonly errInternal: Error;
    constructor(jwt: Jwt);
    devices(selfid: string): Promise<string[]>;
    publicKeys(selfid: string): Promise<PublicKey[]>;
    get(selfid: string): Promise<Identity>;
}
export {};
