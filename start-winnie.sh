#!/bin/bash
set -euxo pipefail

pwd
ls -la

whereis yarn

yarn install && yarn build
yarn dotenv:test
yarn typeorm migration:run

cp ./services/*.service /lib/systemd/system/

sudo systemctl enable goal-worker.service
sudo systemctl enable challenge.service
sudo systemctl enable app.service
sudo systemctl start goal-worker.service
sudo systemctl start challenge.service
sudo systemctl start app.service