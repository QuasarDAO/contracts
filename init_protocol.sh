npx hardhat deploy --network localhost --reset
npx hardhat run ./scripts/deploy_mock_dai.ts --network localhost
# npx hardhat run ./scripts/mint_mock_dai.ts --network localhost
npx hardhat run ./scripts/add_new_reserve_token.ts --network localhost
npx hardhat run ./scripts/add_deployer_as_reserve_depositor.ts --network localhost
npx hardhat run ./scripts/deposit_in_treasury.ts --network localhost
npx hardhat run ./scripts/add_bond.ts --network localhost
# npx hardhat run ./scripts/add_reserve_depositor.ts --network localhost
npx hardhat run ./scripts/add_reward_manager.ts --network localhost
npx hardhat run ./scripts/set_interval_mining.ts --network localhost

# ido
npx hardhat run ./scripts/ido_initialize.ts --network localhost
npx hardhat run ./scripts/ido_set_stage.ts --network localhost
npx hardhat run ./scripts/ido_push_whitelisted.ts --network localhost
