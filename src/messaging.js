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
var auth_pb_1 = require("../generated/auth_pb");
var msgtype_pb_1 = require("../generated/msgtype_pb");
var message_pb_1 = require("../generated/message_pb");
var Messaging = /** @class */ (function () {
    function Messaging(url, jwt, is) {
        var _this = this;
        console.log('creating messaging');
        this.jwt = jwt;
        this.url = url;
        this.requests = new Map();
        this.connected = false;
        this.is = is;
        var WebSocket = require('ws');
        this.ws = new WebSocket('wss://messaging.review.selfid.net/v1/messaging');
        this.ws.onopen = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.connected = true;
                return [2 /*return*/];
            });
        }); };
        this.ws.onclose = function () {
            console.log('disconnected');
        };
        this.ws.onmessage = function (input) { return __awaiter(_this, void 0, void 0, function () {
            var msg, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        msg = message_pb_1.Message.deserializeBinary(input.data);
                        console.log("received " + msg.getId() + " (" + msg.getType() + ")");
                        _a = msg.getType();
                        switch (_a) {
                            case msgtype_pb_1.MsgType.ERR: return [3 /*break*/, 1];
                            case msgtype_pb_1.MsgType.ACK: return [3 /*break*/, 2];
                            case msgtype_pb_1.MsgType.ACL: return [3 /*break*/, 3];
                            case msgtype_pb_1.MsgType.MSG: return [3 /*break*/, 4];
                        }
                        return [3 /*break*/, 6];
                    case 1:
                        {
                            console.log("error processing " + msg.getId());
                            console.log(msg);
                            return [3 /*break*/, 7];
                        }
                        _b.label = 2;
                    case 2:
                        {
                            console.log("acknowledged " + msg.getId());
                            this.mark_as_acknowledged(msg.getId());
                            return [3 /*break*/, 7];
                        }
                        _b.label = 3;
                    case 3:
                        {
                            console.log("ACL " + msg.getId());
                            this.processIncommingACL(msg.getId(), msg.getRecipient());
                            return [3 /*break*/, 7];
                        }
                        _b.label = 4;
                    case 4:
                        console.log("message received " + msg.getId());
                        return [4 /*yield*/, this.processIncommingMessage(msg)];
                    case 5:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        {
                            console.log('invalid message');
                            return [3 /*break*/, 7];
                        }
                        _b.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        }); };
    }
    Messaging.build = function (url, jwt, is) {
        return __awaiter(this, void 0, void 0, function () {
            var ms;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ms = new Messaging(url, jwt, is);
                        console.log('waiting for connection');
                        return [4 /*yield*/, ms.wait_for_connection()];
                    case 1:
                        _a.sent();
                        console.log('connected');
                        return [4 /*yield*/, ms.authenticate()];
                    case 2:
                        _a.sent();
                        console.log('authenticated');
                        return [2 /*return*/, ms];
                }
            });
        });
    };
    Messaging.prototype.processIncommingMessage = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var ciphertext, payload, pks, r;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ciphertext = JSON.parse(Buffer.from(msg.getCiphertext_asB64(), 'base64').toString());
                        payload = JSON.parse(Buffer.from(ciphertext['payload'], 'base64').toString());
                        return [4 /*yield*/, this.is.publicKeys(payload.iss)];
                    case 1:
                        pks = _a.sent();
                        if (!this.jwt.verify(ciphertext, pks[0].key)) {
                            console.log("unverified message " + payload.cid);
                            return [2 /*return*/];
                        }
                        switch (payload.typ) {
                            case 'identities.facts.query.req': {
                                console.log('incoming fact request');
                                break;
                            }
                            case 'identities.facts.query.resp': {
                                console.log('incoming fact response');
                                break;
                            }
                            case 'identities.authenticate.resp': {
                                r = this.requests.get(payload.cid);
                                r.response = payload;
                                r.responded = true;
                                console.log("received " + payload.cid);
                                this.requests.set(payload.cid, r);
                                break;
                            }
                            case 'identities.authenticate.req': {
                                console.log('incoming authentication request');
                                break;
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Messaging.prototype.processIncommingACL = function (id, msg) {
        console.log('processing acl response');
        var list = JSON.parse(msg);
        var req = this.requests.get(id);
        if (!req) {
            console.log('ACL request not found');
            return;
        }
        req.response = list;
        req.responded = true;
        req.acknowledged = true; // acls list does not respond with ACK
        this.requests.set(id, req);
        console.log('acl response processed');
    };
    Messaging.prototype.close = function () {
        this.ws.close();
    };
    Messaging.prototype.connect = function () {
        var WebSocket = require('ws');
        this.ws = new WebSocket('wss://messaging.review.selfid.net/v1/messaging');
    };
    Messaging.prototype.authenticate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var token, msg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('authenticating');
                        token = this.jwt.authToken();
                        msg = new auth_pb_1.Auth();
                        msg.setType(msgtype_pb_1.MsgType.AUTH);
                        msg.setId('authentication');
                        msg.setToken(token);
                        msg.setDevice(this.jwt.deviceID);
                        return [4 /*yield*/, this.send_and_wait(msg.getId(), {
                                data: msg.serializeBinary()
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Messaging.prototype.send_and_wait = function (id, request) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!request.acknowledged) {
                    request.acknowledged = false;
                }
                if (!request.waitForResponse) {
                    request.waitForResponse = false;
                }
                if (!request.responded) {
                    request.responded = false;
                }
                console.log(' -> sent ' + id);
                this.send(id, request);
                console.log(' -> waiting for ' + id);
                return [2 /*return*/, this.wait(id, request)];
            });
        });
    };
    Messaging.prototype.request = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.send_and_wait(id, {
                        data: data,
                        waitForResponse: true
                    })];
            });
        });
    };
    Messaging.prototype.send = function (id, request) {
        this.ws.send(request.data);
        this.requests.set(id, request);
    };
    Messaging.prototype.wait = function (id, request) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!request.waitForResponse) return [3 /*break*/, 2];
                        console.log('waiting for acknowledgement');
                        _a = request;
                        return [4 /*yield*/, this.wait_for_ack(id)];
                    case 1:
                        _a.acknowledged = _b.sent();
                        console.log('do not need to wait for response');
                        return [2 /*return*/, request.acknowledged];
                    case 2:
                        console.log('waiting for response');
                        return [4 /*yield*/, this.wait_for_response(id)];
                    case 3:
                        _b.sent();
                        console.log('responded');
                        console.log(request.response);
                        return [2 /*return*/, request.response];
                }
            });
        });
    };
    Messaging.prototype.wait_for_ack = function (id) {
        var _this = this;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var req;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.requests.has(id)) return [3 /*break*/, 2];
                        req = this.requests.get(id);
                        if (req && req.acknowledged) {
                            resolve(true);
                            return [3 /*break*/, 2];
                        }
                        return [4 /*yield*/, this.delay(100)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 0];
                    case 2:
                        resolve(true);
                        return [2 /*return*/];
                }
            });
        }); });
    };
    Messaging.prototype.wait_for_response = function (id) {
        var _this = this;
        console.log("waiting for response " + id);
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var req;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.requests.has(id)) return [3 /*break*/, 2];
                        req = this.requests.get(id);
                        if (req && req.response) {
                            resolve(req.response);
                            return [3 /*break*/, 2];
                        }
                        return [4 /*yield*/, this.delay(100)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 0];
                    case 2:
                        resolve();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    Messaging.prototype.wait_for_connection = function () {
        var _this = this;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.connected) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.delay(100)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 0];
                    case 2:
                        resolve(true);
                        return [2 /*return*/];
                }
            });
        }); });
    };
    Messaging.prototype.mark_as_acknowledged = function (id) {
        var req = this.requests.get(id);
        if (req) {
            req.acknowledged = true;
            this.requests.set(id, req);
        }
    };
    Messaging.prototype.delay = function (ms) {
        return new Promise(function (resolve) { return setTimeout(resolve, ms); });
    };
    return Messaging;
}());
exports["default"] = Messaging;
