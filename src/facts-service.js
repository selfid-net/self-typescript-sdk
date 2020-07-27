"use strict";
exports.__esModule = true;
var FactsService = /** @class */ (function () {
    function FactsService() {
        this.DEFAULT_INTERMEDIARY = "self_intermediary";
    }
    FactsService.prototype.request = function (selfid, facts, callback, opts) {
        return true;
    };
    FactsService.prototype.requestViaIntermediary = function (selfid, facts, callback, opts) {
        return true;
    };
    FactsService.prototype.subscribe = function (callback) {
        return true;
    };
    FactsService.prototype.generateQR = function (facts, opts) {
        return true;
    };
    FactsService.prototype.generateDeepLink = function (facts, callback, opts) {
        return true;
    };
    return FactsService;
}());
exports["default"] = FactsService;
