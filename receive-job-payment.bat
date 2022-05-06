@echo off

::call near call dao-dashboard.cryptosketches.testnet receive_job_payment "{""dao_owner"": ""cryptosketches.testnet"", ""job_id"": ""%1""}" --accountId nftuser1.cryptosketches.testnet  --gas 100000000000000 --deposit 0.001
call near call streaming-r-v2.dcversus.testnet withdraw "{""stream_ids"": [""%1""]}" --accountId nftuser1.cryptosketches.testnet  --gas 100000000000000 --depositYocto 1