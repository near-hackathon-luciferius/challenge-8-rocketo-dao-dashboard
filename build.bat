@echo off

cargo build --all --target wasm32-unknown-unknown --release
xcopy target\wasm32-unknown-unknown\release\dao-dashboard.wasm .\res\ /y
