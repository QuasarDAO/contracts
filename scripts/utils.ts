const { ethers } = require("hardhat");
const { getContractAddress } = require('@ethersproject/address')
import { ContractReceipt, ContractTransaction } from "@ethersproject/contracts";

export async function waitSuccess(txPromise: Promise<ContractTransaction>): Promise<void> {
    const transaction = await txPromise;
    const result = await transaction.wait();
    checkSuccess(result);
}

function checkSuccess(result: ContractReceipt) {
    if (result.status === 1) {
        console.log(`✅ Transaction [${result.transactionHash}] was successful\n\n`)
    } else {
        console.log(`❌ Transaction [${result.transactionHash}] failed\n\n`)
        throw 'Transaction failed'
    }
}

async function deployContract(contractName: string, ...args: any[]) {
    console.log(`⌛ Deploying [${contractName}]...`);

    const contractAddress = await getNextContractAddress();

    const CONTRACT = await ethers.getContractFactory(contractName);
    
    let contract = await CONTRACT.deploy(...args); 
    await contract.deployed();
    contract = CONTRACT.attach(contractAddress);

    console.log(`✅ [${contractName}] adress: ${contract.address}\n`)
    return contract;
}

async function getNextContractAddress() {
    const [owner] = await ethers.getSigners()
    const transactionCount = await owner.getTransactionCount()

    return getContractAddress({
      from: owner.address,
      nonce: transactionCount
    })
}