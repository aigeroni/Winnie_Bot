var timerID = 1;
var challengeList = {};
var goalList = {};
var raptorCount = {};

exports.timerID = timerID;
exports.challengeList = challengeList;
exports.goalList = goalList;
exports.raptorCount = raptorCount;

exports.raptor = function(server, channel, author, raptorChance) {
    if (!(server in raptorCount)) {
        raptorCount[server] = 0;
    }
    var raptorRoll = (Math.random() * 100);
	if (raptorRoll < raptorChance) {
        raptorCount[server] += 1;
        conn.collection('raptorDB').update(
            {},
            {"server": server, "count": raptorCount[server]},
            {upsert: true}
        )
		channel.send(author + ", you have hatched a raptor! Your server"
		+ " currently houses " + raptorCount[server] + " raptors.");
	}
}

exports.generateSummary = function(channel, challengeID) {
    if (challengeID in challengeList) {
        if (challengeList[challengeID].state >= 2) {
            var userTotal = "";
            var totalWords = 0;
            var totalLines = 0;
            var totalPages = 0;
            var totalMinutes = 0;
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
                        switch (challengeList[challengeID].
                            joinedUsers[user].countType) {
                            case 'words':
                                totalWords += parseInt(challengeList
                                    [challengeID].joinedUsers[user]
                                    .countData);
                                break;
                            case 'lines':
                                totalLines += parseInt(challengeList
                                    [challengeID].joinedUsers[user]
                                    .countData);
                                break; 
                            case 'pages':
                                totalPages += parseInt(challengeList
                                    [challengeID].joinedUsers[user]
                                    .countData);
                                break;
                            case 'minutes':
                                totalMinutes += parseInt(challengeList
                                    [challengeID].joinedUsers[user]
                                    .countData);
                                break;
                            default:
                                break;
                        }
                    } else {

                    }
                    
                }
            }
            var firstType = true;
            var summaryData = "***Statistics for " + challengeList
                [challengeID].displayName + ":***\n\n" + userTotal
                + "Total:";
            if (totalWords > 0) {
                summaryData += " **" + totalWords + "** words";
                firstType = false;
            }
            if (totalLines > 0 ) {
                if (firstType) {
                    summaryData += ",";
                }
                summaryData += " **" + totalLines + "** lines";
                firstType = false;
            }
            if (totalPages > 0) {
                if (firstType) {
                    summaryData += ",";
                }
                summaryData += " **" + totalPages + "** pages";
                firstType = false;
            }
            if (totalMinutes > 0) {
                if (firstType) {
                    summaryData += ",";
                }
                summaryData += " **" + totalMinutes + "** minutes";
                firstType = false;
            }
            //this server's summary
            if (!firstType) {
                channel.send(summaryData);
            }
            //other servers' summaries
            // var crossServerSummary = "";
            // for (item in hookedChannels) {
            //     if(item != channel to send) {
            //         if (totalWords > 0) {
            //             summaryData += " **" + totalWords + "** words";
            //             firstType = false;
            //         }
            //         if (totalLines > 0 ) {
            //             if (firstType) {
            //                 summaryData += ",";
            //             }
            //             summaryData += " **" + totalLines + "** lines";
            //             firstType = false;
            //         }
            //         if (totalPages > 0) {
            //             if (firstType) {
            //                 summaryData += ",";
            //             }
            //             summaryData += " **" + totalPages + "** pages";
            //             firstType = false;
            //         }
            //         if (totalMinutes > 0) {
            //             if (firstType) {
            //                 summaryData += ",";
            //             }
            //             summaryData += " **" + totalMinutes + "** minutes";
            //             firstType = false;
            //         }
            //     }
            // }
            // channel.send(crossServerSummary);
        } else {
            channel.send("This challenge has not ended yet!");
        }
    } else {
        channel.send("This challenge does not exist!");
    }
}