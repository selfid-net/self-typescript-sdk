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
var ntpclient_1 = require("ntpclient");
var _sodium = require('libsodium-wrappers');
var Jwt = /** @class */ (function () {
    function Jwt() {
        this.appID = '';
        this.appKey = '';
        this.deviceID = '1';
    }
    Jwt.build = function (appID, appKey) {
        return __awaiter(this, void 0, void 0, function () {
            var jwt, seed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        jwt = new Jwt();
                        jwt.appID = appID;
                        jwt.appKey = appKey;
                        return [4 /*yield*/, Promise.all([jwt.ntpsync(), _sodium.ready])];
                    case 1:
                        _a.sent();
                        jwt.sodium = _sodium;
                        seed = jwt.sodium.from_base64(jwt.appKey, jwt.sodium.base64_variants.ORIGINAL_NO_PADDING);
                        jwt.keypair = jwt.sodium.crypto_sign_seed_keypair(seed);
                        jwt.ntpSynchronization = setInterval(jwt.ntpsync, 50000);
                        return [2 /*return*/, jwt];
                }
            });
        });
    };
    Jwt.prototype.authToken = function () {
        var header = this.header();
        var fiveMins = 5 * 60 * 1000;
        var anHour = 60 * 60 * 1000;
        var now = this.now();
        var jsonBody = JSON.stringify({
            jti: uuid_1.v4(),
            iat: Math.floor((now - fiveMins) / 1000),
            exp: Math.floor((now + anHour) / 1000),
            iss: this.appID,
            typ: 'api-token'
        });
        var body = this.encode(jsonBody);
        var payload = header + "." + body;
        var signature = this.sign(payload);
        return payload + "." + signature;
    };
    Jwt.prototype.prepare = function (input) {
        var jsonBody = JSON.stringify(input);
        var body = this.encode(jsonBody);
        var payload = this.header() + "." + body;
        var signature = this.sign(payload);
        return this.encode(JSON.stringify({
            payload: body,
            protected: this.header(),
            signature: signature
        }));
    };
    Jwt.prototype.sign = function (input) {
        var signature = this.sodium.crypto_sign_detached(input, this.keypair.privateKey);
        return this.sodium.to_base64(signature, this.sodium.base64_variants.URLSAFE_NO_PADDING);
    };
    Jwt.prototype.verify = function (input, pk) {
        var msg = input.protected + "." + input.payload;
        var sig = this.sodium.from_base64(input.signature, this.sodium.base64_variants.URLSAFE_NO_PADDING);
        var key = this.sodium.from_base64(pk, this.sodium.base64_variants.ORIGINAL_NO_PADDING);
        return this.sodium.crypto_sign_verify_detached(sig, msg, key);
    };
    Jwt.prototype.now = function () {
        return new Date().valueOf() - this.diffDates;
    };
    Jwt.prototype.stop = function () {
        clearInterval(this.ntpSynchronization);
    };
    Jwt.prototype.ntpsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new ntpclient_1.NTPClient({
                        server: 'time.google.com',
                        port: 123,
                        replyTimeout: 40 * 1000 // 40 seconds
                    })
                        .getNetworkTime()
                        .then(function (date) {
                        _this.diffDates = new Date().valueOf() - date.valueOf();
                    })["catch"](function (err) { return console.error(err); })];
            });
        });
    };
    Jwt.prototype.header = function () {
        return this.encode("{\"alg\":\"EdDSA\",\"typ\":\"JWT\"}");
    };
    Jwt.prototype.encode = function (input) {
        return this.sodium.to_base64(input, this.sodium.base64_variants.URLSAFE_NO_PADDING);
    };
    return Jwt;
}());
exports["default"] = Jwt;
