var timerID = 1;
var challengeList = {};
var goalList = {};
var raptorCount = {};
var userRaptors = {};
var crossServerStatus = {};
var autoSumStatus = {};

exports.timerID = timerID;
exports.challengeList = challengeList;
exports.goalList = goalList;
exports.raptorCount = raptorCount;
exports.userRaptors = userRaptors;
exports.crossServerStatus = crossServerStatus;
exports.autoSumStatus = autoSumStatus;

exports.raptor = function(server, channel, author, raptorChance) {
    if (!(server in raptorCount)) {
        raptorCount[server] = 0;
        userRaptors[server] = {};
        conn.collection("raptorDB").update(
            {},
            {"server": server, "count": raptorCount[server]},
            {upsert: true}
        );
    }
    if (!(author.id in userRaptors[server])) {
        userRaptors[server][author.id] = 0;
    }
    var raptorRoll = (Math.random() * 100);
    if (raptorRoll < raptorChance) {
        raptorCount[server] += 1;
        userRaptors[server][author.id] += 1;
        conn.collection("raptorDB").update(
            {},
            {"server": server, "count": raptorCount[server]},
            {upsert: true}
        );
        conn.collection("raptorUserDB").update(
            {},
            {"server": server, "user": author.id,
                "count": userRaptors[server][author.id]},
            {upsert: true}
        );
        channel.send(author + ", you have hatched a raptor! Your server"
        + " currently houses " + raptorCount[server] + " raptors.");
    }
};

exports.generateSummary = function(channel, challengeID) {
    if (challengeID in challengeList) {
        if (challengeList[challengeID].state >= 2) {
            var userTotal = "";
            var totalWords = {};
            var totalLines = {};
            var totalPages = {};
            var totalMinutes = {};
            for(var user in challengeList[challengeID].joinedUsers) {
                if(Number.isInteger(Number(challengeList[challengeID]
                    .joinedUsers[user].countData)) && challengeList[challengeID]
                    .joinedUsers[user].countType != undefined){
                    if (challengeList[challengeID].joinedUsers[user].channelID
                        == channel.id) {
                        userTotal += challengeList[challengeID].joinedUsers
                            [user].userData + ": **" + challengeList
                            [challengeID].joinedUsers[user].countData + "** "
                            + challengeList[challengeID].joinedUsers[user]
                            .countType + "\n";
                    }
                    var userChannel = challengeList[challengeID].joinedUsers
                        [user].channelID;
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
                    switch (challengeList[challengeID].
                        joinedUsers[user].countType) {
                        case "words":
                        case "word":
                            totalWords[userChannel] += parseInt(challengeList
                                [challengeID].joinedUsers[user]
                                .countData);
                            break;
                        case "lines":
                        case "line":
                            totalLines[userChannel] += parseInt(challengeList
                                [challengeID].joinedUsers[user]
                                .countData);
                            break;
                        case "pages":
                        case "page":
                            totalPages[userChannel] += parseInt(challengeList
                                [challengeID].joinedUsers[user]
                                .countData);
                            break;
                        case "minutes":
                        case "minute":
                            totalMinutes[userChannel] += parseInt(challengeList
                                [challengeID].joinedUsers[user]
                                .countData);
                            break;
                        default:
                            break;
                    }
                }
            }
            var firstType = true;
            var summaryData = "***Statistics for " + challengeList
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
            for(var i = 0; i < challengeList[challengeID]
                .hookedChannels.length; i++) {
                var currentChannel = challengeList[challengeID]
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
                        if (!firstType) {
                            serverSummary += ",";
                        }
                        serverSummary += " **" + totalLines[currentChannel]
                            + "** lines";
                        xfirstType = false;
                    }
                    if (totalPages[currentChannel] > 0) {
                        if (!firstType) {
                            serverSummary += ",";
                        }
                        serverSummary += " **" + totalPages[currentChannel]
                            + "** pages";
                        xfirstType = false;
                    }
                    if (totalMinutes[currentChannel] > 0) {
                        if (!firstType) {
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
                if(!firstType) {
                    channel.send("***Statistics for " + challengeList
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