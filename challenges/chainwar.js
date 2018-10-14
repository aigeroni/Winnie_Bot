const challenge = require("./challenge.js");
const challenges = require("./challenges.js");
const conn = require("mongoose").connection;

class ChainWar extends challenge.Challenge {
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

exports.ChainWar = ChainWar;