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
   * Produces a per-server breakdown of user-entered totals for a war.
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
   * Produces a per-server breakdown of user-entered totals for a sprint.
   * @param {String} challengeID - Unique ID of the challenge being summarised.
   * @return {String} - The message to send to the user.
   */
  sprintTotals(challengeID) {
    const sprintTotals = {};
    for (const user in this.running[challengeID].joined) {
      if (this.running[challengeID].joined[user].timeTaken != undefined) {
        const homeServer = this.getServerFromID(
            this.running[challengeID].joined[user].channelID);
        sprintTotals[homeServer][0] +=
          this.running[challengeID].joined[user].timeTaken;
        sprintTotals[homeServer][1] += 1;
      }
    }
    return sprintTotals;
  }
  /**
   * Summarises a user's total.
   * @param {Number} total - The user's productivity during the challenge.
   * @param {String} type - The type of the total.
   * @param {Number} time - The duration of the challenge.
   * @return {String} - The message to send to the user.
   */
  userTotals(total, type, time) {
    let userTotal = '';
    if (type == 'sprint') {
      userTotal += '**' + time.toFixed(2) + '** minutes';
      type = 'words';
    } else if (total == 1) {
      userTotal += '**' + total + '** ' + type.slice(0, -1);
    } else {
      userTotal += '**' + total + '** ' + type;
    }
    if (type != 'minutes') {
      userTotal +=
        ' (**' + (total/time).toFixed(2) + '** ' + type.slice(0, 1) + 'pm)';
    }
    userTotal += '\n';
    return userTotal;
  }
  /**
   * Summarises all war totals for a given server.
   * @param {String} summaryServer - The server being summarised.
   * @param {Number} challengeID - Unique ID of the challenge being summarised.
   * @param {String} type - The type of challenge to summarise.
   * @return {String} - The message to send to the user.
   */
  challengeByUser(summaryServer, challengeID, type) {
    let userTotals = '';
    for (const user in this.running[challengeID].joined) {
      if (this.running[challengeID].joined.hasOwnProperty(user)) {
        let count = '';
        let cType = '';
        let time = '';
        let check = '';
        if (type == 'sprint') {
          count = this.running[challengeID].goal;
          cType = 'sprint';
          time = check = this.running[challengeID].joined[user].timeTaken;
        } else {
          count = this.running[challengeID].joined[user].countData;
          cType = check = this.running[challengeID].joined[user].countType;
          time = this.running[challengeID].duration;
        }
        if (check != undefined &&
          (this.getServerFromID(this.running[challengeID]
              .joined[user].channelID) == summaryServer.id)) {
          userTotals += client.users.get(user) + ': ' +
            this.userTotals(count, cType, time);
        }
      }
    }
    return userTotals;
  }
  /**
   * Summarises all chain war aggregates for a given server.
   * @param {String} user - The user being summarised.
   * @param {Object} userObj - Information about the user being summarised.
   * @return {String} - The message to send to the user.
   */
  chainByUser(user, userObj) {
    let returnMsg = '';
    let first = true;
    for (const item in userObj) {
      if (item != 'channelID' && userObj[item][1] > 0) {
        if (first == true) {
          returnMsg += client.users.get(user) + ': ';
        } else {
          returnMsg += ', ';
        }
        first = false;
        returnMsg += this.userTotals(userObj[item][0], item, userObj[item][1]);
      }
    }
    return returnMsg;
  }
  /**
   * Displays war totals in a human-readable format.
   * @param {String} server - Snowflake of the server being posted to.
   * @param {Object} serverTotals - Summary of user-entered totals by server.
   * @return {String} - The message to send to the user.
   */
  serverText(server, serverTotals) {
    let serverText = '__' + client.guilds.get(server).name + '__:';
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
    return serverText;
  }
  /**
   * Displays sprint totals in a human-readable format.
   * @param {String} server - Snowflake of the server being posted to.
   * @param {Object} serverTotals - Summary of user-entered totals by server.
   * @return {String} - The message to send to the user.
   */
  sprintText(server, serverTotals) {
    let sprintText = '__' + client.guilds.get(server).name + '__:';
    if (serverTotals[server][1] > 0) {
      sprintText += ' **' + serverTotals[server][0];
      if (serverTotals[server][1] == 1) {
        sprintText += '** ' + item.slice(0, -1);
      } else {
        sprintText += '** ' + item;
      }
      sprintText += ' (**' + (
        serverTotals[server][1]/
        serverTotals[server][0]).toFixed(0)
        + '** words per minute)\n';
    }
    return sprintText;
  }
  /**
   * Builds a war summary for a given channel.
   * @param {String} channel - Discord ID of the channel being posted to.
   * @param {Number} challengeID - Unique ID of the challenge being summarised.
   * @return {String} - The message to send to the user.
   */
  warSummary(channel, challengeID) {
    let returnMsg = '';
    if (this.running[challengeID].state >= 2) {
      const serverTotals = this.serverTotals(challengeID);
      const summaryServer = client.channels.get(channel).guild;
      returnMsg += this.challengeByUser(summaryServer, challengeID, 'war');
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
   * Builds a sprint summary for a given channel.
   * @param {String} channel - Discord ID of the channel being posted to.
   * @param {Number} challengeID - Unique ID of the challenge being summarised.
   * @return {String} - The message to send to the user.
   */
  sprintSummary(channel, challengeID) {
    let returnMsg = '';
    if (this.running[challengeID].state == 1) {
      const serverTotals = this.sprintTotals(challengeID);
      const summaryServer = client.channels.get(channel).guild;
      returnMsg += this.challengeByUser(summaryServer, challengeID, 'sprint');
      for (const server in serverTotals) {
        if (serverTotals.hasOwnProperty(server)) {
          returnMsg += this.sprintText(server, serverTotals);
        }
      }
    } else {
      returnMsg = 'This sprint has not started yet.';
    }
    if (returnMsg == '') {
      returnMsg = 'Nobody has finished this sprint yet.';
    }
    return returnMsg;
  }
  /**
   * Builds a summary of chain war aggregate totals for a given channel.
   * @param {String} channel - Discord ID of the channel being posted to.
   * @param {Number} name - Name of the chain being summarised.
   * @param {Objects} totals - User-entered totals for the chain.
   * @return {String} - The message to send to the user.
   */
  chainSummary(channel, name, totals) {
    let returnMsg = '***Summary for ' + name + ':***\n\n';
    let summaryData = '';
    const summaryServer = client.channels.get(channel).guild;
    for (const user in totals) {
      if (client.channels.get(totals[user]
          .channelID).guild.id == summaryServer.id) {
        summaryData += this.chainByUser(user, totals[user]);
      }
    }
    for (const server in serverTotals) {
      if (serverTotals.hasOwnProperty(server)) {
        returnMsg += this.sprintText(server, serverTotals);
      }
    }
    if (summaryData == '') {
      summaryData = 'No totals were posted for this chain war.';
    }
    returnMsg += summaryData;
    return returnMsg;
  }
  /**
   * Generates a summary of posted totals for a challenge.
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
    } else {
      msgToSend = '**Error:** This challenge does not exist.';
    }
    return msgToSend;
  }
}

module.exports = new ChallengeList();
