#!/bin/bash
set -euxo pipefail

yarn install && yarn build
yarn dotenv:test
yarn typeorm migration:run

cp ./services/*.service /lib/systemd/system/

sudo systemctl stop goal-worker@1.service
sudo systemctl enable goal-worker@1.service
sudo systemctl start goal-worker@1.service
sudo systemctl stop goal-worker@2.service
sudo systemctl enable goal-worker@2.service
sudo systemctl start goal-worker@2.service
sudo systemctl stop goal-worker@3.service
sudo systemctl enable goal-worker@3.service
sudo systemctl start goal-worker@3.service
# sudo systemctl stop challenge-worker@1.service
# sudo systemctl enable challenge-worker@1.service
# sudo systemctl start challenge-worker@1.service
# sudo systemctl stop challenge-worker@2.service
# sudo systemctl enable challenge-worker@2.service
# sudo systemctl start challenge-worker@2.service
# sudo systemctl stop challenge-worker@3.service
# sudo systemctl enable challenge-worker@3.service
# sudo systemctl start challenge-worker@3.service
# sudo systemctl stop challenge-worker@4.service
# sudo systemctl enable challenge-worker@4.service
# sudo systemctl start challenge-worker@4.service
sudo systemctl stop app.service
sudo systemctl enable app.service
sudo systemctl start app.service
systemctl status goal-worker@1.service
# systemctl status challenge-worker@1.service
journalctl -u app.service