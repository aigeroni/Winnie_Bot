const Challenge = require("./challenge");
const conn = require("mongoose").connection;

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

module.exports = Sprint;
