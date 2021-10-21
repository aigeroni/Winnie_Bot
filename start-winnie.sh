#!/bin/bash
set -euxo pipefail

yarn install && yarn build
yarn typeorm migration:run && yarn start:worker:goal
# yarn start:worker:challenge
yarn start