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
            for(var user in challengeList[challengeID].joinedUsers) {
                if(Number.isInteger(Number(challengeList[challengeID]
                    .joinedUsers[user].countData)) && challengeList[challengeID]
                    .joinedUsers[user].countType != undefined){
                    userTotal += "\n" + challengeList[challengeID].
                        joinedUsers[user].userData + ": **"
                        + challengeList[challengeID].joinedUsers[user]
                        .countData + "** " + challengeList[challengeID]
                        .joinedUsers[user].countType;
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
                            default:
                                break;
                        }
                }
            }
            totalWords += totalLines * 15;
            totalWords += totalPages * 400;
            var summaryData = "Statistics for " + challengeList
                [challengeID].displayName + ":\n" + userTotal
                + "\n\nTotal: **" + totalWords + "** words"
            if (totalLines > 0 && totalPages > 0) {
                summaryData += " (" + totalLines + " lines, "
                    + totalPages + " pages)";
            } else if (totalLines > 0) {
                summaryData += " (" + totalLines + " lines)";
            } else if (totalPages > 0) {
                summaryData += " (" + totalPages + " pages)";
            }
            channel.send(summaryData);                    
        } else {
            channel.send("This challenge has not ended yet!");
        }
    } else {
        channel.send("This challenge does not exist!");
    }
}