/** Information required for challenge creation and summary display. */
class ChallengeList {
  /** Initialise variables required for challenge creation and summaries. */
  constructor() {
    this.DUR_AFTER = 300;
    this.challengeList = {};
  }
  /**
   * Generate a summary of posted totals for a challenge.
   * @param {Number} channel - Discord ID of the channel being posted to.
   * @param {Number} challengeID - Unique ID of the challenge being summarised.
   */
  generateSummary(channel, challengeID) {
    let msgToSend = '';
    if (challengeID in this.challengeList) {
      if (this.challengeList[challengeID].state >= 2) {
        const summaryServer = channel.guild;
        let userTotal = '';
        const totalWords = {};
        const totalLines = {};
        const totalPages = {};
        const totalMinutes = {};
        for (const user in this.challengeList[challengeID].joinedUsers) {
          if (
            Number.isInteger(
                Number(
                    this.challengeList[challengeID].joinedUsers[user].countData
                )
            ) &&
            this.challengeList[challengeID].joinedUsers[user].countType !=
              undefined
          ) {
            const homeServer = client.channels.get(
                this.challengeList[challengeID].joinedUsers[user].channelID
            ).guild.id;
            if (homeServer == summaryServer.id) {
              userTotal +=
                client.users.get(user) +
                ': **' +
                this.challengeList[challengeID].joinedUsers[user].countData +
                '** ';
              if (
                this.challengeList[challengeID].joinedUsers[user].countData == 1
              ) {
                userTotal +=
                  this.challengeList[challengeID].joinedUsers[
                      user
                  ].countType.slice(0, -1) + '\n';
              } else {
                userTotal +=
                  this.challengeList[challengeID].joinedUsers[user].countType +
                  '\n';
              }
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
            switch (
              this.challengeList[challengeID].joinedUsers[user].countType
            ) {
              case 'words':
                totalWords[homeServer] += parseInt(
                    this.challengeList[challengeID].joinedUsers[user].countData
                );
                break;
              case 'lines':
                totalLines[homeServer] += parseInt(
                    this.challengeList[challengeID].joinedUsers[user].countData
                );
                break;
              case 'pages':
                totalPages[homeServer] += parseInt(
                    this.challengeList[challengeID].joinedUsers[user].countData
                );
                break;
              case 'minutes':
                totalMinutes[homeServer] += parseInt(
                    this.challengeList[challengeID].joinedUsers[user].countData
                );
                break;
              default:
                break;
            }
          }
        }
        let firstType = true;
        let summaryData =
          '***Statistics for ' +
          this.challengeList[challengeID].displayName +
          ':***\n\n' +
          userTotal +
          summaryServer.name +
          ' Total:';
        if (totalWords[summaryServer.id] > 0) {
          summaryData += ' **' + totalWords[summaryServer.id];
          if (totalWords[summaryServer.id] == 1) {
            summaryData += '** word';
          } else {
            summaryData += '** words';
          }
          firstType = false;
        }
        if (totalLines[summaryServer.id] > 0) {
          if (!firstType) {
            summaryData += ',';
          }
          summaryData += ' **' + totalLines[summaryServer.id];
          if (totalLines[summaryServer.id] == 1) {
            summaryData += '** line';
          } else {
            summaryData += '** lines';
          }
          firstType = false;
        }
        if (totalPages[summaryServer.id] > 0) {
          if (!firstType) {
            summaryData += ',';
          }
          summaryData += ' **' + totalPages[summaryServer.id];
          if (totalPages[summaryServer.id] == 1) {
            summaryData += '** page';
          } else {
            summaryData += '** pages';
          }
          firstType = false;
        }
        if (totalMinutes[summaryServer.id] > 0) {
          if (!firstType) {
            summaryData += ',';
          }
          summaryData += ' **' + totalMinutes[summaryServer.id];
          if (totalMinutes[summaryServer.id] == 1) {
            summaryData += '** minute';
          } else {
            summaryData += '** minutes';
          }
          firstType = false;
        }
        // this server's summary
        if (!firstType) {
          msgToSend += summaryData;
        }
        // other servers' summaries
        let crossServerSummary = '\n';
        let crossData = false;
        for (
          let i = 0;
          i < this.challengeList[challengeID].hookedChannels.length;
          i++
        ) {
          const currentChannel = this.challengeList[challengeID].hookedChannels[
              i
          ];
          const currentServer = client.channels.get(currentChannel).guild;
          if (currentServer.id != channel.guild.id) {
            let serverSummary = '__*' + currentServer.name + '*__:';
            let xfirstType = true;
            if (totalWords[currentServer.id] > 0) {
              serverSummary += ' **' + totalWords[currentServer.id];
              if (totalWords[currentServer.id] == 1) {
                serverSummary += '** word';
              } else {
                serverSummary += '** words';
              }
              xfirstType = false;
            }
            if (totalLines[currentServer.id] > 0) {
              if (!xfirstType) {
                serverSummary += ',';
              }
              serverSummary += ' **' + totalLines[currentServer.id];
              if (totalLines[currentServer.id] == 1) {
                serverSummary += '** line';
              } else {
                serverSummary += '** lines';
              }
              xfirstType = false;
            }
            if (totalPages[currentServer.id] > 0) {
              if (!xfirstType) {
                serverSummary += ',';
              }
              serverSummary += ' **' + totalPages[currentServer.id];
              if (totalPages[currentServer.id] == 1) {
                serverSummary += '** page';
              } else {
                serverSummary += '** pages';
              }
              xfirstType = false;
            }
            if (totalMinutes[currentServer.id] > 0) {
              if (!xfirstType) {
                serverSummary += ',';
              }
              serverSummary += ' **' + totalMinutes[currentServer.id];
              if (totalMinutes[currentServer.id] == 1) {
                serverSummary += '** minute';
              } else {
                serverSummary += '** minutes';
              }
              xfirstType = false;
            }
            if (!xfirstType) {
              crossData = true;
              crossServerSummary += serverSummary + '\n';
            }
          }
        }
        if (crossData) {
          if (firstType) {
            msgToSend +=
              '***Statistics for ' +
              this.challengeList[challengeID].displayName +
              ':***\n';
          }
          msgToSend += crossServerSummary;
        }
      } else {
        msgToSend = 'This challenge has not ended yet!';
      }
    } else {
      msgToSend = 'This challenge does not exist!';
    }
    if (msgToSend == '') {
      msgToSend =
        '***Statistics for ' +
        this.challengeList[challengeID].displayName +
        ':***\nNo totals have been posted for this' +
        ' challenge yet.';
    }
    channel.send(msgToSend);
  }
}

module.exports = new ChallengeList();
