const { deployContract } = require("./utils.js")

async function main() {
    const dai = await deployContract('DAI', 0);

    const frax = await deployContract('FRAX', 0);

    console.log(`
        DAI:       ${dai.address}
        FRAX:      ${frax.address}

        export DAI=${dai.address}
        export FRAX=${frax.address}
    `);
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
