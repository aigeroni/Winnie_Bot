class ChallengeList {
    constructor() {
        this.DUR_AFTER = 300;
        this.challengeList = {};
    }

    generateSummary(channel, challengeID) {
        var msgToSend = "";
        if (challengeID in this.challengeList) {
            if (this.challengeList[challengeID].state >= 2) {
                var summaryServer = channel.guild;
                var userTotal = "";
                var totalWords = {};
                var totalLines = {};
                var totalPages = {};
                var totalMinutes = {};
                for(var user in this.challengeList[challengeID].joinedUsers) {
                    if(Number.isInteger(Number(this.challengeList[challengeID]
                        .joinedUsers[user].countData)) && this.challengeList
                        [challengeID].joinedUsers[user].countType != undefined){ 
                        var homeServer = client.channels.get(this
                            .challengeList[challengeID].joinedUsers[user].
                            channelID).guild.id;
                        if (homeServer == summaryServer.id) {
                            userTotal += client.users.get(user) + ": **"
                                + this.challengeList[challengeID].joinedUsers
                                [user].countData + "** "
                                + this.challengeList[challengeID].joinedUsers
                                [user].countType + "\n";
                        }
                        if (!(homeServer in totalWords)) {
                            totalWords[homeServer] = 0;
                        }
                        if (!(homeServer in totalLines)) {
                            totalLines[homeServer] = 0;
                        }
                        if (!(homeServer in totalPages)) {
                            totalPages[homeServer] = 0;
                        }
                        if (!(homeServer in totalMinutes)) {
                            totalMinutes[homeServer] = 0;
                        }
                        switch (this.challengeList[challengeID].
                            joinedUsers[user].countType) {
                            case "words":
                                totalWords[homeServer] += parseInt(this.
                                    challengeList[challengeID].joinedUsers[user]
                                    .countData);
                                break;
                            case "lines":
                                totalLines[homeServer] += parseInt(this.
                                    challengeList[challengeID].joinedUsers[user]
                                    .countData);
                                break;
                            case "pages":
                                totalPages[homeServer] += parseInt(this.
                                    challengeList[challengeID].joinedUsers[user]
                                    .countData);
                                break;
                            case "minutes":
                                totalMinutes[homeServer] += parseInt(this.
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
                    + summaryServer.name + " Total:";
                if (totalWords[summaryServer.id] > 0) {
                    summaryData += " **" + totalWords[summaryServer.id]
                        + "** words";
                    firstType = false;
                }
                if (totalLines[summaryServer.id] > 0 ) {
                    if (!firstType) {
                        summaryData += ",";
                    }
                    summaryData += " **" + totalLines[summaryServer.id]
                        + "** lines";
                    firstType = false;
                }
                if (totalPages[summaryServer.id] > 0) {
                    if (!firstType) {
                        summaryData += ",";
                    }
                    summaryData += " **" + totalPages[summaryServer.id]
                        + "** pages";
                    firstType = false;
                }
                if (totalMinutes[summaryServer.id] > 0) {
                    if (!firstType) {
                        summaryData += ",";
                    }
                    summaryData += " **" + totalMinutes[summaryServer.id]
                        + "** minutes";
                    firstType = false;
                }
                //this server's summary
                if (!firstType) {
                    msgToSend += (summaryData);
                }
                //other servers' summaries
                var crossServerSummary = "\n";
                var crossData = false;
                for(var i = 0; i < this.challengeList[challengeID]
                    .hookedChannels.length; i++) {
                    var currentChannel = this.challengeList[challengeID]
                        .hookedChannels[i];
                    var currentServer = client.channels.get(currentChannel)
                        .guild;
                    if(currentServer.id != channel.guild.id) {
                        var serverSummary = "__*" + currentServer.name + "*__:";
                        var xfirstType = true;
                        if (totalWords[currentServer] > 0) {
                            serverSummary += " **" + totalWords[currentServer]
                                + "** words";
                            xfirstType = false;
                        }
                        if (totalLines[currentServer] > 0 ) {
                            if (!xfirstType) {
                                serverSummary += ",";
                            }
                            serverSummary += " **" + totalLines[currentServer]
                                + "** lines";
                            xfirstType = false;
                        }
                        if (totalPages[currentServer] > 0) {
                            if (!xfirstType) {
                                serverSummary += ",";
                            }
                            serverSummary += " **" + totalPages[currentServer]
                                + "** pages";
                            xfirstType = false;
                        }
                        if (totalMinutes[currentServer] > 0) {
                            if (!xfirstType) {
                                serverSummary += ",";
                            }
                            serverSummary += " **" + totalMinutes[currentServer]
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
                    msgToSend += crossServerSummary;
                }
            } else {
                msgToSend = ("This challenge has not ended yet!");
            }
        } else {
            msgToSend = ("This challenge does not exist!");
        }
        if (msgToSend == "") {
            msgToSend = "No totals have been posted for this challenge yet.";
        }
        channel.send(msgToSend);
    }
}

module.exports = new ChallengeList();