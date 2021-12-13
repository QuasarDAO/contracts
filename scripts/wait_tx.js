async function waitSuccess(result) {
    console.log(`

    Transaction: ${result.hash}

    🕑 Waiting for it to be processed...
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

module.exports = {
    waitSuccess: waitSuccess
}
