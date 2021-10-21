#!/bin/sh
set -euxo pipefail

yarn install
yarn build
yarn start:worker:goal
# yarn start:worker:challenge
yarn start