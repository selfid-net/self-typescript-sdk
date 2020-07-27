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
// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
var authentication_service_1 = require("./authentication-service");
var facts_service_1 = require("./facts-service");
var identity_service_1 = require("./identity-service");
var messaging_service_1 = require("./messaging-service");
var jwt_1 = require("./jwt");
var messaging_1 = require("./messaging");
// ...
var SelfSDK = /** @class */ (function () {
    function SelfSDK(appID, appKey, storageKey, opts) {
        this.defaultBaseURL = 'https://api.selfid.net';
        this.defaultMessagingURL = 'wss://messaging.selfid.net/v1/messaging';
        this.appID = appID;
        this.appKey = appKey;
        this.storageKey = storageKey;
        this.baseURL = this.calculateBaseURL(opts);
        this.messagingURL = this.calculateMessagingURL(opts);
        // this.autoReconnect = opts?.autoReconnect ? opts?.autoReconnect : true;
    }
    SelfSDK.build = function (appID, appKey, storageKey, opts) {
        return __awaiter(this, void 0, void 0, function () {
            var sdk, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        sdk = new SelfSDK(appID, appKey, storageKey, opts);
                        _a = sdk;
                        return [4 /*yield*/, jwt_1["default"].build(appID, appKey)];
                    case 1:
                        _a.jwt = _c.sent();
                        sdk.factsService = new facts_service_1["default"]();
                        sdk.identityService = new identity_service_1["default"](sdk.jwt);
                        _b = sdk;
                        return [4 /*yield*/, messaging_1["default"].build(sdk.baseURL, sdk.jwt, sdk.identityService)];
                    case 2:
                        _b.ms = _c.sent();
                        sdk.messagingService = new messaging_service_1["default"](sdk.jwt, sdk.identityService, sdk.ms);
                        sdk.authenticationService = new authentication_service_1["default"](sdk.jwt, sdk.messagingService.ms, sdk.identityService);
                        return [2 /*return*/, sdk];
                }
            });
        });
    };
    SelfSDK.prototype.stop = function () {
        this.jwt.stop();
        this.messagingService.close();
    };
    SelfSDK.prototype.authentication = function () {
        return this.authenticationService;
    };
    SelfSDK.prototype.facts = function () {
        return this.factsService;
    };
    SelfSDK.prototype.identity = function () {
        return this.identityService;
    };
    SelfSDK.prototype.messaging = function () {
        return this.messagingService;
    };
    SelfSDK.prototype.calculateBaseURL = function (opts) {
        if (!opts) {
            return this.defaultBaseURL;
        }
        if (opts.baseURL) {
            return opts.baseURL;
        }
        if (opts.env) {
            return "https://api." + opts.env + ".selfid.net";
        }
        return this.defaultBaseURL;
    };
    SelfSDK.prototype.calculateMessagingURL = function (opts) {
        if (!opts) {
            return this.defaultMessagingURL;
        }
        if (opts.messagingURL) {
            return opts.messagingURL;
        }
        if (opts.env) {
            return "wss://messaging." + opts.env + ".selfid.net/v1/messaging";
        }
        return this.defaultMessagingURL;
    };
    return SelfSDK;
}());
exports["default"] = SelfSDK;
