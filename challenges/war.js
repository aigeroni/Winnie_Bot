const Challenge = require('./challenge.js');
const dbc = require('../dbc.js');

/** Represents a war. */
class War extends Challenge {
  /**
   * Create a chain war.
   * @param {Number} objectID - The unique ID of the war.
   * @param {Number} creator - The Discord ID of the creator.
   * @param {String} displayName - The name of the war.
   * @param {Number} initStamp - UNIX timestamp of creation time.
   * @param {Number} countdown - Time in minutes from creation to start.
   * @param {Number} duration - Duration in minutes.
   * @param {String} channel - Discord ID of start channel.
   * @param {Boolean} hidden - Flag for whether challenge is visible to users
   *  on other servers.
   * @param {Array} hookedChannels - A list of channels that have joined the
   *  war.
   * @param {Object} joined - A list of users who have joined the war.
   * @param {String} type - The type of the war.
   */
  constructor(
      objectID,
      creator,
      displayName,
      initStamp,
      countdown,
      duration,
      channel,
      hidden,
      hookedChannels,
      joined,
      type
  ) {
    if (type == undefined) {
      type = 'war';
    }
    super(
        objectID,
        creator,
        displayName,
        initStamp,
        countdown,
        duration,
        channel,
        type,
        hidden,
        hookedChannels,
        joined
    );

    const challengeData = {
      _id: this.objectID,
      creator: this.creator,
      name: this.displayName,
      startTime: this.initStamp,
      countdown: this.countdown,
      duration: this.duration,
      channel: this.channelID,
      hookedChannels: this.hookedChannels,
      joined: this.joined,
      state: this.state,
      type: 'war',
      hidden: this.hidden,
    };
    const array = [challengeData];

    dbc.dbInsert('challengeDB', array);
  }
  /**
   * Builds user data for the challenge database.
   * @param {String} channel - The channel from which the user joined.
   * @param {String} total - The total posted by the user.
   * @param {String} type - The type of the total.
   * @return {Object} - JSON object representing the total.
   */
  buildUserData(channel, total, type) {
    return {
      countData: total,
      countType: type,
      channelID: channel,
    };
  }
  /** Check to see whether the total period is over, and post the summary. */
  terminate() {
    this.cPost--;
    if (this.cPost <= 0) {
      for (const user in this.joined) {
        if (this.joined.hasOwnProperty(user)) {
          const data = {$inc: {}};
          if (this.joined[user].countType == 'words') {
            data.$inc.lifetimeWarWords = parseInt(this.joined[user].countData);
            data.$inc.lifetimeWordMinutes = parseFloat(this.duration);
          } else if (this.joined[user].countType == 'lines') {
            data.$inc.lifetimeWarLines = parseInt(this.joined[user].countData);
            data.$inc.lifetimeLineMinutes = parseFloat(this.duration);
          } else if (this.joined[user].countType == 'pages') {
            data.$inc.lifetimeWarPages = parseInt(this.joined[user].countData);
            data.$inc.lifetimePageMinutes = parseFloat(this.duration);
          } else if (this.joined[user].countType == 'minutes') {
            data.$inc.lifetimeWarMinutes =
              parseInt(this.joined[user].countData);
          }
          dbc.dbUpdate('userDB', {_id: user}, data);
        }
      }
      super.terminate();
    }
  }
  /** Prints statistics for a challenge.
   * @param {String} channel - Channel to print to.
   * @return {String} - Return message.
   */
  stats(channel) {
    let returnMsg = '';
    if (this.state >= 2) {
      const serverTotals = this.serverTotals(this.objectID);
      const summaryServer = this.getChannel(channel).guild;
      returnMsg += this.challengeByUser(summaryServer, this.objectID, 'war');
      if (Object.keys(serverTotals).length > 1) {
        returnMsg += '\n';
      }
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
    return super.stats() + returnMsg;
  }
  /**
   * Summarises all totals for a given server.
   * @param {String} summaryServer - The server being summarised.
   * @return {String} - The message to send to the user.
   */
  challengeByUser(summaryServer) {
    let userTotals = '';
    for (const user in this.joined) {
      if (this.joined.hasOwnProperty(user)) {
        const cType = this.joined[user].countType;
        if (cType != undefined && this.channel.guild.id == summaryServer.id) {
          userTotals += client.users.get(user) + ': ' + this.userTotals(
              this.joined[user].countData, cType, this.duration
          ) + '\n';
        }
      }
    }
    return userTotals;
  }
  /**
   * Produces a per-server breakdown of user-entered totals for a war.
   * @return {String} - The message to send to the user.
   */
  serverTotals() {
    let serverTotals = {};
    for (const user in this.joined) {
      if (this.joined[user].countType != undefined) {
        const homeServer =
          this.getChannel(this.joined[user].channelID).guild.id;
        serverTotals = this.addToAggregate(serverTotals, homeServer);
        serverTotals[homeServer][this.joined[user].countType][0] +=
            parseInt(this.joined[user].countData);
        serverTotals[homeServer][this.joined[user].countType][1] += 1;
      }
    }
    return serverTotals;
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
   * Summarises a user's total.
   * @param {Number} total - The user's total.
   * @param {String} type - The total type.
   * @param {Number} time - The duration of the challenge.
   * @return {String} - The message to send to the user.
   */
  userTotals(total, type, time) {
    let userTotal = '';
    if (total == 1) {
      userTotal += '**' + total + '** ' + type.slice(0, -1);
    } else {
      userTotal += '**' + total + '** ' + type;
    }
    if (type != 'minutes') {
      userTotal +=
        ' (**' + (total/time).toFixed(2) + '** ' + type.slice(0, 1) + 'pm)';
    }
    return userTotal;
  }
  /**
   * Displays war totals in a human-readable format.
   * @param {String} server - Snowflake of the server being posted to.
   * @param {Object} serverTotals - Summary of user-entered totals by server.
   * @return {String} - The message to send to the user.
   */
  serverText(server, serverTotals) {
    console.log(serverTotals[server]);
    let serverText = '__' + client.guilds.get(server).name + '__:';
    let firstType = true;
    for (const item in serverTotals[server]) {
      if (serverTotals[server][item][1] > 0) {
        if (!firstType) {
          serverText += ', ';
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
}

module.exports = War;
