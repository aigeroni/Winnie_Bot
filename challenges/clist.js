/** Information required for challenge creation and summary display. */
class ChallengeList {
  /** Initialise variables required for challenge creation and summaries. */
  constructor() {
    this.DUR_AFTER = 30;
    this.running = {};
  }
  /**
   * Gets a server from a channel ID.
   * @param {String} channel - The channel to get the parent server of.
   * @return {String} - The relevant server.
   */
  getServerFromID(channel) {
    return client.channels.get(channel).guild.id;
  }
  /**
   * Produces a per-server breakdown of user-entered totals.
   * @param {String} challengeID - Unique ID of the challenge being summarised.
   * @return {String} - The message to send to the user.
   */
  serverTotals(challengeID) {
    const serverTotals = {};
    for (const user in this.running[challengeID].joinedUsers) {
      const homeServer = this.getServerFromID(
        this.running[challengeID].joinedUsers[user].channelID);
      const type = this.running[challengeID].joinedUsers[user].countType;
      if (type != undefined) {
        if (serverTotals[homeServer] === undefined) {
          serverTotals[homeServer] = {
            words: [0, 0],
            lines: [0, 0],
            pages: [0, 0],
            minutes: [0, 0],
          };
        }
        serverTotals[homeServer][type][0] += parseInt(
          this.running[challengeID].joinedUsers[user].countData);
        serverTotals[homeServer][type][1] += 1;
      }
    }
    return serverTotals;
  }
  /**
   * Produces a per-user breakdown of user-entered totals.
   * @param {String} summaryServer - The server being summarised.
   * @param {Number} challengeID - Unique ID of the challenge being summarised.
   * @return {String} - The message to send to the user.
   */
  userTotals(summaryServer, challengeID) {
    let userTotals = '';
    for (const user in this.running[challengeID].joinedUsers) {
      const homeServer = this.getServerFromID(
        this.running[challengeID].joinedUsers[user].channelID);
      if (this.running[challengeID].joinedUsers[user].countType !=
          undefined && homeServer == summaryServer.id) {
        userTotals +=
          client.users.get(user) +
          ': **' +
          this.running[challengeID].joinedUsers[user].countData +
          '** ';
        if (
          this.running[challengeID].joinedUsers[user]
                .countData == 1
          ) {
          userTotals +=
            this.running[challengeID].joinedUsers[
                user
            ].countType.slice(0, -1);
        } else {
          userTotals +=
            this.running[challengeID].joinedUsers[user]
                .countType;
        }
        if (this.running[challengeID].joinedUsers[user]
            .countType != 'minutes') {
            userTotals +=
            ' (**' +
            (this.running[challengeID]
              .joinedUsers[user].countData /
          this.running[challengeID].duration).toFixed(2) +
          '** ' +
          this.running[challengeID].joinedUsers[
              user
          ].countType.slice(0, 1) +
          'pm)';
        }
        userTotals += '\n';
      }
    }
    return userTotals;
  }
  /**
   * Produces a per-user breakdown of user-entered totals.
   * @param {String} summaryServer - Snowflake of the server being posted to.
   * @param {Object} serverTotals - Summary of user-entered totals by server.
   * @return {String} - The message to send to the user.
   */
  serverText(server, serverTotals) {
    let serverText = '';
    if ((server in serverTotals)) {
      serverText += '__' +  client.guilds.get(server).name + '__:';
      let firstType = true;
      for (const item in serverTotals[server]) {
        if (serverTotals[server][item][1] > 0) {
          if (!firstType) {
            serverText = ", ";
          }
          serverText += ' **' + serverTotals[server][item][0];
          if (serverTotals[server][item][0] == 1) {
            serverText += '** ' + item.slice(0, -1);
          } else {
            serverText += '** ' + item;
          }
          serverText += ' (**' + (
            serverTotals[server][item][0]/
            serverTotals[server][item][1]).toFixed(0)
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
    if (this.running[challengeID].state >= 2) {
      const serverTotals = this.serverTotals(challengeID);
      const summaryServer = channel.guild;
      returnMsg += this.userTotals(summaryServer, challengeID); + '\n';
      for (const server in serverTotals) {
        returnMsg += this.serverText(server, serverTotals);
      }
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
    if (this.running[challengeID].state == 1) {
//       const summaryServer = channel.guild;
//       let userTotal = '';
//       const totalUsers = {};
//       const totalMinutes = {};
//       for (const user in this.running[challengeID].joinedUsers) {
//         if (
//           this.running[challengeID].joinedUsers[user].timeTaken !=
//             undefined
//         ) {
//           const homeServer = client.channels.get(
//               this.running[challengeID].joinedUsers[user].channelID
//           ).guild.id;
//           if (homeServer == summaryServer.id) {
//             const wordsPerMinute = (this.running[challengeID].goal /
//               this.running[challengeID].joinedUsers[user].timeTaken);
//             userTotal +=
//               client.users.get(user) +
//               ': **' +
//               this.running[challengeID].joinedUsers[user]
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
//               this.running[challengeID].joinedUsers[user].timeTaken;
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
//           this.running[challengeID].goal) /
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
//         i < this.running[challengeID].hookedChannels.length;
//         i++
//       ) {
//         const currentChannel = this.running[challengeID]
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
//               this.running[challengeID].goal) /
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
    if (challengeID in this.running) {
      msgToSend = '***Statistics for ' + 
        this.running[challengeID].displayName +
        ':***\n\n';
      if (this.running[challengeID].type == 'sprint') {
        msgToSend += this.sprintSummary(channel, challengeID);
      } else {
        msgToSend += this.warSummary(channel, challengeID);
      }
      if (this.running[challengeID].type == 'chain war' &&
        this.running[challengeID].current ==
        this.running[challengeID].total) {
          msgToSend += '\n\n' + this.chainSummary(channel, challengeID);
      }
    } else {
      msgToSend = '**Error:** This challenge does not exist.';
    }
    return msgToSend;
  }
}

  /** Generate a summary for all wars in a chain. */
  // chainSummary() {
  //   const channels = [];
  //   for (const user in this.chainTotal) {
  //     if (this.chainTotal.hasOwnProperty(user)) {
  //       if (channels.indexOf(this.chainTotal[user].channelID) == -1) {
  //         channels.push(this.chainTotal[user].channelID);
  //       }
  //     }
  //   }
  //   for (let i = 0; i < channels.length; i++) {
  //     let summaryData = '***Summary for ' + this.warName + ':***\n\n';
  //     const userTotals = {words: {}, lines: {}, pages: {}, minutes: {}};
  //     const summaryServer = client.channels.get(channels[i]).guild;
  //     for (const user in this.chainTotal) {
  //       if (this.chainTotal.hasOwnProperty(user)) {
  //         const userServer =
  //           client.channels.get(this.chainTotal[user].channelID).guild;
  //         if (
  //           summaryServer.id == userServer.id
  //         ) {
  //           if (!(userServer.id in userTotals['words'])) {
  //             userTotals['words'][userServer.id] = [0, 0];
  //           }
  //           if (!(userServer.id in userTotals['lines'])) {
  //             userTotals['lines'][userServer.id] = [0, 0];
  //           }
  //           if (!(userServer.id in userTotals['pages'])) {
  //             userTotals['pages'][userServer.id] = [0, 0];
  //           }
  //           if (!(userServer.id in userTotals['minutes'])) {
  //             userTotals['minutes'][userServer.id] = [0, 0];
  //           }
  //           let userTotal = client.users.get(user) + ': ';
  //           let firstType = true;
  //           if (this.chainTotal[user].words[0] > 0) {
  //             userTotals['words'][userServer.id][0] +=
  //               this.chainTotal[user].words[0];
  //             userTotals['words'][userServer.id][1] += 1;
  //             userTotal +=
  //               '**' +
  //               this.chainTotal[user].words[0] +
  //               '** ';
  //             if (this.chainTotal[user].words[0] == 1) {
  //               userTotal += 'word';
  //             } else {
  //               userTotal += 'words';
  //             }
  //             userTotal += ' (**' +
  //               (this.chainTotal[user].words[0] /
  //                 this.chainTotal[user].words[1]).toFixed(2) +
  //               '** words per war)';
  //             firstType = false;
  //           }
  //           if (this.chainTotal[user].lines[0] > 0) {
  //             userTotals['lines'][userServer.id][0] +=
  //               this.chainTotal[user].lines[0];
  //             userTotals['lines'][userServer.id][1] += 1;
  //             if (!(firstType)) {
  //               userTotal += ', ';
  //             }
  //             userTotal +=
  //               '**' +
  //               this.chainTotal[user].lines[0] +
  //               '** ';
  //             if (this.chainTotal[user].lines[0] == 1) {
  //               userTotal += 'line';
  //             } else {
  //               userTotal += 'lines';
  //             }
  //             userTotal += ' (**' +
  //               (this.chainTotal[user].lines[0] /
  //                 this.chainTotal[user].lines[1]).toFixed(2) +
  //               '** lines per war)';
  //             firstType = false;
  //           }
  //           if (this.chainTotal[user].pages[0] > 0) {
  //             userTotals['pages'][userServer.id][0] +=
  //               this.chainTotal[user].pages[0];
  //             userTotals['pages'][userServer.id][1] += 1;
  //             if (!(firstType)) {
  //               userTotal += ', ';
  //             }
  //             userTotal +=
  //               '**' +
  //               this.chainTotal[user].pages[0] +
  //               '** ';
  //             if (this.chainTotal[user].pages[0] == 1) {
  //               userTotal += 'page';
  //             } else {
  //               userTotal += 'pages';
  //             }
  //             userTotal += ' (**' +
  //               (this.chainTotal[user].pages[0] /
  //                 this.chainTotal[user].pages[1]).toFixed(2) +
  //               '** pages per war)';
  //             firstType = false;
  //           }
  //           if (this.chainTotal[user].minutes[0] > 0) {
  //             userTotals['minutes'][userServer.id][0] +=
  //               this.chainTotal[user].minutes[0];
  //             userTotals['minutes'][userServer.id][1] += 1;
  //             if (!(firstType)) {
  //               userTotal += ', ';
  //             }
  //             userTotal +=
  //               '**' +
  //               this.chainTotal[user].minutes[0] +
  //               '** ';
  //             if (this.chainTotal[user].minutes[0] == 1) {
  //               userTotal += 'minute';
  //             } else {
  //               userTotal += 'minutes';
  //             }
  //             userTotal += ' (**' +
  //               (this.chainTotal[user].minutes[0] /
  //                 this.chainTotal[user].minutes[1]).toFixed(2) +
  //               '** minutes per war)';
  //             firstType = false;
  //           }
  //           if (!(firstType)) {
  //             summaryData += userTotal + '\n';
  //           }
  //         } else {
  //           if (!(userServer.id in userTotals['words'])) {
  //             userTotals['words'][userServer.id] = [0, 0];
  //           }
  //           if (!(userServer.id in userTotals['lines'])) {
  //             userTotals['lines'][userServer.id] = [0, 0];
  //           }
  //           if (!(userServer.id in userTotals['pages'])) {
  //             userTotals['pages'][userServer.id] = [0, 0];
  //           }
  //           if (!(userServer.id in userTotals['minutes'])) {
  //             userTotals['minutes'][userServer.id] = [0, 0];
  //           }
  //           if (this.chainTotal[user].words[0] > 0) {
  //             userTotals['words'][userServer.id][0] +=
  //               this.chainTotal[user].words[0];
  //             userTotals['words'][userServer.id][1] += 1;
  //           }
  //           if (this.chainTotal[user].lines[0] > 0) {
  //             userTotals['lines'][userServer.id][0] +=
  //               this.chainTotal[user].lines[0];
  //             userTotals['lines'][userServer.id][1] += 1;
  //           }
  //           if (this.chainTotal[user].pages[0] > 0) {
  //             userTotals['pages'][userServer.id][0] +=
  //               this.chainTotal[user].pages[0];
  //             userTotals['pages'][userServer.id][1] += 1;
  //           }
  //           if (this.chainTotal[user].minutes[0] > 0) {
  //             userTotals['minutes'][userServer.id][0] +=
  //               this.chainTotal[user].minutes[0];
  //             userTotals['minutes'][userServer.id][1] += 1;
  //           }
  //         }
  //       }
  //     }
  //     // this channel's summary
  //     summaryData += summaryServer.name + ' Total:';
  //     let firstType = true;
  //     if (userTotals['words'][summaryServer.id][0] > 0) {
  //       summaryData += ' **' + userTotals['words'][summaryServer.id][0];
  //       if (userTotals['words'][summaryServer.id][0] == 1) {
  //         summaryData += '** word';
  //       } else {
  //         summaryData += '** words';
  //       }
  //       summaryData += ' (**' + (
  //         userTotals['words'][summaryServer.id][0]/
  //         userTotals['words'][summaryServer.id][1]).toFixed(0)
  //         + '** avg)';
  //       firstType = false;
  //     }
  //     if (userTotals['lines'][summaryServer.id][0] > 0) {
  //       if (!firstType) {
  //         summaryData += ',';
  //       }
  //       summaryData += ' **' + userTotals['lines'][summaryServer.id][0];
  //       if (userTotals['lines'][summaryServer.id][0] == 1) {
  //         summaryData += '** line';
  //       } else {
  //         summaryData += '** lines';
  //       }
  //       summaryData += ' (**' + (
  //         userTotals['lines'][summaryServer.id][0]/
  //         userTotals['lines'][summaryServer.id][1]).toFixed(0)
  //         + '** avg)';
  //       firstType = false;
  //     }
  //     if (userTotals['pages'][summaryServer.id][0] > 0) {
  //       if (!firstType) {
  //         summaryData += ',';
  //       }
  //       summaryData += ' **' + userTotals['pages'][summaryServer.id][0];
  //       if (userTotals['pages'][summaryServer.id][0] == 1) {
  //         summaryData += '** page';
  //       } else {
  //         summaryData += '** pages';
  //       }
  //       summaryData += ' (**' + (
  //         userTotals['pages'][summaryServer.id][0]/
  //         userTotals['pages'][summaryServer.id][1]).toFixed(0)
  //         + '** avg)';
  //       firstType = false;
  //     }
  //     if (userTotals['minutes'][summaryServer.id][0] > 0) {
  //       if (!firstType) {
  //         summaryData += ',';
  //       }
  //       summaryData += ' **' + userTotals['minutes'][summaryServer.id][0];
  //       if (userTotals['minutes'][summaryServer.id][0] == 1) {
  //         summaryData += '** minute';
  //       } else {
  //         summaryData += '** minutes';
  //       }
  //       summaryData += ' (**' + (
  //         userTotals['minutes'][summaryServer.id][0]/
  //         userTotals['minutes'][summaryServer.id][1]).toFixed(0)
  //         + '** avg)';
  //       firstType = false;
  //     }
  //     summaryData += '\n';
  //     // other channels' summaries
  //     for (let j = 0; j < channels.length; j++) {
  //       const currentServer = client.channels.get(channels[j]).guild;
  //       if (currentServer.id != summaryServer.id) {
  //         summaryData += '__*' + currentServer.name + '*__:';
  //         let xfirstType = true;
  //         if (userTotals['words'][currentServer.id][0] > 0) {
  //           summaryData += ' **' + userTotals['words'][currentServer.id][0];
  //           if (userTotals['words'][currentServer.id][0] == 1) {
  //             summaryData += '** word';
  //           } else {
  //             summaryData += '** words';
  //           }
  //           summaryData += ' (**' + (
  //             userTotals['words'][currentServer.id][0]/
  //             userTotals['words'][currentServer.id][1]).toFixed(0)
  //             + '** avg)';
  //           xfirstType = false;
  //         }
  //         if (userTotals['lines'][currentServer.id][0] > 0) {
  //           if (!xfirstType) {
  //             summaryData += ',';
  //           }
  //           summaryData += ' **' + userTotals['lines'][currentServer.id][0];
  //           if (userTotals['lines'][currentServer.id][0] == 1) {
  //             summaryData += '** line';
  //           } else {
  //             summaryData += '** lines';
  //           }
  //           summaryData += ' (**' + (
  //             userTotals['lines'][currentServer.id][0]/
  //             userTotals['lines'][currentServer.id][1]).toFixed(0)
  //             + '** avg)';
  //           xfirstType = false;
  //         }
  //         if (userTotals['pages'][currentServer.id][0] > 0) {
  //           if (!xfirstType) {
  //             summaryData += ',';
  //           }
  //           summaryData += ' **' + userTotals['pages'][currentServer.id][0];
  //           if (userTotals['pages'][currentServer.id][0] == 1) {
  //             summaryData += '** page';
  //           } else {
  //             summaryData += '** pages';
  //           }
  //           summaryData += ' (**' + (
  //             userTotals['pages'][currentServer.id][0]/
  //             userTotals['pages'][currentServer.id][1]).toFixed(0)
  //             + '** avg)';
  //           xfirstType = false;
  //         }
  //         if (userTotals['minutes'][currentServer.id][0] > 0) {
  //           if (!xfirstType) {
  //             summaryData += ',';
  //           }
  //           summaryData += ' **' + userTotals['minutes'][currentServer.id][0];
  //           if (userTotals['minutes'][currentServer.id][0] == 1) {
  //             summaryData += '** minute';
  //           } else {
  //             summaryData += '** minutes';
  //           }
  //           summaryData += ' (**' + (
  //             userTotals['minutes'][currentServer.id][0]/
  //             userTotals['minutes'][currentServer.id][1]).toFixed(0)
  //             + '** avg)';
  //           xfirstType = false;
  //         }
  //         summaryData += '\n';
  //       }
  //     }
  //     // send summary
  //     client.channels.get(channels[i]).send(summaryData);
  //   }

module.exports = new ChallengeList();
