const ChainWar = require("./chainwar");
const Sprint = require("./sprint");
const War = require("./war");
const challengelist = require("./challengelist.js");
const logger = require("../logger.js");
const conn = require("mongoose").connection;

class Challenges {
    constructor() {
        // TODO: Move to a root-level config.js
        // file and import from there
        this.WAR_RAPTOR_CHANCE = 10;

        this.timerID = 1;
        this.crossServerStatus = {};
        this.autoSumStatus = {};
    }

    joinChallenge(msg,suffix) {
        var challengeID = suffix;
        if (isNaN(challengeID)) {
            msg.channel.send("Challenge ID must be an integer.");
        } else if (challengeID < 1) {
            msg.channel.send("Challenge ID must be an integer.");
        } else if (challengeID in challengelist.challengeList) {
            if (challengelist.challengeList[challengeID].hidden && client
                .channels.get(challengelist.challengeList[challengeID]
                .channelID).guild.id != msg.guild.id) {
                msg.channel.send(msg.author + ", you do not have permission"
                    + " to join this challenge.");
            } else {
                if(msg.author.id in challengelist.challengeList[challengeID]
                    .joinedUsers) {
                    msg.channel.send(msg.author + ", you already have"
                    + " notifications enabled for this challenge.");
                } else {
                    challengelist.challengeList[challengeID].joinedUsers
                        [msg.author.id] = {"countData": undefined,
                        "countType": undefined, "channelID": msg.channel.id};
                    var pushID = msg.channel.id;
                    var searchIndex = challengelist.challengeList[challengeID]
                        .hookedChannels.indexOf(pushID);
                    if (searchIndex == -1) {
                        challengelist.challengeList[challengeID].hookedChannels
                            .push(pushID);
                    }
                    msg.channel.send(msg.author + ", you have joined "
                        + challengelist.challengeList[challengeID].displayName);
                    try {
                        conn.collection("challengeDB").update(
                            {_id: parseInt(challengeID)},
                            {$set: {"joinedUsers": challengelist.challengeList
                                [challengeID].joinedUsers}},
                            {upsert: true}
                        )
                    } catch(e) {
                        logger.error("Error: " + e);
                    }
                }
            }
        } else {
            msg.channel.send("Challenge " + challengeID
                + " does not exist!");
        }
    }
    
    leaveChallenge(msg,suffix) {
        var challengeID = suffix;
        if (isNaN(challengeID)) {
            msg.channel.send("Challenge ID must be an integer.");
        } else if (challengeID < 1) {
            msg.channel.send("Challenge ID must be an integer.");
        } else if (challengeID in challengelist.challengeList) {
            if(msg.author.id in challengelist.challengeList[challengeID]
                .joinedUsers) {
                delete challengelist.challengeList[challengeID]
                    .joinedUsers[msg.author.id];
                msg.channel.send(msg.author + ", you have left "
                    + challengelist.challengeList[challengeID].displayName);
                conn.collection("challengeDB").update(
                    {_id: parseInt(challengeID)},
                    {$set: {"joinedUsers": challengelist.challengeList
                        [challengeID].joinedUsers}},
                    {upsert: true}
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

    startSprint(msg,suffix) {
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
                challengelist.challengeList[this.timerID] =
                    new Sprint(this.timerID, creatorID,
                    sprintName, startTime, start, words, timeout,
                    msg.channel.id, this.crossServerStatus
                    [msg.guild.id]);
                conn.collection("timer").update(
                    {data: this.timerID},
                    {data: (this.timerID+1)},
                    {upsert: true}
                )
                this.timerID = this.timerID + 1;
            } catch(e) {
                msg.channel.send("Error: Sprint creation failed.");
                logger.error("Error %s: %s.", e, e.stack);
            }
        }
    }
    
    startWar(msg,suffix) {
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
                challengelist.challengeList[this.timerID] =
                    new War(this.timerID, creatorID, warName,
                    startTime, start, duration, msg.channel.id, this
                    .crossServerStatus[msg.guild.id]);
                conn.collection("timer").update(
                    {data: this.timerID},
                    {data: (this.timerID+1)},
                    {upsert: true}
                )
                this.timerID = this.timerID + 1;
            } catch(e) {
                msg.channel.send("Error: War creation failed.");
                logger.error("Error %s: %s.", e, e.stack);
            }
        }
    }
    
