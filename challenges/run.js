const chalClass = require("./challenge.js");
const chalData = require("./data.js");
const mongoose = require("mongoose");

conn = mongoose.connection;

exports.startSprint = function(msg,suffix) {
    var args = suffix.split(" ");
    var words = args.shift();
    var timeout = args.shift();
    var start = args.shift();
    var sprintName = args.join(" ");
    if (start === undefined){
        start = 1;
    }
    if (!Number.isInteger(Number(words))){
        msg.channel.send("Word goal must be a whole number.");
    } else if(isNaN(timeout)){
        msg.channel.send("Sprint duration must be a number.");
    } else if(isNaN(start)){
        msg.channel.send("Time to start must be a number.");
    } else if (start > 30) {
        msg.channel.send("Sprints cannot start more than 30 minutes"
            + " in the future.");
    } else if (timeout > 60) {
        msg.channel.send("Sprints cannot last for more than an hour.");
    } else if (words < 1) {
        msg.channel.send("Word goal cannot be negative.");
    } else if (start <= 0) {
        msg.channel.send("Sprints cannot start in the past.");
    } else if (timeout < 1) {
        msg.channel.send("Sprints must run for at least a minute.");
    } else {
        try{
            var creatorID = msg.author.id;
            if(sprintName == "") {
                sprintName = msg.author.username + "'s sprint";
            }
            var startTime = new Date().getTime();
            chalData.challengeList[chalData.timerID] =
                new chalClass.Sprint(chalData.timerID, creatorID,
                sprintName, startTime, start, words, timeout,
                msg.channel.id, chalData.crossServerStatus
                [msg.guild.id]);
            conn.collection("timer").update(
                {data: chalData.timerID},
                {data: (chalData.timerID+1)},
                {upsert: true}
            )
            chalData.timerID = chalData.timerID + 1;
        } catch(e) {
            msg.channel.send("Error: Sprint creation failed.");
            logger.error("Error %s: %s.", e, e.stack);
        }
    }
}

exports.startWar = function(msg,suffix) {
    var args = suffix.split(" ");
    var duration = args.shift();
    var start = args.shift();
    var warName = args.join(" ");
    if (start === undefined) {
        start = 1;
    }
    if(isNaN(start)) {
        msg.channel.send("Time to start must be a number.");
    } else if(isNaN(duration)) {
        msg.channel.send("War duration must be a number.");
    } else if (start > 30) {
        msg.channel.send("Wars cannot start more than 30 minutes"
            + " in the future.");
    } else if (duration > 60) {
        msg.channel.send("Wars cannot last for more than an hour.");
    } else if (start <= 0) {
        msg.channel.send("Wars cannot start in the past.");
    } else if (duration < 1) {
        msg.channel.send("Wars must run for at least a minute.");
    } else {
        try{
            var creatorID = msg.author.id;
            if(warName == "") {
                warName = msg.author.username + "'s war";
            }
            var startTime = new Date().getTime();
            chalData.challengeList[chalData.timerID] =
                new chalClass.War(chalData.timerID, creatorID, warName,
                startTime, start, duration, msg.channel.id, chalData
                .crossServerStatus[msg.guild.id]);
            conn.collection("timer").update(
                {data: chalData.timerID},
                {data: (chalData.timerID+1)},
                {upsert: true}
            )
            chalData.timerID = chalData.timerID + 1;
        } catch(e) {
            msg.channel.send("Error: War creation failed.");
            logger.error("Error %s: %s.", e, e.stack);
        }
    }
}

exports.startChainWar = function(msg,suffix) {
    var args = suffix.split(" ");
    var chainWarCount = args.shift();
    var duration = args.shift();
    var timeBetween = args.shift();
    var warName = args.join(" ");
    if (timeBetween === undefined) {
        start = 1;
    }
    if(isNaN(chainWarCount)) {
        msg.channel.send("War count must be a number.");
    } else if(isNaN(timeBetween)) {
        msg.channel.send("Time between wars must be a number.");
    } else if (timeBetween > 30) {
        msg.channel.send("There cannot be more than 30 minutes"
            + " between wars in a chain.");
    } else if(isNaN(duration)) {
        msg.channel.send("War duration must be a number.");
    } else if (!(2 < chainWarCount < 10)) {
        msg.channel.send("Chain wars must be between two and ten wars"
            + " long.");
    } else if (duration * chainWarCount > 120) {
        msg.channel.send("Chain wars cannot last for more than two"
            + " hours of writing time.");
    } else if (timeBetween <= 0) {
        msg.channel.send("Chain wars cannot overlap.");
    } else if (duration < 1) {
        msg.channel.send("Wars must run for at least a minute.");
    } else {
        try{
            var creatorID = msg.author.id;
            if(warName == "") {
                warName = msg.author.username + "'s war";
            }
            var startTime = new Date().getTime();
            chalData.challengeList[chalData.timerID] =
                new chalClass.ChainWar(chalData.timerID, creatorID,
                warName, startTime, 1, chainWarCount, timeBetween,
                duration, msg.channel.id, chalData.crossServerStatus
                [msg.guild.id]);
            conn.collection("timer").update(
                {data: chalData.timerID},
                {data: (chalData.timerID+1)},
                {upsert: true}
            )
            chalData.timerID = chalData.timerID + 1;
        } catch(e) {
            msg.channel.send("Error: Chain war creation failed.");
            logger.error("Error %s: %s.", e, e.stack);
        }
    }
}

exports.stopChallenge = function(client,msg,suffix) {
    var challengeID = suffix;
    if (isNaN(challengeID) || challengeID < 1) {
        msg.channel.send("Challenge ID must be an integer.");
    } else if (challengeID in chalData.challengeList) {
        var stopName = chalData.challengeList[challengeID].displayName;
        if (!(chalData.challengeList[challengeID].hidden && chalData
            .challengeList[challengeID].channelID != msg.channel.id)) {
            if(chalData.challengeList[challengeID].creator
                == msg.author.id) {
                conn.collection("challengeDB").remove(
                    {_id: Number(challengeID)}
                );
                for(var i = 0; i < chalData.challengeList[challengeID]
                    .hookedChannels.length; i++) {
                    client.channels.get(chalData.challengeList
                        [challengeID].hookedChannels[i]).send(stopName
                        + " has been exterminated by the creator.");
                }
                delete chalData.challengeList[challengeID];
            } else {
                msg.channel.send("Only the creator of " + stopName
                    + " can end this challenge.");
            }
        } else {
            msg.channel.send(msg.author + ", you do not have permission"
                + " to end this challenge.")
        }
    } else {
        msg.channel.send("Challenge " + challengeID
            + " does not exist!");
    }
}