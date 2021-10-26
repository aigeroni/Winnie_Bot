#!/bin/bash
set -euxo pipefail

pwd
ls -la

yarn install && yarn build
yarn typeorm migration:run
yarn start:worker:goal
# yarn start:worker:challenge
yarn start