const functions = require('./functions.js');
const DUR_AFTER = 300;

class Challenge {
    constructor(objectID, creator, displayName, initStamp, countdown, duration,
        channel, type) {
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
        this.hookedChannels = [channelID];
        this.state = 0;

        this.cStart = this.countdown * 60;
        this.cDur = this.duration * 60;
        this.cPost = DUR_AFTER;

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
                delete challengeList[this.objectID];
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
            for(channel in hookedChannels) {
                channelObject = client.channels.get(channel);
                channelObject.send(this.displayName + " starts in 1 minute.");
            }
        } else if(this.cStart % 300 == 0) {
            for (channel in hookedChannels) {
                channelObject = client.channels.get(channel);
                channelObject.send(this.displayName + " starts in "
                    + this.cStart / 60 + " minutes.");
            }
        } else if([30,10,5].includes(this.cStart)) {
            for (channel in hookedChannels) {
                channelObject = client.channels.get(channel);
                channelObject.send(this.displayName + " starts in "
                    + this.cStart + " seconds.");
            }
        }
    }
    startMsg() {
        var userList = "";
            for(var user in this.joinedUsers) {
                userList += " " + this.joinedUsers[user].userData;
            }
            this.channel.send(this.displayName + " (ID " + this.objectID 
                + ") starts now!" + userList);
            this.state = 1;
    }
    end() {
        this.cDur--;
        if(this.cDur <= 0) {
            var userList = "";
            for(var user in this.joinedUsers) {
                userList += " " + this.joinedUsers[user].userData;
            }
            this.channel.send(this.displayName + " (ID " + this.objectID
                + ") has ended! Post your total to be "
                + "included in the summary." + userList);
            this.state = 2;
        } else if(this.cDur == 60) {
            this.channel.send("There is 1 minute remaining in "
                + this.displayName + ".");
        } else if(this.cDur % 300 == 0) {
            this.channel.send("There are " + this.cDur/60
                + " minutes remaining in " + this.displayName + ".");
        } else if([30,10,5].includes(this.cDur)) {
            this.channel.send("There are " + this.cDur
                + " seconds remaining in " + this.displayName + ".");
        }
    }
    terminate() {
        this.cPost--;
        if(this.cPost == 0) {
            functions.generateSummary(this.channel, this.objectID);
            conn.collection('challengeDB').remove(
                {_id: this.objectID}
            );
            delete functions.challengeList[this.objectID];
        }
    }
}

class Sprint extends Challenge {
    constructor(objectID, creator, displayName, initStamp, countdown, goal,
        duration, channel) {
        super(objectID, creator, displayName, initStamp, countdown,
            duration, channel, 'sprint');
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
            "type": "sprint"
        };
        var array = [challengeData];

        conn.collection('challengeDB').insert(
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
        var userList = "";
            for(var user in this.joinedUsers) {
                userList += " " + this.joinedUsers[user].userData;
            }
            this.channel.send(this.displayName + " (ID " + this.objectID
                + ") starts now! Race to " + this.goal + " words!" + userList);
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
        channel) {
        super(objectID, creator, displayName, initStamp, countdown, duration,
            channel, 'war');

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
            "type": "war"
        };
        var array = [challengeData];

        conn.collection('challengeDB').insert(
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
        countdown, duration, channel) {
        super(objectID, creator,  warName + " (" + current + "/" + total + ")",
            initStamp, countdown, duration, channel, 'chain war');
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
            "type": "chain war"
        };
        var array = [challengeData];

        conn.collection('challengeDB').insert(
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
                delete challengeList[this.objectID];
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

class Goal {
    constructor(authorID, goal, goalType, written, startTime, terminationTime,
        channelID) {
        this.authorID =  authorID;
        this.goal = goal;
        this.goalType = goalType;
        this.written = written;
        this.startTime = startTime;
        this.terminationTime = terminationTime;
        this.channelID = channelID;
        this.channel = client.channels.get(this.channelID);

        var goalData = {
            "authorID": this.authorID,
            "goal": this.goal,
            "goalType": this.goalType,
            "written": this.written,
            "startTime": this.startTime,
            "terminationTime": this.terminationTime,
            "channelID": this.channelID
        };

        conn.collection('goalDB').update(
            {authorID: this.authorID},
            goalData,
            {upsert: true}
        )
    }

    update() {
        if(new Date().getTime() >= this.terminationTime) {
            var raptorPct = ((this.written / this.goal) * 100);
            functions.raptor(this.channel.guild.id, this.channel,
                client.users.get(this.authorID), raptorPct);
            conn.collection('goalDB').remove(
                {authorID: this.authorID}
            );
            delete functions.goalList[this.authorID];
            logger.info("Deleting goal of " +  client.users.get(this.authorID));
        }
    }

    addWords(wordNumber, type) {
        switch(type){
            case 0:
                this.written += parseInt(wordNumber);
                break;
            case 1:
                this.written = parseInt(wordNumber);
                break;
        }
        conn.collection('goalDB').update(
            {"authorID": this.authorID},
            {$set: {"written": this.written}},
            {upsert: false},
            function(err){}
        )
    }
}

exports.Challenge = Challenge;
exports.Sprint = Sprint;
exports.War = War;
exports.ChainWar = ChainWar;
exports.Goal = Goal;