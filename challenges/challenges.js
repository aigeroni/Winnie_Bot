// const chainwar = require("./chainwar.js");
// const sprint = require("./sprint.js");
// const war = require("./war.js");
const logger = require("../logger.js");
const conn = require("mongoose").connection;

class Challenges {
    constructor() {
        // TODO: Move these constants to a root-level config.js
        // file and import from there
        this.WAR_RAPTOR_CHANCE = 10;
        this.DUR_AFTER = 300;

        this.timerID = 1;
        this.challengeList = {};
        this.crossServerStatus = {};
        this.autoSumStatus = {};
    }

    joinChallenge(msg,suffix) {
        var challengeID = suffix;
        if (isNaN(challengeID)) {
            msg.channel.send("Challenge ID must be an integer.");
        } else if (challengeID < 1) {
            msg.channel.send("Challenge ID must be an integer.");
        } else if (challengeID in this.challengeList) {
            if (this.challengeList[challengeID].hidden && this
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
    
    leaveChallenge(msg,suffix) {
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
                this.challengeList[this.timerID] =
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
                this.challengeList[this.timerID] =
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
                this.challengeList[this.timerID] =
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
    
    stopChallenge(client,msg,suffix) {
        var challengeID = suffix;
        if (isNaN(challengeID) || challengeID < 1) {
            msg.channel.send("Challenge ID must be an integer.");
        } else if (challengeID in this.challengeList) {
            var stopName = this.challengeList[challengeID].displayName;
            if (!(this.challengeList[challengeID].hidden && this
                .challengeList[challengeID].channelID != msg.channel.id)) {
                if(this.challengeList[challengeID].creator
                    == msg.author.id) {
                    conn.collection("challengeDB").remove(
                        {_id: Number(challengeID)}
                    );
                    for(var i = 0; i < this.challengeList[challengeID]
                        .hookedChannels.length; i++) {
                        client.channels.get(this.challengeList
                            [challengeID].hookedChannels[i]).send(stopName
                            + " has been exterminated by the creator.");
                    }
                    delete this.challengeList[challengeID];
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
        if(Object.keys(this.challengeList).length == 0) {
            msg.channel.send("There are no challenges running."
                + " Why don't you start one?");
        } else {
            if(Object.keys(this.challengeList).length == 1) {
                var timerInfo = "There is " + Object.keys(this
                    .challengeList).length + " challenge running:\n";
            } else {
                var timerInfo = "There are " + Object.keys(this
                    .challengeList).length + " challenges running:\n";
            }
            for(var i in this.challengeList) {
                // check whether a challenge is hidden
                if (!(this.challengeList[i].hidden &&
                    this.challengeList[i].channelID
                    != msg.channel.id)) {
                    // find originating server name
                    var parentChannel = client.chaallnels.get(this
                        .challengeList[i].channelID);
                    var parentGuild = parentChannel.guild;
                    var parentGuildName = parentGuild.name;
                    switch(this.challengeList[i].state){
                        case 0:
                            var timeout = "";
                            if ((this.challengeList[i].cStart % 60)
                                 < 10) {
                                timeout = "0" + (this.challengeList[i]
                                    .cStart % 60).toString();
                            } else {
                                timeout = this.challengeList[i].cStart
                                    % 60;
                            }
                            timerInfo += i + ": " + this.challengeList
                                [i].displayName + " (";
                            if (this.challengeList[i].type ==
                                "sprint") {
                                timerInfo += this.challengeList[i].goal
                                    + " words, ";
                            }
                            timerInfo += this.challengeList[i].duration
                                + " minutes, starts in "
                                + Math.floor(this.challengeList[i]
                                .cStart/ 60) + ":" + timeout + "), "
                                + parentGuildName + "\n";
                            break;
                        case 1:
                            var timeout = "";
                            if ((this.challengeList[i].cDur % 60)
                                < 10) {
                                timeout = "0" + (this.challengeList[i]
                                    .cDur % 60).toString();
                            } else {
                                timeout = this.challengeList[i].cDur
                                    % 60;
                            }
                            timerInfo += i + ": " + this.challengeList
                                [i].displayName +  " (";
                            if (this.challengeList[i].type == "sprint")
                                {
                                timerInfo += this.challengeList[i].goal
                                + " words, ";
                            }
                            timerInfo += this.challengeList[i].duration
                                + " minutes, "
                                + Math.floor(this.challengeList[i].cDur
                                / 60) + ":" + timeout + " remaining), "
                                + parentGuildName + "\n";
                            break;
                        case 2:
                        case 3:
                            timerInfo += i + ": " + this.challengeList
                                [i].displayName +  " (";
                            if (this.challengeList[i].type == "sprint")
                                {
                                timerInfo += this.challengeList[i].goal
                                + " words, ";
                            }
                            timerInfo += this.challengeList[i].duration
                            + " minutes, ended), " + parentGuildName + "\n";
                            break;
                        default:
                            break;
                    }
                }
            }
            msg.channel.send(timerInfo);
        }
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
            if (challengeID in this.challengeList) {
                if (this.challengeList[challengeID].state >= 2) {
                    if (!(this.challengeList[challengeID].hidden &&
                        this.challengeList[challengeID].channelID
                        != msg.channel.id)) {
                        if(Number.isInteger(Number(wordsWritten))){
                            for(user in this.challengeList[challengeID]
                                .joinedUsers) {
                                if(user == msg.author.id) {
                                    if(!(this.challengeList
                                        [challengeID].joinedUsers[user]
                                        .countData === undefined)) {
                                        raptorCheck = false;
                                    }
                                }
                            }
                            if (Number(wordsWritten) < 1) {
                                raptorCheck = false;
                            }
                            this.challengeList[challengeID]
                                .joinedUsers[msg.author.id] = {
                                "countData": wordsWritten,
                                "countType": writtenType,
                                "channelID": msg.channel.id};
                            try {
                                conn.collection("challengeDB").update(
                                    {_id: parseInt(challengeID)},
                                    {$set: {"joinedUsers":
                                        this.challengeList
                                        [challengeID].joinedUsers}},
                                    {upsert: true}
                                )
                            } catch(e) {
                                logger.info("Error: " + e);
                            }
                            msg.channel.send("Total added to summary.");
                        } else {
                            msg.channel.send(msg.author + ", I need a whole"
                                + " number to include in the summary!");
                        }
                    } else {
                        msg.channel.send(msg.author + ", you do not have"
                            + " permission to join  challenge.")
                    }
                } else {
                    msg.channel.send("This challenge has not ended yet!");
                }
            } else {
                msg.channel.send("This challenge does not exist!");
            }
        }
        return raptorCheck;
    }
    
    generateSummary(channel, challengeID) {
        if (challengeID in this.challengeList) {
            if (this.challengeList[challengeID].state >= 2) {
                var userTotal = "";
                var totalWords = {};
                var totalLines = {};
                var totalPages = {};
                var totalMinutes = {};
                for(var user in this.challengeList[challengeID].joinedUsers) {
                    if(Number.isInteger(Number(this.challengeList[challengeID]
                        .joinedUsers[user].countData)) && this.challengeList
                        [challengeID].joinedUsers[user].countType != undefined){
                        if (this.challengeList[challengeID].joinedUsers[user]
                            .channelID == channel.id) {
                            userTotal += client.users.get(user) + ": **"
                                + this.challengeList[challengeID].joinedUsers
                                [user].countData + "** "
                                + this.challengeList[challengeID].joinedUsers
                                [user].countType + "\n";
                        }
                        var userChannel = this.challengeList[challengeID]
                            .joinedUsers[user].channelID;
                        if (!(userChannel in totalWords)) {
                            totalWords[userChannel] = 0;
                        }
                        if (!(userChannel in totalLines)) {
                            totalLines[userChannel] = 0;
                        }
                        if (!(userChannel in totalPages)) {
                            totalPages[userChannel] = 0;
                        }
                        if (!(userChannel in totalMinutes)) {
                            totalMinutes[userChannel] = 0;
                        }
                        switch (this.challengeList[challengeID].
                            joinedUsers[user].countType) {
                            case "words":
                            case "word":
                                totalWords[userChannel] += parseInt(this.
                                    challengeList[challengeID].joinedUsers[user]
                                    .countData);
                                break;
                            case "lines":
                            case "line":
                                totalLines[userChannel] += parseInt(this.
                                    challengeList[challengeID].joinedUsers[user]
                                    .countData);
                                break;
                            case "pages":
                            case "page":
                                totalPages[userChannel] += parseInt(this.
                                    challengeList[challengeID].joinedUsers[user]
                                    .countData);
                                break;
                            case "minutes":
                            case "minute":
                                totalMinutes[userChannel] += parseInt(this.
                                    challengeList[challengeID].joinedUsers[user]
                                    .countData);
                                break;
                            default:
                                break;
                        }
                    }
                }
                var firstType = true;
                var summaryData = "***Statistics for " + this.challengeList
                    [challengeID].displayName + ":***\n\n" + userTotal
                    + channel.guild.name + " Total:";
                if (totalWords[channel.id] > 0) {
                    summaryData += " **" + totalWords[channel.id] + "** words";
                    firstType = false;
                }
                if (totalLines[channel.id] > 0 ) {
                    if (!firstType) {
                        summaryData += ",";
                    }
                    summaryData += " **" + totalLines[channel.id] + "** lines";
                    firstType = false;
                }
                if (totalPages[channel.id] > 0) {
                    if (!firstType) {
                        summaryData += ",";
                    }
                    summaryData += " **" + totalPages[channel.id] + "** pages";
                    firstType = false;
                }
                if (totalMinutes[channel.id] > 0) {
                    if (!firstType) {
                        summaryData += ",";
                    }
                    summaryData += " **" + totalMinutes[channel.id] + "** minutes";
                    firstType = false;
                }
                //this server's summary
                if (!firstType) {
                    channel.send(summaryData);
                }
                //other servers' summaries
                var crossServerSummary = "\n";
                var crossData = false;
                for(var i = 0; i < this.challengeList[challengeID]
                    .hookedChannels.length; i++) {
                    var currentChannel = this.challengeList[challengeID]
                        .hookedChannels[i];
                    if(currentChannel != channel.id) {
                        console.log(currentChannel);
                        var currentServer = client.channels.get(currentChannel)
                            .guild.name;
                        var serverSummary = "__*" + currentServer + "*__:";
                        var xfirstType = true;
                        if (totalWords[currentChannel] > 0) {
                            serverSummary += " **" + totalWords[currentChannel]
                                + "** words";
                            xfirstType = false;
                        }
                        if (totalLines[currentChannel] > 0 ) {
                            if (!xfirstType) {
                                serverSummary += ",";
                            }
                            serverSummary += " **" + totalLines[currentChannel]
                                + "** lines";
                            xfirstType = false;
                        }
                        if (totalPages[currentChannel] > 0) {
                            if (!xfirstType) {
                                serverSummary += ",";
                            }
                            serverSummary += " **" + totalPages[currentChannel]
                                + "** pages";
                            xfirstType = false;
                        }
                        if (totalMinutes[currentChannel] > 0) {
                            if (!xfirstType) {
                                serverSummary += ",";
                            }
                            serverSummary += " **" + totalMinutes[currentChannel]
                                + "** minutes";
                            xfirstType = false;
                        }
                        if (!xfirstType) {
                            crossData = true;
                            crossServerSummary += serverSummary + "\n";
                        }
                    }
                }
                if (crossData) {
                    if(firstType) {
                        channel.send("***Statistics for " + this.challengeList
                        [challengeID].displayName + ":***\n");
                    }
                    channel.send(crossServerSummary);
                }
            } else {
                channel.send("This challenge has not ended yet!");
            }
        } else {
            channel.send("This challenge does not exist!");
        }
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
