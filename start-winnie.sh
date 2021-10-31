#!/bin/bash
set -euxo pipefail

yarn install && yarn build
yarn dotenv:test
yarn typeorm migration:run

cp ./services/*.service /lib/systemd/system/

sudo systemctl enable goal-worker.service
# sudo systemctl enable challenge-worker.service
sudo systemctl enable app.service
systemctl status goal-worker.service
# sudo systemctl start challenge-worker.service
systemctl status app.service