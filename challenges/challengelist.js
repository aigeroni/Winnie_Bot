/** Information required for challenge creation and summary display. */
class ChallengeList {
  /** Initialise variables required for challenge creation and summaries. */
  constructor() {
    this.DUR_AFTER = 300;
    this.challengeList = {};
  }
  /**
   * Produces a per-server breakdown of user-entered totals.
   * @param {Number} challengeID - Unique ID of the challenge being summarised.
   * @return {String} - The message to send to the user.
   */
  serverTotals(challengeID) {
    const serverTotals = {};
    for (const user in this.challengeList[challengeID].joinedUsers) {
      if (
        this.challengeList[challengeID].joinedUsers[user].countType != undefined
      ) {
        const homeServer = client.channels.get(
          this.challengeList[challengeID].joinedUsers[user].channelID
        ).guild.id;
        if (serverTotals[homeServer] === undefined) {
          serverTotals[homeServer] = {
            words: [0, 0],
            lines: [0, 0],
            pages: [0, 0],
            minutes: [0, 0],
          };
        }
        const type = this.challengeList[challengeID].joinedUsers[user].countType;
        serverTotals[homeServer][type][0] += parseInt(
          this.challengeList[challengeID].joinedUsers[user].countData);
        serverTotals[homeServer][type][1] += 1;
      }
    }
    return serverTotals;
  }
  /**
   * Produces a per-user breakdown of user-entered totals.
   * @param {String} channel - Unique ID of the channel being posted to.
   * @param {Number} challengeID - Unique ID of the challenge being summarised.
   * @return {String} - The message to send to the user.
   */
  userTotals(channel, challengeID) {
    let userTotals = '';
    for (const user in this.challengeList[challengeID].joinedUsers) {
      if (this.challengeList[challengeID].joinedUsers[user].countType !=
          undefined) {
        const homeServer = client.channels.get(
            this.challengeList[challengeID].joinedUsers[user].channelID
        ).guild.id;
        if (homeServer == summaryServer.id) {
          userTotals +=
            client.users.get(user) +
            ': **' +
            this.challengeList[challengeID].joinedUsers[user].countData +
            '** ';
          if (
            this.challengeList[challengeID].joinedUsers[user]
                  .countData == 1
            ) {
            userTotals +=
              this.challengeList[challengeID].joinedUsers[
                  user
              ].countType.slice(0, -1);
          } else {
            userTotals +=
              this.challengeList[challengeID].joinedUsers[user]
                  .countType;
          }
          if (this.challengeList[challengeID].joinedUsers[user]
              .countType != 'minutes') {
              userTotals +=
              ' (**' +
              (this.challengeList[challengeID]
                .joinedUsers[user].countData /
            this.challengeList[challengeID].duration).toFixed(2) +
            '** ' +
            this.challengeList[challengeID].joinedUsers[
                user
            ].countType.slice(0, 1) +
            'pm)\n';
          } else {
            userTotal += '\n';
          }
        }
      }
    }
    return userTotals;
  }
  /**
   * Produces a per-user breakdown of user-entered totals.
   * @param {String} channel - Unique ID of the channel being posted to.
   * @param {Number} challengeID - Unique ID of the challenge being summarised.
   * @param {Object} serverTotals - Summary of user-entered totals by server.
   * @return {String} - The message to send to the user.
   */
  serverText(summaryServer, challengeID) {
    let serverText = '';
    for (const server in serverTotals) {
      let firstType = true;
      serverText += summaryServer.name + ' Total:';
      if ((summaryServer.id in challengeData)) {
        if (challengeData[summaryServer.id][words][0] > 0) {
          summaryData += ' **' + challengeData[summaryServer.id][words][0];
          if (challengeData[summaryServer.id][words][0] == 1) {
            summaryData += '** word';
          } else {
            summaryData += '** words';
          }
          summaryData += ' (**' + (
            challengeData[summaryServer.id][words][0]/
            challengeData[summaryServer.id][words][1]).toFixed(0)
            + '** avg)';
          firstType = false;
        }
        if (challengeData[summaryServer.id][lines][0] > 0) {
          if (!firstType) {
            summaryData += ',';
          }
          summaryData += ' **' + challengeData[summaryServer.id][lines][0];
          if (challengeData[summaryServer.id][lines][0] == 1) {
            summaryData += '** line';
          } else {
            summaryData += '** lines';
          }
          summaryData += ' (**' + (
            challengeData[summaryServer.id][lines][0]/
            challengeData[summaryServer.id][lines][1]).toFixed(0)
            + '** avg)';
          firstType = false;
        }
        if (challengeData[summaryServer.id][pages][0] > 0) {
          if (!firstType) {
            summaryData += ',';
          }
          summaryData += ' **' + challengeData[summaryServer.id][pages][0];
          if (challengeData[summaryServer.id][pages][0] == 1) {
            summaryData += '** page';
          } else {
            summaryData += '** pages';
          }
          summaryData += ' (**' + (
            challengeData[summaryServer.id][pages][0]/
            challengeData[summaryServer.id][pages][1]).toFixed(0)
            + '** avg)';
          firstType = false;
        }
        if (challengeData[summaryServer.id][minutes][0] > 0) {
          if (!firstType) {
            summaryData += ',';
          }
          summaryData += ' **' + challengeData[summaryServer.id][minutes][0];
          if (challengeData[summaryServer.id][minutes][0] == 1) {
            summaryData += '** minute';
          } else {
            summaryData += '** minutes';
          }
          summaryData += ' (**' + (
            challengeData[summaryServer.id][minutes][0]/
            challengeData[summaryServer.id][minutes][1]).toFixed(0)
            + '** avg)';
          firstType = false;
        }
      }
    }
    return serverText;
  }
  /**
   * Produces a per-server breakdown of user-entered totals.
   * @param {String} channel - Discord ID of the channel being posted to.
   * @param {Number} challengeID - Unique ID of the challenge being summarised.
   * @return {String} - The message to send to the user.
   */
  warSummary(channel, challengeID) {
    let returnMsg = '';
    if (this.challengeList[challengeID].state >= 2) {
      const serverTotals = serverTotals(challengeID);
      const summaryServer = channel.guild;
      returnMsg += userTotals(summaryServer, challengeID);
      returnMsg += serverText(summaryServer, challengeID, serverTotals);
      if (returnMsg == '') {
        returnMsg = '\nNobody has posted a total for this war yet.';
      }
    } else {
      returnMsg = '**Error:** This war has not ended yet.';
    }
    return returnMsg;
  }
  /**
   * Produces a per-server breakdown of user-entered totals.
   * @param {String} channel - Discord ID of the channel being posted to.
   * @param {Number} challengeID - Unique ID of the challenge being summarised.
   * @return {String} - The message to send to the user.
   */
  sprintSummary(channel, challengeID) {
    let returnMsg = '';
    if (this.challengeList[challengeID].state == 1) {
//       const summaryServer = channel.guild;
//       let userTotal = '';
//       const totalUsers = {};
//       const totalMinutes = {};
//       for (const user in this.challengeList[challengeID].joinedUsers) {
//         if (
//           this.challengeList[challengeID].joinedUsers[user].timeTaken !=
//             undefined
//         ) {
//           const homeServer = client.channels.get(
//               this.challengeList[challengeID].joinedUsers[user].channelID
//           ).guild.id;
//           if (homeServer == summaryServer.id) {
//             const wordsPerMinute = (this.challengeList[challengeID].goal /
//               this.challengeList[challengeID].joinedUsers[user].timeTaken);
//             userTotal +=
//               client.users.get(user) +
//               ': **' +
//               this.challengeList[challengeID].joinedUsers[user]
//                   .timeTaken.toFixed(2) +
//               '** minutes (**' +
//               wordsPerMinute.toFixed(2) +
//               '** wpm)\n';
//           }
//           if (!(homeServer in totalUsers)) {
//             totalUsers[homeServer] = 0;
//           }
//           if (!(homeServer in totalMinutes)) {
//             totalMinutes[homeServer] = 0;
//           }
//           totalUsers[homeServer] += 1;
//           totalMinutes[homeServer] +=
//               this.challengeList[challengeID].joinedUsers[user].timeTaken;
//         }
//       }
//       let summaryData =
//          +
//         userTotal +
//         summaryServer.name +
//         ' Time Taken:';
//       if (totalMinutes[summaryServer.id] > 0) {
//         summaryData += ' **' + totalMinutes[summaryServer.id].toFixed(2);
//         if (totalMinutes[summaryServer.id] == 1) {
//           summaryData += '** minute (**';
//         } else {
//           summaryData += '** minutes (**';
//         }
//         summaryData += ((totalUsers[summaryServer.id] *
//           this.challengeList[challengeID].goal) /
//           totalMinutes[summaryServer.id]).toFixed(2) +
//           '** wpm)';
//       }
//       // this server's summary
//       if (totalUsers[summaryServer.id] > 0) {
//         msgToSend += summaryData;
//       }
//       let crossServerSummary = '\n';
//       let crossData = false;
//       for (
//         let i = 0;
//         i < this.challengeList[challengeID].hookedChannels.length;
//         i++
//       ) {
//         const currentChannel = this.challengeList[challengeID]
//             .hookedChannels[
//                 i
//             ];
//         const currentServer = client.channels.get(currentChannel).guild;
//         if (currentServer.id != channel.guild.id) {
//           let serverSummary = '__*' + currentServer.name + '*__:';
//           if (totalMinutes[currentServer.id] > 0) {
//             serverSummary += ' **' + totalMinutes[currentServer.id]
//                 .toFixed(2);
//             if (totalMinutes[currentServer.id] == 1) {
//               serverSummary += '** minute (**';
//             } else {
//               serverSummary += '** minutes (**';
//             }
//             serverSummary += ((totalUsers[currentServer.id] *
//               this.challengeList[challengeID].goal) /
//               totalMinutes[currentServer.id]).toFixed(2) +
//               '** wpm)';
//             crossData = true;
//             crossServerSummary += serverSummary + '\n';
//           }
//         }
//       }
//       // other servers' summaries
//       if (crossData) {
//         if (totalUsers[summaryServer.id] == 0) {
//           msgToSend +=
//             ;
//         }
//         msgToSend += crossServerSummary;
//       }
      if (returnMsg == '') {
        returnMsg = '\nNobody has finished this sprint yet.';
      }
    } else {
      msgToSend = '**Error:** This sprint has not started yet.';
    }
    return returnMsg;
  }
  /**
   * Generate a summary of posted totals for a challenge.
   * @param {String} channel - Discord ID of the channel being posted to.
   * @param {Number} challengeID - Unique ID of the challenge being summarised.
   * @return {String} - The message to send to the user.
   */
  generateSummary(channel, challengeID) {
    let msgToSend = '';
    if (challengeID in this.challengeList) {
      msgToSend = '***Statistics for ' + 
        this.challengeList[challengeID].displayName +
        ':***\n\n';
      if (this.challengeList[challengeID].type == 'sprint') {
        msgToSend += this.sprintSummary(channel,challengeID);
      } else {
        msgToSend += this.warSummary(channel, challengeID);
      }
    } else {
      msgToSend = '**Error:** This challenge does not exist.';
    }
    return msgToSend;
  }
}

module.exports = new ChallengeList();