    startChainWar(msg,suffix) {
        var args = suffix.split(" ");
        var chainWarCount = args.shift();
        var duration = args.shift();
        var timeBetween = args.shift();
        var warName = args.join(" ");
        if (timeBetween === undefined) {
            timeBetween = 1;
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
                challengelist.challengeList[this.timerID] =
                    new ChainWar(this.timerID, creatorID,
                    warName, startTime, 1, chainWarCount, timeBetween,
                    duration, msg.channel.id, this.crossServerStatus
                    [msg.guild.id]);
                conn.collection("timer").update(
                    {data: this.timerID},
                    {data: (this.timerID+1)},
                    {upsert: true}
                )
                this.timerID = this.timerID + 1;
            } catch(e) {
                msg.channel.send("Error: Chain war creation failed.");
                logger.error("Error %s: %s.", e, e.stack);
            }
        }
    }
    
    stopChallenge(msg,suffix) {
        var challengeID = suffix;
        if (isNaN(challengeID) || challengeID < 1) {
            msg.channel.send("Challenge ID must be an integer.");
        } else if (challengeID in challengelist.challengeList) {
            var stopName = challengelist.challengeList[challengeID].displayName;
            if (!(challengelist.challengeList[challengeID].hidden &&
                challengelist.challengeList[challengeID].channelID
                != msg.channel.id)) {
                if(challengelist.challengeList[challengeID].creator
                    == msg.author.id) {
                    conn.collection("challengeDB").remove(
                        {_id: Number(challengeID)}
                    );
                    for(var i = 0; i < challengelist.challengeList[challengeID]
                        .hookedChannels.length; i++) {
                        client.channels.get(challengelist.challengeList
                            [challengeID].hookedChannels[i]).send(stopName
                            + " has been ended by the creator.");
                    }
                    delete challengelist.challengeList[challengeID];
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

    listChallenges(client,msg) {
        var nonHiddenTotal = 0;
        var timerInfo = "";
        for(var i in challengelist.challengeList) {
            var parentChannel = client.channels.get(challengelist
                .challengeList[i].channelID);
            var parentGuild = parentChannel.guild;
            // check whether a challenge is hidden
            if (!(challengelist.challengeList[i].hidden &&
                parentGuild.id != msg.guild.id)) {
                nonHiddenTotal += 1;
                // find originating server name
                var parentGuildName = parentGuild.name;
                switch(challengelist.challengeList[i].state){
                    case 0:
                        var timeout = "";
                        if ((challengelist.challengeList[i].cStart % 60)
                                < 10) {
                            timeout = "0" + (challengelist.challengeList[i]
                                .cStart % 60).toString();
                        } else {
                            timeout = challengelist.challengeList[i].cStart
                                % 60;
                        }
                        timerInfo += i + ": " + challengelist.challengeList
                            [i].displayName + " (";
                        if (challengelist.challengeList[i].type ==
                            "sprint") {
                            timerInfo += challengelist.challengeList[i].goal
                                + " words, ";
                        }
                        timerInfo += challengelist.challengeList[i].duration
                            + " minutes, starts in "
                            + Math.floor(challengelist.challengeList[i]
                            .cStart/ 60) + ":" + timeout + "), "
                            + parentGuildName + "\n";
                        break;
                    case 1:
                        var timeout = "";
                        if ((challengelist.challengeList[i].cDur % 60)
                            < 10) {
                            timeout = "0" + (challengelist.challengeList[i]
                                .cDur % 60).toString();
                        } else {
                            timeout = challengelist.challengeList[i].cDur
                                % 60;
                        }
                        timerInfo += i + ": " + challengelist.challengeList
                            [i].displayName +  " (";
                        if (challengelist.challengeList[i].type == "sprint")
                            {
                            timerInfo += challengelist.challengeList[i].goal
                            + " words, ";
                        }
                        timerInfo += challengelist.challengeList[i].duration
                            + " minutes, "
                            + Math.floor(challengelist.challengeList[i].cDur
                            / 60) + ":" + timeout + " remaining), "
                            + parentGuildName + "\n";
                        break;
                    case 2:
                    case 3:
                        timerInfo += i + ": " + challengelist.challengeList
                            [i].displayName +  " (";
                        if (challengelist.challengeList[i].type == "sprint")
                            {
                            timerInfo += challengelist.challengeList[i].goal
                            + " words, ";
                        }
                        timerInfo += challengelist.challengeList[i].duration
                        + " minutes, ended), " + parentGuildName + "\n";
                        break;
                    default:
                        break;
                }
            }
        }
        var listMsg = "";
        if(nonHiddenTotal == 0) {
            listMsg += ("There are no challenges running."
                + " Why don't you start one?");
        } else if(nonHiddenTotal == 1) {
            listMsg += "There is " + nonHiddenTotal
                + " challenge running:\n";
        } else {
            listMsg += "There are " + nonHiddenTotal
                + " challenges running:\n";
        }
        if (nonHiddenTotal > 0) {
            listMsg += timerInfo;
        }
        msg.channel.send(listMsg);
    }
    
    addTotal(msg,suffix) {
        var args = suffix.split(" ");
        var challengeID = args.shift();
        var wordsWritten = args.shift();
        var writtenType = args.shift();
        var raptorCheck = true;
        if (writtenType == "line" || writtenType == "page"
            || writtenType == "word" || writtenType == "minute") {
            writtenType += "s";
        }
        if (!(writtenType == "lines" || writtenType == "pages"
            || writtenType == "words" || writtenType == "minutes"
            || writtenType === undefined)) {
            msg.channel.send("Invalid input.  You must work in words,"
                + " lines, or pages.");
        } else {
            if (writtenType === undefined) {
                writtenType = "words";
            }
            if (challengeID in challengelist.challengeList) {
                if (challengelist.challengeList[challengeID].state >= 2) {
                    if (!(challengelist.challengeList[challengeID].hidden &&
                        client.channels.get(challengelist.challengeList
                        [challengeID].channelID).guild.id != msg.guild.id)) {
                        if(Number.isInteger(Number(wordsWritten))){
                            for(var user in challengelist.challengeList
                                [challengeID].joinedUsers) {
                                if(user == msg.author.id) {
                                    if(!(challengelist.challengeList
                                        [challengeID].joinedUsers[user]
                                        .countData === undefined)) {
                                        raptorCheck = false;
                                    }
                                }
                            }
                            if (Number(wordsWritten) < 1) {
                                raptorCheck = false;
                            }
                            challengelist.challengeList[challengeID]
                                .joinedUsers[msg.author.id] = {
                                "countData": wordsWritten,
                                "countType": writtenType,
                                "channelID": msg.channel.id};
                            try {
                                conn.collection("challengeDB").update(
                                    {_id: parseInt(challengeID)},
                                    {$set: {"joinedUsers":
                                        challengelist.challengeList
                                        [challengeID].joinedUsers}},
                                    {upsert: true}
                                )
                            } catch(e) {
                                logger.error("Error: " + e);
                            }
                            msg.channel.send("Total added to summary.");
                        } else {
                            raptorCheck = false;
                            msg.channel.send(msg.author + ", I need a whole"
                                + " number to include in the summary!");
                        }
                    } else {
                        raptorCheck = false;
                        msg.channel.send(msg.author + ", you do not have"
                            + " permission to join this challenge.")
                    }
                } else {
                    raptorCheck = false;
                    msg.channel.send("This challenge has not ended yet!");
                }
            } else {
                raptorCheck = false;
                msg.channel.send("This challenge does not exist!");
            }
        }
        return raptorCheck;
    }

    xsDisplay(msg,suffix) {
        if(suffix == "") {
            var xsType = "on";
            if (this.crossServerStatus[msg.guild.id] == true) {
                xsType = "off";
            }
            msg.channel.send(msg.guild.name + " currently has cross-server"
                + " challenges turned **" + xsType + "**.")
        } else {
            if(msg.member.permissions.has("ADMINISTRATOR")) {
                if(suffix == "on" || suffix == "off") {
                    var xsType = "on";
                    if (suffix == "off") {
                        xsType = "off";
                        this.crossServerStatus[msg.guild.id] = true;
                    } else {
                        xsType = "on";
                        this.crossServerStatus[msg.guild.id] = false;
                    }
                    conn.collection("configDB").update(
                        {"server": msg.guild.id},
                        {$set: {"xStatus":
                            this.crossServerStatus[msg.guild.id]}},
                        {upsert: true}
                    )
                    msg.channel.send(msg.author + ", you have turned"
                        + " cross-server challenges **" + xsType + "**.");
                } else {
                    msg.channel.send(msg.author + ", use **on|off** to"
                        + " toggle cross-server challenges.");
                }
            } else {
                msg.channel.send("Only server administrators are permitted"
                    + " to configure challenges.");
            }
        }
    }
    
    autoSum(msg,suffix) {
        if(suffix == "") {
            var autoType = "visible";
            if (this.autoSumStatus[msg.guild.id] == true) {
                autoType = "hidden";
            }
            msg.channel.send(msg.guild.name + " currently has automatic"
                + " summaries **" + autoType + "**.")
        } else {
            if(msg.member.permissions.has("ADMINISTRATOR")) {
                if(suffix == "show" || suffix == "hide") {
                    var autoType = "on";
                    if (suffix == "hide") {
                        autoType = "off";
                        this.autoSumStatus[msg.guild.id] = true;
                    } else {
                        autoType = "on";
                        this.autoSumStatus[msg.guild.id] = false;
                    }
                    conn.collection("configDB").update(
                        {"server": msg.guild.id},
                        {$set: {"autoStatus":
                            this.autoSumStatus[msg.guild.id]}},
                        {upsert: true}
                    )
                    msg.channel.send(msg.author + ", you have turned"
                        + " automatic summaries **" + autoType + "**.");
                } else {
                    msg.channel.send(msg.author + ", use **show|hide** to"
                        + " toggle automatic summaries.");
                }
            } else {
                msg.channel.send("Only server administrators are permitted"
                    + " to configure automatic summaries.");
            }
        }
    }
}

module.exports = new Challenges();
