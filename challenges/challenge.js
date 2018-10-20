const challengelist = require("./challengelist.js");
const conn = require("mongoose").connection;

class Challenge {
    constructor(objectID, creator, displayName, initStamp, countdown, duration,
        channel, type, hidden) {
        this.objectID = objectID;
        this.creator = creator;
        this.displayName = displayName;
        this.initStamp = initStamp;
        this.countdown = countdown;
        this.duration = duration;
        this.channelID = channel;
        this.channel = client.channels.get(this.channelID);
        this.type = type;
        this.joinedUsers = {};
        this.hookedChannels = [channel];
        this.state = 0;
        this.hidden = hidden;

        this.cStart = this.countdown * 60;
        this.cDur = this.duration * 60;
        this.cPost = challengelist.DUR_AFTER;

        this.startStamp = this.initStamp + (this.cStart * 1000);
        this.endStamp = this.startStamp + (this.cDur * 1000);
        this.delStamp = this.endStamp + (this.cPost * 1000);

        var dateCheck = new Date().getTime();
        if (this.startStamp < dateCheck) {
            if (this.endStamp < dateCheck) {
                if (this.delStamp < dateCheck) {
                    this.state = 2;
                    this.cPost = 0;
                } else {
                    this.state = 2;
                    this.cPost = Math.ceil((this.delStamp - dateCheck) / 1000);
                }
            } else {
                this.state = 1;
                this.cDur = Math.ceil((this.endStamp - dateCheck) / 1000);
            }
        }  else {
            this.state = 0;
            this.cStart = Math.ceil((this.startStamp - dateCheck) / 1000);
        }
        if (this.state == 0 && this.cStart == this.countdown * 60) {
            if(this.countdown == 1) {
                this.channel.send("Your " + type + ", " + this.displayName
                    + " (ID " + this.objectID + "), starts in " + this.countdown
                    + " minute.");
            } else {
                this.channel.send("Your " + type + ", " + this.displayName
                    + " (ID " + this.objectID + "), starts in " + this.countdown
                    + " minutes.");
            }
        }
    }

    update() {
        switch(this.state){
            case 0:
                this.start();
                break;
            case 1:
                this.end();
                break;
            case 2:
                this.terminate();
                break;
            default:
                this.channel.send("Error: Invalid state reached.");
                delete challengelist.challengeList[this.objectID];
                break;
        }
    }
    start() {
        if (this.cStart > 0) {
            this.cStart--;
        }
        if(this.cStart == 0) {
            this.startMsg();
        } else if(this.cStart == 60) {
            for (var i = 0; i < this.hookedChannels.length; i++) {
                var channelObject = client.channels.get(this.hookedChannels
                    [i]);
                channelObject.send(this.displayName + " starts in 1 minute.");
            }
        } else if(this.cStart % 300 == 0) {
            for (var i = 0; i < this.hookedChannels.length; i++) {
                var channelObject = client.channels.get(this.hookedChannels
                    [i]);
                channelObject.send(this.displayName + " starts in "
                    + this.cStart / 60 + " minutes.");
            }
        } else if([30,10,5].includes(this.cStart)) {
            for (var i = 0; i < this.hookedChannels.length; i++) {
                var channelObject = client.channels.get(this.hookedChannels
                    [i]);
                channelObject.send(this.displayName + " starts in "
                    + this.cStart + " seconds.");
            }
        }
    }
    startMsg() {
        for (var i = 0; i < this.hookedChannels.length; i++) {
            var userList = "";
            for(var user in this.joinedUsers) {
                if (this.joinedUsers[user].channelID == this.hookedChannels
                    [i]) {
                        userList += " " + client.users.get(user);
                }
            }
            var channelObject = client.channels.get(this.hookedChannels
                [i]);
            channelObject.send(this.displayName + " (ID " + this.objectID
                + ") starts now!" + userList);
        }
        this.state = 1;
    }
    end() {
        this.cDur--;
        if(this.cDur <= 0) {
            for(var i = 0; i < this.hookedChannels.length; i++) {
                var userList = "";
                for(var user in this.joinedUsers) {
                    if (this.joinedUsers[user].channelID == this.hookedChannels
                        [i]) {
                            userList += " " + client.users.get(user);
                    }
                }
                var channelObject = client.channels.get(this.hookedChannels
                    [i]);
                channelObject.send(this.displayName + " (ID " + this.objectID
                    + ") has ended! Post your total to be "
                    + "included in the summary." + userList);
            }
            this.state = 2;
        } else if(this.cDur == 60) {
            for (var i = 0; i < this.hookedChannels.length; i++) {
                var channelObject = client.channels.get(this.hookedChannels
                    [i]);
                channelObject.send("There is 1 minute remaining in "
                    + this.displayName + ".");
            }
        } else if(this.cDur % 300 == 0) {
            for (var i = 0; i < this.hookedChannels.length; i++) {
                var channelObject = client.channels.get(this.hookedChannels
                    [i]);
                channelObject.send("There are " + this.cDur/60
                    + " minutes remaining in " + this.displayName + ".");
            }
        } else if([30,10,5].includes(this.cDur)) {
            for (var i = 0; i < this.hookedChannels.length; i++) {
                var channelObject = client.channels.get(this.hookedChannels
                    [i]);
                channelObject.send("There are " + this.cDur
                    + " seconds remaining in " + this.displayName + ".");
            }

        }
    }
    terminate() {
        this.cPost--;
        if(this.cPost == 0) {
            for(var i = 0; i < this.hookedChannels.length; i++) {
                challengelist.generateSummary(client.channels.get(
                    this.hookedChannels[i]), this.objectID);
            }
            conn.collection("challengeDB").remove(
                {_id: this.objectID}
            );
            delete challengelist.challengeList[this.objectID];
        }
    }
}

module.exports = Challenge;
