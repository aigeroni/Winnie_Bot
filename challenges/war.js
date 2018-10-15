const Challenge = require("./challenge.js");
const conn = require("mongoose").connection;

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

exports.War = War;
