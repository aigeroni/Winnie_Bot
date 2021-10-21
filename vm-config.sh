#!/bin/sh
set -euxo pipefail

sudo apt-get update && sudo apt-get install git -y
sudo curl -fsSL https://deb.nodesource.com/setup_16.x | sudo bash - && sudo apt-get install nodejs -y
sudo npm install -g yarn
if [ ! -d Winnie_Bot ] ; then
git clone https://github.com/aigeroni/Winnie_Bot Winnie_Bot
fi
cd Winnie_Bot && git pull --no-rebase && git checkout $GITHUB_SHA
./start-winnie.sh