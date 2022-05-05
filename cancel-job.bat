@echo off

call near call dao-dashboard.cryptosketches.testnet cancel_job "{""job_id"": ""%1""}" --accountId cryptosketches.testnet  --gas 100000000000000  --deposit 0.001
call near view dao-dashboard.cryptosketches.testnet get_dao "{""dao_owner"": ""cryptosketches.testnet""}"