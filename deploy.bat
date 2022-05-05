@echo off

call near call dao-dashboard.cryptosketches.testnet clear --accountId dao-dashboard.cryptosketches.testnet
call near delete dao-dashboard.cryptosketches.testnet cryptosketches.testnet

call near create-account dao-dashboard.cryptosketches.testnet --masterAccount cryptosketches.testnet

call near deploy dao-dashboard.cryptosketches.testnet .\res\dao_dashboard.wasm --initFunction new --initArgs "{""owner_id"": ""dao-dashboard.cryptosketches.testnet""}"