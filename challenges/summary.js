const chalData = require("./data.js");
const mongoose = require("mongoose");

conn = mongoose.connection;

exports.listChallenges = function(client,msg) {
    if(Object.keys(chalData.challengeList).length == 0) {
        msg.channel.send("There are no challenges running."
            + " Why don't you start one?");
    } else {
        if(Object.keys(chalData.challengeList).length == 1) {
            var timerInfo = "There is " + Object.keys(chalData
                .challengeList).length + " challenge running:\n";
        } else {
            var timerInfo = "There are " + Object.keys(chalData
                .challengeList).length + " challenges running:\n";
        }
        for(var i in chalData.challengeList) {
            // check whether a challenge is hidden
            if (!(chalData.challengeList[i].hidden &&
                chalData.challengeList[i].channelID
                != msg.channel.id)) {
                // find originating server name
                var parentChannel = client.channels.get(chalData
                    .challengeList[i].channelID);
                var parentGuild = parentChannel.guild;
                var parentGuildName = parentGuild.name;
                switch(chalData.challengeList[i].state){
                    case 0:
                        var timeout = "";
                        if ((chalData.challengeList[i].cStart % 60)
                             < 10) {
                            timeout = "0" + (chalData.challengeList[i]
                                .cStart % 60).toString();
                        } else {
                            timeout = chalData.challengeList[i].cStart
                                % 60;
                        }
                        timerInfo += i + ": " + chalData.challengeList
                            [i].displayName + " (";
                        if (chalData.challengeList[i].type ==
                            "sprint") {
                            timerInfo += chalData.challengeList[i].goal
                                + " words, ";
                        }
                        timerInfo += chalData.challengeList[i].duration
                            + " minutes, starts in "
                            + Math.floor(chalData.challengeList[i]
                            .cStart/ 60) + ":" + timeout + "), "
                            + parentGuildName + "\n";
                        break;
                    case 1:
                        var timeout = "";
                        if ((chalData.challengeList[i].cDur % 60)
                            < 10) {
                            timeout = "0" + (chalData.challengeList[i]
                                .cDur % 60).toString();
                        } else {
                            timeout = chalData.challengeList[i].cDur
                                % 60;
                        }
                        timerInfo += i + ": " + chalData.challengeList
                            [i].displayName +  " (";
                        if (chalData.challengeList[i].type == "sprint")
                            {
                            timerInfo += chalData.challengeList[i].goal
                            + " words, ";
                        }
                        timerInfo += chalData.challengeList[i].duration
                            + " minutes, "
                            + Math.floor(chalData.challengeList[i].cDur
                            / 60) + ":" + timeout + " remaining), "
                            + parentGuildName + "\n";
                        break;
                    case 2:
                    case 3:
                        timerInfo += i + ": " + chalData.challengeList
                            [i].displayName +  " (";
                        if (chalData.challengeList[i].type == "sprint")
                            {
                            timerInfo += chalData.challengeList[i].goal
                            + " words, ";
                        }
                        timerInfo += chalData.challengeList[i].duration
                        + " minutes, ended), " + parentGuildName + "\n";
                        break;
                    default:
                        break;
                }
            }
        }
        msg.channel.send(timerInfo);
    }
};

exports.addTotal = function(msg,suffix) {
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
        if (challengeID in chalData.challengeList) {
            if (chalData.challengeList[challengeID].state >= 2) {
                if (!(chalData.challengeList[challengeID].hidden &&
                    chalData.challengeList[challengeID].channelID
                    != msg.channel.id)) {
                    if(Number.isInteger(Number(wordsWritten))){
                        for(user in chalData.challengeList[challengeID]
                            .joinedUsers) {
                            if(user == msg.author.id) {
                                if(!(chalData.challengeList
                                    [challengeID].joinedUsers[user]
                                    .countData === undefined)) {
                                    raptorCheck = false;
                                }
                            }
                        }
                        if (Number(wordsWritten) < 1) {
                            raptorCheck = false;
                        }
                        chalData.challengeList[challengeID]
                            .joinedUsers[msg.author.id] = {
                            "countData": wordsWritten,
                            "countType": writtenType,
                            "channelID": msg.channel.id};
                        try {
                            conn.collection("challengeDB").update(
                                {_id: parseInt(challengeID)},
                                {$set: {"joinedUsers":
                                    chalData.challengeList
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
                        + " permission to join this challenge.")
                }
            } else {
                msg.channel.send("This challenge has not ended yet!");
            }
        } else {
            msg.channel.send("This challenge does not exist!");
        }
    }
    return raptorCheck;
};

exports.generateSummary = function(channel, challengeID) {
    if (challengeID in chalData.challengeList) {
        if (chalData.challengeList[challengeID].state >= 2) {
            var userTotal = "";
            var totalWords = {};
            var totalLines = {};
            var totalPages = {};
            var totalMinutes = {};
            for(var user in chalData.challengeList[challengeID].joinedUsers) {
                if(Number.isInteger(Number(chalData.challengeList[challengeID]
                    .joinedUsers[user].countData)) && chalData.challengeList
                    [challengeID].joinedUsers[user].countType != undefined){
                    if (chalData.challengeList[challengeID].joinedUsers[user]
                        .channelID == channel.id) {
                        userTotal += client.users.get(user) + ": **"
                            + chalData.challengeList[challengeID].joinedUsers
                            [user].countData + "** "
                            + chalData.challengeList[challengeID].joinedUsers
                            [user].countType + "\n";
                    }
                    var userChannel = chalData.challengeList[challengeID]
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
                    switch (chalData.challengeList[challengeID].
                        joinedUsers[user].countType) {
                        case "words":
                        case "word":
                            totalWords[userChannel] += parseInt(chalData.
                                challengeList[challengeID].joinedUsers[user]
                                .countData);
                            break;
                        case "lines":
                        case "line":
                            totalLines[userChannel] += parseInt(chalData.
                                challengeList[challengeID].joinedUsers[user]
                                .countData);
                            break;
                        case "pages":
                        case "page":
                            totalPages[userChannel] += parseInt(chalData.
                                challengeList[challengeID].joinedUsers[user]
                                .countData);
                            break;
                        case "minutes":
                        case "minute":
                            totalMinutes[userChannel] += parseInt(chalData.
                                challengeList[challengeID].joinedUsers[user]
                                .countData);
                            break;
                        default:
                            break;
                    }
                }
            }
            var firstType = true;
            var summaryData = "***Statistics for " + chalData.challengeList
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
            for(var i = 0; i < chalData.challengeList[challengeID]
                .hookedChannels.length; i++) {
                var currentChannel = chalData.challengeList[challengeID]
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
                    channel.send("***Statistics for " + chalData.challengeList
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
};