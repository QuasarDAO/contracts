const { ethers } = require("hardhat");
const { getContractAddress } = require('@ethersproject/address')

async function waitSuccess(result) {
    console.log(`

    Transaction: ${result.hash}

    ⌛ Waiting for it to be processed...
    `)
    result = await result.wait()
    checkSuccess(result) 
}

function checkSuccess(result) {

    if (result.status === 1) {
        console.log(`✅ Transaction [${result.transactionHash}] was successful\n\n`)
    } else {
        console.log(`❌ Transaction [${result.transactionHash}] failed\n\n`)
        throw 'Transaction failed'
    }
}

async function deployContract(contractName, ...args) {
    console.log(`⌛ Deploying [${contractName}]...`);

    var contractAddress = await getNextContractAddress();

    const CONTRACT = await ethers.getContractFactory(contractName);
    
    var contract = await CONTRACT.deploy(...args); 
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

module.exports = {
    waitSuccess: waitSuccess,
    deployContract: deployContract
}
