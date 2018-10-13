const challenges = require("./challenges.js");
const chalSum = require("./summary.js");
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
        this.cPost = challenges.DUR_AFTER;

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
                delete challenges.challengeList[this.objectID];
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
                chalSum.generateSummary(client.channels.get(
                    this.hookedChannels[i]), this.objectID);
            }
            conn.collection("challengeDB").remove(
                {_id: this.objectID}
            );
            delete challenges.challengeList[this.objectID];
        }
    }
}

class Sprint extends Challenge {
    constructor(objectID, creator, displayName, initStamp, countdown, goal,
        duration, channel, hidden) {
        super(objectID, creator, displayName, initStamp, countdown,
            duration, channel, "sprint", hidden);
        this.goal = goal;

        var challengeData = {
            "_id": this.objectID,
            "creator": this.creator,
            "name": this.displayName,
            "startTime": this.initStamp,
            "countdown": this.countdown,
            "goal": this.goal,
            "duration": this.duration,
            "channel": this.channelID,
            "joinedUsers": this.joinedUsers,
            "state": this.state,
            "type": "sprint",
            "hidden": this.hidden
        };
        var array = [challengeData];

        conn.collection("challengeDB").insert(
            array, {}, function(e, docs) {}
        );

    }

    update() {
        super.update();
    }
    start() {
        super.start();
    }
    startMsg () {
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
                + ") starts now! Race to " + this.goal + " words!" + userList);
        }
        this.state = 1;
    }
    end() {
        super.end();
    }
    terminate() {
        super.terminate();
    }
}

class War extends Challenge {
    constructor(objectID, creator, displayName, initStamp, countdown, duration,
        channel, hidden) {
        super(objectID, creator, displayName, initStamp, countdown, duration,
            channel, "war", hidden);

        var challengeData = {
            "_id": this.objectID,
            "creator": this.creator,
            "name": this.displayName,
            "startTime": this.initStamp,
            "countdown": this.countdown,
            "duration": this.duration,
            "channel": this.channelID,
            "joinedUsers": this.joinedUsers,
            "state": this.state,
            "type": "war",
            "hidden": this.hidden
        };
        var array = [challengeData];

        conn.collection("challengeDB").insert(
            array, {}, function(e, docs) {}
        );
    }

    update() {
        super.update();
    }
    start() {
        super.start();
    }
    startMsg () {
        super.startMsg();
    }
    end() {
        super.end();
    }
    terminate() {
        super.terminate();
    }
}

class ChainWar extends Challenge {
    constructor(objectID, creator, warName, initStamp, current, total,
        countdown, duration, channel, hidden) {
        super(objectID, creator,  warName + " (" + current + "/" + total + ")",
            initStamp, countdown, duration, channel, "chain war", hidden);
        this.warName = warName;
        this.current = current;
        this.total = total;

        var challengeData = {
            "_id": this.objectID,
            "creator": this.creator,
            "name": this.warName,
            "startTime": this.initStamp,
            "current": this.current,
            "total": this.total,
            "countdown": this.countdown,
            "duration": this.duration,
            "channel": this.channelID,
            "joinedUsers": this.joinedUsers,
            "state": this.state,
            "type": "chain war",
            "hidden": this.hidden
        };
        var array = [challengeData];

        conn.collection("challengeDB").insert(
            array, {}, function(e, docs) {}
        );
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
                break;
            case 3:
                this.terminate();
                break;
            default:
                this.channel.send("Error: Invalid state reached.");
                delete challenges.challengeList[this.objectID];
                break;
        }
    }
    start() {
        super.start();
    }
    startMsg () {
        super.startMsg();
    }
    end() {
        super.end();
    }
    terminate() {
        super.terminate();
    }
}

exports.Challenge = Challenge;
exports.Sprint = Sprint;
exports.War = War;
exports.ChainWar = ChainWar;
