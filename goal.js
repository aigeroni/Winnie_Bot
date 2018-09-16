const functions = require("./functions.js");

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
            var raptorPct = ((this.written / this.goal) * 100);
            functions.raptor(this.channel.guild.id, this.channel,
                client.users.get(this.authorID), raptorPct);
            conn.collection("goalDB").remove(
                {authorID: this.authorID}
            );
            delete functions.goalList[this.authorID];
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
        conn.collection("goalDB").update(
            {"authorID": this.authorID},
            {$set: {"written": this.written}},
            {upsert: false},
            function(err){}
        )
    }
}

exports.Goal = Goal;