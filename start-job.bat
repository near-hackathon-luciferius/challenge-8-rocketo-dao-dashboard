@echo off

call near call dao-dashboard.cryptosketches.testnet apply_for_job "{""dao_owner"": ""cryptosketches.testnet"", ""job_id"": ""%1"", ""application"": ""What a noce weather today. Right?""}" --accountId nftuser1.cryptosketches.testnet
call near call dao-dashboard.cryptosketches.testnet apply_for_job "{""dao_owner"": ""cryptosketches.testnet"", ""job_id"": ""%1"", ""application"": ""I'm the super user.""}" --accountId nft-example.cryptosketches.testnet
call near call dao-dashboard.cryptosketches.testnet start_job "{""job_id"": ""%1"", ""contracted"": ""nftuser1.cryptosketches.testnet""}" --accountId cryptosketches.testnet  --gas 100000000000000 --deposit 0.01
call near view dao-dashboard.cryptosketches.testnet get_dao "{""dao_owner"": ""cryptosketches.testnet""}"