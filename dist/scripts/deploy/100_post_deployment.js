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
var constants_1 = require("../constants");
var utils_1 = require("../utils");
// TODO: Shouldn't run setup methods if the contracts weren't redeployed.
var func = function (hre) { return __awaiter(void 0, void 0, void 0, function () {
    var deployments, ethers, authorityDeployment, quasDeployment, sQuasDeployment, gQuasDeployment, distributorDeployment, stakingDeployment, treasuryDeployment, bondingDepositoryDeployment, authorityContractFactory, quasContractFactory, sQuasContractFactory, gQuasContractFactory, distributorContractFactory, stakingContractFactory, treasuryContractFactory, authority, quas, sQuas, gQuas, distributor, staking, treasury;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                deployments = hre.deployments, ethers = hre.ethers;
                return [4 /*yield*/, deployments.get(constants_1.CONTRACTS.authority)];
            case 1:
                authorityDeployment = _a.sent();
                return [4 /*yield*/, deployments.get(constants_1.CONTRACTS.QUAS)];
            case 2:
                quasDeployment = _a.sent();
                return [4 /*yield*/, deployments.get(constants_1.CONTRACTS.sQUAS)];
            case 3:
                sQuasDeployment = _a.sent();
                return [4 /*yield*/, deployments.get(constants_1.CONTRACTS.gQUAS)];
            case 4:
                gQuasDeployment = _a.sent();
                return [4 /*yield*/, deployments.get(constants_1.CONTRACTS.distributor)];
            case 5:
                distributorDeployment = _a.sent();
                return [4 /*yield*/, deployments.get(constants_1.CONTRACTS.staking)];
            case 6:
                stakingDeployment = _a.sent();
                return [4 /*yield*/, deployments.get(constants_1.CONTRACTS.treasury)];
            case 7:
                treasuryDeployment = _a.sent();
                return [4 /*yield*/, deployments.get(constants_1.CONTRACTS.bondDepo)];
            case 8:
                bondingDepositoryDeployment = _a.sent();
                return [4 /*yield*/, ethers.getContractFactory(constants_1.CONTRACTS.authority)];
            case 9:
                authorityContractFactory = _a.sent();
                return [4 /*yield*/, ethers.getContractFactory(constants_1.CONTRACTS.QUAS)];
            case 10:
                quasContractFactory = _a.sent();
                return [4 /*yield*/, ethers.getContractFactory(constants_1.CONTRACTS.sQUAS)];
            case 11:
                sQuasContractFactory = _a.sent();
                return [4 /*yield*/, ethers.getContractFactory(constants_1.CONTRACTS.gQUAS)];
            case 12:
                gQuasContractFactory = _a.sent();
                return [4 /*yield*/, ethers.getContractFactory(constants_1.CONTRACTS.distributor)];
            case 13:
                distributorContractFactory = _a.sent();
                return [4 /*yield*/, ethers.getContractFactory(constants_1.CONTRACTS.staking)];
            case 14:
                stakingContractFactory = _a.sent();
                return [4 /*yield*/, ethers.getContractFactory(constants_1.CONTRACTS.treasury)];
            case 15:
                treasuryContractFactory = _a.sent();
                return [4 /*yield*/, authorityContractFactory.attach(authorityDeployment.address)];
            case 16:
                authority = _a.sent();
                return [4 /*yield*/, quasContractFactory.attach(quasDeployment.address)];
            case 17:
                quas = _a.sent();
                return [4 /*yield*/, sQuasContractFactory.attach(sQuasDeployment.address)];
            case 18:
                sQuas = _a.sent();
                return [4 /*yield*/, gQuasContractFactory.attach(gQuasDeployment.address)];
            case 19:
                gQuas = _a.sent();
                return [4 /*yield*/, distributorContractFactory.attach(distributorDeployment.address)];
            case 20:
                distributor = _a.sent();
                return [4 /*yield*/, stakingContractFactory.attach(stakingDeployment.address)];
            case 21:
                staking = _a.sent();
                return [4 /*yield*/, treasuryContractFactory.attach(treasuryDeployment.address)];
            case 22:
                treasury = _a.sent();
                // Step 1: Set treasury as vault on authority
                console.log("Setup -- authority.pushVault: set vault on authority");
                return [4 /*yield*/, (0, utils_1.waitSuccess)(authority.pushVault(treasury.address, true))];
            case 23:
                _a.sent();
                // Step 2: Set distributor as minter on treasury
                console.log("Setup -- treasury.enable(8):  distributor enabled to mint ohm on treasury");
                return [4 /*yield*/, (0, utils_1.waitSuccess)(treasury.enable(8, distributor.address, ethers.constants.AddressZero))];
            case 24:
                _a.sent(); // Allows distributor to mint ohm.
                // Step 3: Set distributor on staking
                console.log("Setup -- staking.setDistributor:  distributor set on staking");
                return [4 /*yield*/, (0, utils_1.waitSuccess)(staking.setDistributor(distributor.address))];
            case 25:
                _a.sent();
                // Step 4: Initialize sOHM and set the index
                console.log("Setup -- sQuas.setIndex(INITIAL_INDEX):  set index");
                return [4 /*yield*/, (0, utils_1.waitSuccess)(sQuas.setIndex(constants_1.INITIAL_INDEX))];
            case 26:
                _a.sent(); // TODO
                console.log("Setup -- setgQUAS(gQuas.address):  set gQUAS");
                return [4 /*yield*/, (0, utils_1.waitSuccess)(sQuas.setgQUAS(gQuas.address))];
            case 27:
                _a.sent();
                console.log("Setup -- sQuas.initialize(staking.address, treasury.address):  set sQUAS");
                return [4 /*yield*/, (0, utils_1.waitSuccess)(sQuas.initialize(staking.address, treasury.address))];
            case 28:
                _a.sent();
                // Step 5: Set up distributor with recipient
                console.log("Setup -- distributor.addRecipient");
                return [4 /*yield*/, (0, utils_1.waitSuccess)(distributor.addRecipient(staking.address, constants_1.INITIAL_REWARD_RATE))];
            case 29:
                _a.sent();
                // Approve staking contact to spend deployer's OHM
                // TODO: Is this needed?
                // await ohm.approve(staking.address, LARGE_APPROVAL);
                console.log("\n    Authority:         ".concat(authorityDeployment.address, "\n    QUAS:              ").concat(quasDeployment.address, "\n    sQUAS:             ").concat(sQuasDeployment.address, "\n    gQUAS:             ").concat(gQuasDeployment.address, "\n    Distributor:       ").concat(distributorDeployment.address, "\n    Staking:           ").concat(stakingDeployment.address, "\n    Treasury:          ").concat(treasuryDeployment.address, "\n    Bond Depository:   ").concat(bondingDepositoryDeployment.address, "\n\n    export AUTHORITY=").concat(authorityDeployment.address, "\n    export QUAS=").concat(quasDeployment.address, "\n    export SQUAS=").concat(sQuasDeployment.address, "\n    export GQUAS=").concat(gQuasDeployment.address, "\n    export DISTRIBUTOR=").concat(distributorDeployment.address, "\n    export STAKING=").concat(stakingDeployment.address, "\n    export TREASURY=").concat(treasuryDeployment.address, "\n    export DEPOSITORY=").concat(bondingDepositoryDeployment.address, "\n    "));
                return [2 /*return*/];
        }
    });
}); };
func.tags = ["setup"];
func.dependencies = [constants_1.CONTRACTS.QUAS, constants_1.CONTRACTS.sQUAS, constants_1.CONTRACTS.gQUAS];
func.skip = function () { return Promise.resolve(false); };
exports.default = func;
