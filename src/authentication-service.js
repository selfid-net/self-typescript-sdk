"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var uuid_1 = require("uuid");
var msgtype_pb_1 = require("../generated/msgtype_pb");
var message_pb_1 = require("../generated/message_pb");
var AuthenticationService = /** @class */ (function () {
    function AuthenticationService(jwt, ms, is) {
        this.defaultTimeout = 300 * 100;
        this.jwt = jwt;
        this.ms = ms;
        this.is = is;
    }
    AuthenticationService.prototype.request = function (selfid, callback, opts) {
        return __awaiter(this, void 0, void 0, function () {
            var id, options, cid, devices, iat, exp, j, ciphertext, msg, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("authenticating " + selfid);
                        id = uuid_1.v4();
                        options = opts ? opts : {};
                        cid = options.cid ? options.cid : uuid_1.v4();
                        return [4 /*yield*/, this.is.devices(selfid)
                            // Calculate expirations
                        ];
                    case 1:
                        devices = _a.sent();
                        iat = new Date(Math.floor(this.jwt.now()));
                        exp = new Date(Math.floor(this.jwt.now() + 300 * 60));
                        j = {
                            typ: 'identities.authenticate.req',
                            iss: this.jwt.appID,
                            sub: selfid,
                            aud: selfid,
                            iat: iat.toISOString(),
                            exp: exp.toISOString(),
                            cid: cid,
                            jti: uuid_1.v4()
                        };
                        ciphertext = this.jwt.prepare(j);
                        msg = new message_pb_1.Message();
                        msg.setType(msgtype_pb_1.MsgType.MSG);
                        msg.setId(id);
                        console.log(" - from : " + this.jwt.appID + ":" + this.jwt.deviceID);
                        msg.setSender(this.jwt.appID + ":" + this.jwt.deviceID);
                        console.log(" - to : " + selfid + ":" + devices[0]);
                        msg.setRecipient(selfid + ":" + devices[0]);
                        msg.setCiphertext(ciphertext);
                        console.log('requesting ' + msg.getId());
                        return [4 /*yield*/, this.ms.request(cid, msg.serializeBinary())];
                    case 2:
                        res = _a.sent();
                        return [2 /*return*/, (res.status === 'accepted')];
                }
            });
        });
    };
    AuthenticationService.prototype.generateQR = function (opts) {
        return true;
    };
    AuthenticationService.prototype.generateDeepLink = function (callback, opts) {
        return true;
    };
    AuthenticationService.prototype.subscribe = function (callback) {
        return true;
    };
    return AuthenticationService;
}());
exports["default"] = AuthenticationService;
