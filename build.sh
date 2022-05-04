#!/bin/bash
TARGET="${CARGO_TARGET_DIR:-target}"
set -e
cd "$(dirname $0)"

cargo build --all --target wasm32-unknown-unknown --release
cp $TARGET/wasm32-unknown-unknown/release/kawaii_zoo_nft.wasm ./res/
cp $TARGET/wasm32-unknown-unknown/release/kawaii_zoo_game.wasm ./res/
