/** Information required for challenge creation and summary display. */
class ChallengeList {
  /** Initialise variables required for challenge creation and summaries. */
  constructor() {
    this.DUR_AFTER = 30;
    this.running = {};
  }
  /**
   * Updates the database
   * @param  {String} db - The database to update.
   * @param {String} id - The ID of the field to update.
   * @param {String} info - The data to update with.
   * @return {Object} - User data.
   */
  async dbUpdate(db, id, info) {
    await conn.collection(db).update(
        {_id: id},
        {
          info,
        },
        {upsert: true}
    );
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
   * Adds an object to an aggregate list of totals.
   * @param {Object} serverList - The object to add to.
   * @param {String} server - The object to add.
   * @return {String} - The relevant server.
   */
  addToAggregate(serverList, server) {
    if (serverList[server] === undefined) {
      serverList[server] = {
        words: [0, 0],
        lines: [0, 0],
        pages: [0, 0],
        minutes: [0, 0],
      };
    }
    return serverList;
  }
  /**
   * Produces a per-server breakdown of user-entered totals.
   * @param {String} challengeID - Unique ID of the challenge being summarised.
   * @return {String} - The message to send to the user.
   */
  serverTotals(challengeID) {
    let serverTotals = {};
    for (const user in this.running[challengeID].joined) {
      if (this.running[challengeID].joined[user].countType != undefined) {
        const homeServer = this.getServerFromID(
            this.running[challengeID].joined[user].channelID);
        serverTotals = this.addToAggregate(serverTotals, homeServer);
        serverTotals[homeServer][this.running[challengeID]
            .joined[user].countType][0] +=
            parseInt(this.running[challengeID].joined[user].countData);
        serverTotals[homeServer][this.running[challengeID]
            .joined[user].countType][1] += 1;
      }
    }
    return serverTotals;
  }
  /**
   * Summarises a user's total.
   * @param {String} user - The Discord ID of the user.
   * @param {Number} total - The user's productivity during the challenge.
   * @param {String} type - The type of the total.
   * @param {Number} time - The duration of the challenge.
   * @return {String} - The message to send to the user.
   */
  userTotals(user, total, type, time) {
    let userTotal = '';
    if (type == 'sprint') {
      userTotal +=
        client.users.get(user) + ': **' + time.toFixed(2) + '** minutes';
      type = 'words';
    } else if (total == 1) {
      userTotal +=
        client.users.get(user) + ': **' + total + '** ' + type.slice(0, -1);
    } else {
      userTotal += client.users.get(user) + ': **' + total + '** ' + type;
    }
    if (type != 'minutes') {
      userTotal +=
        ' (**' + (total/time).toFixed(2) + '** ' + type.slice(0, 1) + 'pm)';
    }
    userTotal += '\n';
    return userTotal;
  }
  /**
   * Produces a per-user breakdown of user-entered totals for a war.
   * @param {String} summaryServer - The server being summarised.
   * @param {Number} challengeID - Unique ID of the challenge being summarised.
   * @return {String} - The message to send to the user.
   */
  warByUser(summaryServer, challengeID) {
    let userTotals = '';
    for (const user in this.running[challengeID].joined) {
      if (this.running[challengeID].joined[user].countType != undefined &&
        (this.getServerFromID(this.running[challengeID]
            .joined[user].channelID) == summaryServer.id)) {
        userTotals += this.userTotals(
            user,
            this.running[challengeID].joined[user].countData,
            this.running[challengeID].joined[user].countType,
            this.running[challengeID].duration
        );
      }
    }
    return userTotals;
  }
  /**
   * Produces a per-user breakdown of user-entered totals for a sprint.
   * @param {String} summaryServer - The server being summarised.
   * @param {Number} challengeID - Unique ID of the challenge being summarised.
   * @return {String} - The message to send to the user.
   */
  sprintByUser(summaryServer, challengeID) {
    let userTotals = '';
    for (const user in this.running[challengeID].joined) {
      if (this.running[challengeID].joined[user].timeTaken != undefined &&
        (this.getServerFromID(this.running[challengeID]
            .joined[user].channelID) == summaryServer.id)) {
        userTotals += this.userTotals(
            user,
            this.running[challengeID].goal,
            'sprint',
            this.running[challengeID].joined[user].timeTaken
        );
      }
    }
    return userTotals;
  }
  /**
   * Produces a per-user breakdown of user-entered totals.
   * @param {String} server - Snowflake of the server being posted to.
   * @param {Object} serverTotals - Summary of user-entered totals by server.
   * @return {String} - The message to send to the user.
   */
  serverText(server, serverTotals) {
    let serverText = '';
    if ((server in serverTotals)) {
      serverText += '__' + client.guilds.get(server).name + '__:';
      let firstType = true;
      for (const item in serverTotals[server]) {
        if (serverTotals[server][item][1] > 0) {
          if (!firstType) {
            serverText = ', ';
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
            + '** avg)\n';
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
      const summaryServer = client.channels.get(channel).guild;
      returnMsg += this.warByUser(summaryServer, challengeID);
      for (const server in serverTotals) {
        if (serverTotals.hasOwnProperty(server)) {
          returnMsg += this.serverText(server, serverTotals);
        }
      }
    } else {
      returnMsg = 'This war has not ended yet.';
    }
    if (returnMsg == '') {
      returnMsg = 'Nobody has posted a total for this war yet.';
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
      // const serverTotals = this.serverTotals(challengeID);
      const summaryServer = client.channels.get(channel).guild;
      returnMsg += this.sprintByUser(summaryServer, challengeID) + '\n';
      // for (const server in serverTotals) {
      //   if (serverTotals.hasOwnProperty(server)) {
      //     returnMsg += this.serverText(server, serverTotals);
      //   }
      // }
    } else {
      returnMsg = 'This sprint has not started yet.';
    }
    if (returnMsg == '\n') {
      returnMsg = '\nNobody has finished this sprint yet.';
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
        msgToSend += '\n\n***Summary for ' + this.warName + ':***\n\n'
          + this.chainSummary(channel, challengeID);
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
