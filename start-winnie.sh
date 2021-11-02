#!/bin/bash
set -euxo pipefail

yarn install && yarn build
yarn dotenv:test
yarn typeorm migration:run

cp ./services/*.service /lib/systemd/system/

cat /srv/winnie/Winnie_Bot/.env

sudo systemctl stop goal-worker.service
# sudo systemctl stop challenge-worker.service
sudo systemctl stop app.service
sudo systemctl enable goal-worker.service
# sudo systemctl enable challenge-worker.service
sudo systemctl enable app.service
sudo systemctl start goal-worker.service
# sudo systemctl start challenge-worker.service
sudo systemctl start app.service
systemctl status goal-worker.service
# systemctl status challenge-worker.service
systemctl status app.service

journalctl -u app.service