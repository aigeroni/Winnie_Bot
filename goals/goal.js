const goallist = require("./goallist.js");
const conn = require("mongoose").connection;

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

        conn.collection("goalDB").update(
            {authorID: this.authorID},
            goalData,
            {upsert: true}
        )
    }

    update() {
        if(new Date().getTime() >= this.terminationTime) {
            var raptorRollData = [this.channel,
                ((this.written / this.goal) * 100)];
            delete goallist.goalList[this.authorID];
            conn.collection("goalDB").remove(
                {authorID: this.authorID}
            );
            return raptorRollData;
        }
        return false;
    }

    addWords(wordNumber, type) {
        switch(type){
            case false:
                this.written += parseInt(wordNumber);
                break;
            case true:
                this.written = parseInt(wordNumber);
                break;
        }
        conn.collection("goalDB").update(
            {"authorID": this.authorID},
            {$set: {"written": this.written}},
            {upsert: false},
            function(err){}
        )
    }
}

module.exports = Goal;
