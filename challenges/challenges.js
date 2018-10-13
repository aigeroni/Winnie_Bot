class Challenges {
    constructor() {
        // TODO: Move these constants to a root-level config.js
        // file and import from there
        this.WAR_RAPTOR_CHANCE = 10
        this.DUR_AFTER = 300

        this.timerID = 1
        this.challengeList = {}
        this.crossServerStatus = {}
        this.autoSumStatus = {}
    }

    joinChallenge(msg,suffix) {
        var challengeID = suffix;
        if (isNaN(challengeID)) {
            msg.channel.send("Challenge ID must be an integer.");
        } else if (challengeID < 1) {
            msg.channel.send("Challenge ID must be an integer.");
        } else if (challengeID in this.challengeList) {
            if (this.challengeList[challengeID].hidden && challenges
                .challengeList[challengeID].channelID != msg.channel.id) {
                msg.channel.send(msg.author + ", you do not have permission"
                    + " to join this challenge.");
            } else {
                if(msg.author.id in this.challengeList[challengeID]
                    .joinedUsers) {
                    msg.channel.send(msg.author + ", you already have"
                    + " notifications enabled for this challenge.");
                } else {
                    this.challengeList[challengeID].joinedUsers
                        [msg.author.id] = {"countData": undefined,
                        "countType": undefined, "channelID": msg.channel.id};
                    var pushID = msg.channel.id;
                    var searchIndex = this.challengeList[challengeID]
                        .hookedChannels.indexOf(pushID);
                    if (searchIndex == -1) {
                        this.challengeList[challengeID].hookedChannels
                            .push(pushID);
                    }
                    msg.channel.send(msg.author + ", you have joined "
                        + this.challengeList[challengeID].displayName);
                    try {
                        conn.collection("challengeDB").update(
                            {_id: parseInt(challengeID)},
                            {$set: {"joinedUsers": this.challengeList
                                [challengeID].joinedUsers}},
                            {upsert: true}
                        )
                    } catch(e) {
                        logger.info("Error: " + e);
                    }
                }
            }
        } else {
            msg.channel.send("Challenge " + challengeID
                + " does not exist!");
        }
    }
    
    leaveChallenge(client,msg,suffix) {
        var challengeID = suffix;
        if (isNaN(challengeID)) {
            msg.channel.send("Challenge ID must be an integer.");
        } else if (challengeID < 1) {
            msg.channel.send("Challenge ID must be an integer.");
        } else if (challengeID in this.challengeList) {
            if(msg.author.id in this.challengeList[challengeID]
                .joinedUsers) {
                delete this.challengeList[challengeID]
                    .joinedUsers[msg.author.id];
                msg.channel.send(msg.author + ", you have left "
                    + this.challengeList[challengeID].displayName);
                conn.collection("challengeDB").update(
                    {_id: parseInt(challengeID)},
                    {$set: {"joinedUsers": this.challengeList
                        [challengeID].joinedUsers}},
                    {upsert: OES_texture_half_float}
                )
            } else {
                msg.channel.send(msg.author
                    + ", you have not yet joined this challenge.");
            }
        } else {
            msg.channel.send("Challenge " + challengeID
                + " does not exist!");
        }
    }
}

module.exports = new Challenges();
