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
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitSuccess = void 0;
var ethers = require("hardhat").ethers;
var getContractAddress = require('@ethersproject/address').getContractAddress;
function waitSuccess(txPromise) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, txPromise
                        .then(function (tx) { return tx.wait(); })
                        .then(function (result) { return checkSuccess(result); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.waitSuccess = waitSuccess;
function checkSuccess(result) {
    if (result.status === 1) {
        console.log("\u2705 Transaction [".concat(result.transactionHash, "] was successful\n\n"));
    }
    else {
        console.log("\u274C Transaction [".concat(result.transactionHash, "] failed\n\n"));
        throw 'Transaction failed';
    }
}
function deployContract(contractName) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return __awaiter(this, void 0, void 0, function () {
        var contractAddress, CONTRACT, contract;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("\u231B Deploying [".concat(contractName, "]..."));
                    return [4 /*yield*/, getNextContractAddress()];
                case 1:
                    contractAddress = _a.sent();
                    return [4 /*yield*/, ethers.getContractFactory(contractName)];
                case 2:
                    CONTRACT = _a.sent();
                    return [4 /*yield*/, CONTRACT.deploy.apply(CONTRACT, args)];
                case 3:
                    contract = _a.sent();
                    return [4 /*yield*/, contract.deployed()];
                case 4:
                    _a.sent();
                    contract = CONTRACT.attach(contractAddress);
                    console.log("\u2705 [".concat(contractName, "] adress: ").concat(contract.address, "\n"));
                    return [2 /*return*/, contract];
            }
        });
    });
}
function getNextContractAddress() {
    return __awaiter(this, void 0, void 0, function () {
        var owner, transactionCount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ethers.getSigners()];
                case 1:
                    owner = (_a.sent())[0];
                    return [4 /*yield*/, owner.getTransactionCount()];
                case 2:
                    transactionCount = _a.sent();
                    return [2 /*return*/, getContractAddress({
                            from: owner.address,
                            nonce: transactionCount
                        })];
            }
        });
    });
}
