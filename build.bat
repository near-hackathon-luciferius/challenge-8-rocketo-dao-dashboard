@echo off

cargo build --all --target wasm32-unknown-unknown --release
xcopy target\wasm32-unknown-unknown\release\dao_dashboard.wasm .\res\ /y
