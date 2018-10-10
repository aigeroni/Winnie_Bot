const chalData = require("./data.js");
const logger = require("../logger.js");
const mongoose = require("mongoose");

conn = mongoose.connection;

exports.joinChallenge = function(msg,suffix) {
    var challengeID = suffix;
    if (isNaN(challengeID)) {
        msg.channel.send("Challenge ID must be an integer.");
    } else if (challengeID < 1) {
        msg.channel.send("Challenge ID must be an integer.");
    } else if (challengeID in chalData.challengeList) {
        if (chalData.challengeList[challengeID].hidden && chalData
            .challengeList[challengeID].channelID != msg.channel.id) {
            msg.channel.send(msg.author + ", you do not have permission"
                + " to join this challenge.");
        } else {
            if(msg.author.id in chalData.challengeList[challengeID]
                .joinedUsers) {
                msg.channel.send(msg.author + ", you already have"
                + " notifications enabled for this challenge.");
            } else {
                chalData.challengeList[challengeID].joinedUsers
                    [msg.author.id] = {"countData": undefined,
                    "countType": undefined, "channelID": msg.channel.id};
                var pushID = msg.channel.id;
                var searchIndex = chalData.challengeList[challengeID]
                    .hookedChannels.indexOf(pushID);
                if (searchIndex == -1) {
                    chalData.challengeList[challengeID].hookedChannels
                        .push(pushID);
                }
                msg.channel.send(msg.author + ", you have joined "
                    + chalData.challengeList[challengeID].displayName);
                try {
                    conn.collection("challengeDB").update(
                        {_id: parseInt(challengeID)},
                        {$set: {"joinedUsers": chalData.challengeList
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

exports.leaveChallenge = function(client,msg,suffix) {
    var challengeID = suffix;
    if (isNaN(challengeID)) {
        msg.channel.send("Challenge ID must be an integer.");
    } else if (challengeID < 1) {
        msg.channel.send("Challenge ID must be an integer.");
    } else if (challengeID in chalData.challengeList) {
        if(msg.author.id in chalData.challengeList[challengeID]
            .joinedUsers) {
            delete chalData.challengeList[challengeID]
                .joinedUsers[msg.author.id];
            msg.channel.send(msg.author + ", you have left "
                + chalData.challengeList[challengeID].displayName);
            conn.collection("challengeDB").update(
                {_id: parseInt(challengeID)},
                {$set: {"joinedUsers": chalData.challengeList
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