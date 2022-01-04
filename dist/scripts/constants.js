"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BOUNTY_AMOUNT = exports.INITIAL_MINT = exports.INITIAL_INDEX = exports.INITIAL_REWARD_RATE = exports.FIRST_EPOCH_TIME = exports.FIRST_EPOCH_NUMBER = exports.EPOCH_LENGTH_IN_SECONDS = exports.LARGE_APPROVAL = exports.TREASURY_TIMELOCK = exports.CONTRACTS = void 0;
exports.CONTRACTS = {
    authority: "QuasarAuthority",
    sQUAS: "sQuasarERC20Token",
    gQUAS: "gQuasarERC20Token",
    QUAS: "QuasarERC20Token",
    treasury: "QuasarTreasury",
    staking: "QuasarStaking",
    distributor: "Distributor",
    bondDepo: "QuasarBondDepository",
    teller: "BondTeller",
    bondingCalculator: "QuasarBondingCalculator",
    FRAX: "Frax",
    DAI: "DAI",
};
// Constructor Arguments
exports.TREASURY_TIMELOCK = 0;
// Constants
exports.LARGE_APPROVAL = "100000000000000000000000000000000";
exports.EPOCH_LENGTH_IN_SECONDS = "1800";
exports.FIRST_EPOCH_NUMBER = "767";
exports.FIRST_EPOCH_TIME = "1639430907";
exports.INITIAL_REWARD_RATE = "4000";
exports.INITIAL_INDEX = "45000000000";
exports.INITIAL_MINT = "6000000000000000";
exports.BOUNTY_AMOUNT = "100000000";
