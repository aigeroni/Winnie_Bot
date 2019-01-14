const clist = require('./clist.js');
const challenges = require('./challenges.js');
const dbc = require('../dbc.js');
const conn = require('mongoose').connection;

/** Information required for challenge creation and summary display. */
class ChallengeList {
  /** Initialise variables required for challenge creation and summaries. */
  constructor() {
    this.DUR_AFTER = 30;
    this.running = {};
  }
  /**
   * Lists all running challenges.
   * @param {Object} client - The Discord client.
   * @param {Object} msg - The message that ran this function.
   * @return {String} - The message to send to the user.
   */
  listChallenges(client, msg) {
    let nonHiddenTotal = 0;
    let listData = '';
    for (const i in clist.running) {
      if (!(challenges.hiddenCheck(i, msg.guild.id))) {
        const guildName = client.guilds.get(clist.running[i].channelID).name;
        nonHiddenTotal += 1;
        listData += this.buildChallengeData(i, guildName);
      }
    }
    if (nonHiddenTotal == 0) {
      listMsg =
        'There are no challenges running.' + ' Why don\'t you start one?';
    } else if (nonHiddenTotal == 1) {
      listMsg = 'There is ' + nonHiddenTotal + ' challenge running:\n';
    } else {
      listMsg = 'There are ' + nonHiddenTotal + ' challenges running:\n';
    }
    listMsg += listData;
    return listMsg;
  }
  /**
   * Builds challenge data for display.
   * @param {Object} chalID - The challenge to build.
   * @param {Object} guildName - Display name of the challenge's home server.
   * @return {String} - The message to send to the user.
   */
  buildChallengeData(chalID, guildName) {
    let dataString = '';
    let timeData = '';
    let timeVar = undefined;
    switch (clist.running[chalID].state) {
      case 0:
        timeVar = clist.running[chalID].cStart;
        timeData = 'starts in %m:%s';
        break;
      case 1:
        timeVar = clist.running[chalID].cDur;
        timeData = '%m:%s remaining';
        break;
      default:
        timeData = 'ended';
        break;
    }
    dataString += chalID + ': ' + clist.running[chalID].displayName + ' (';
    if (type == 'sprint') {
      dataString += clist.running[chalID].goal + ' words, ';
    }
    dataString += clist.running[chalID].duration + ' minutes, ' +
      this.buildDataString(timeData, timeVar, clist.running[chalID].type);
    return dataString; 
  }
    /**
   * Builds a string with information about a challenge.
   * @param {Number} timeData - Time remaining in the challenge.
   * @param {String} timeVar - Text describing the challenge.
   * @return {String} - The message to send to the user.
   */
  buildDataString(timeData, timeVar) {
    let dataString = '';
    if (timeVar === undefined) {
      dataString = timeVar;
    } else {
      let seconds = timeVar % 60;
      if (seconds < 10) {
        seconds = '0' + seconds.toString();
      }
      dataString += timeData.replace(/%m/, Math.floor(timeVar / 60))
          .replace(/%s/, seconds); 
    }
    dataString += '), ' + guildName +'\n';
    return dataString;
  }
  /**
   * Toggles cross-server display and auto-summary flags.
   * @param {Object} msg - The message that ran this function.
   * @param {String} suffix - Information after the bot command.
   * @param {String} flagType - The field to update.
   * @return {String} - The message to send to the user.
   */
  async updateFlags(msg, suffix, flagType) {
    let returnMsg = '';
    const args = suffix.split(' ');
    if (suffix == '') { // user checking own status
      returnMsg = this.checkStatus(msg.author, flagType);
    } else if (args[0] == 'server') { // server status
      returnMsg = this.statusForServer(msg, flagType, args[1]);
    } else { // user updating own status
      returnMsg = this.updateStatus(msg.author, flagType, args[0]);
    }
    return returnMsg;
  }
  /**
   * Checks the status of user-entered flags.
   * @param {Object} author - The user to check the flags of.
   * @param {String} field - The field to check.
   * @return {String} - Message to send to user.
   */
  async checkStatus(author, field) {
    let returnMsg = '';
    const user = await conn.collection('userDB').findOne(
        {_id: author.id}
    );
    let type = 'on';
    if (user.field == 'off') {
      type = 'off';
    }
    returnMsg += author + ', you currently have ';
    if (field == 'autoStatus') {
      returnMsg += 'automatic summaries';
    } else if (field == 'xStatus') {
      returnMsg += 'cross-server display';
    }
    returnMsg += ' for your challenges **' + type + '**.';
    return returnMsg;
  }
  /**
   * Checks the status of flags for a server.
   * @param {Object} msg - The message that initiated the check.
   * @param {String} field - The field to check.
   * @param {String} update - Information to update field with.
   * @return {String} - Message to send to user.
   */
  async statusForServer(msg, field, update) {
    let returnMsg = '';
    const server = await conn.collection('configDB').findOne(
        {_id: msg.guild.id}
    );
    let textType = '';
    if (field == 'autoStatus') {
      textType = 'automatic summaries';
    } else if (field == 'xStatus') {
      textType = 'cross-server display';
    }
    let type = 'on';
    if (server.field == 'off') {
      type = 'off';
    }
    if (update === undefined) {
      returnMsg += msg.guild.name + ' currently has ' +
        textType + ' **' + type + '**.';
    } else if (msg.member.permissions.has('ADMINISTRATOR')) {
      if (!(update == 'on' || update == 'off')) {
        const data = {$set: {}};
        data.$set = field + ':' + update;
        await dbc.dbUpdate('configDB', {_id: msg.guild.id}, data);
        returnMsg = msg.author + ', you have turned ' + textType + ' **' +
          update + '**.';
      } else {
        returnMsg = msg.author +
          ', use **on|off** to toggle server preferences.';
      }
    } else {
      returnMsg = '**Error:** Only server administrators are permitted' +
        ' to configure server preferences.';
    }
    return returnMsg;
  }
  /**
   * Updates user-entered flags.
   * @param {Object} author - The user to update the flags of.
   * @param {String} field - The field to update.
   * @param {String} flag - The flag to update to.
   * @return {String} - Message to send to user.
   */
  async updateStatus(author, field, flag) {
    let returnMsg = '';
    if (!(flag == 'on' || flag == 'off')) {
      returnMsg = author + ', use **on|off** to toggle preferences.';
    } else {
      const data = {$set: {}};
      data.$set = field + ':' + flag;
      await dbc.dbUpdate('userDB', {_id: msg.author.id}, data);
      returnMsg = author + ', you have turned ';
      if (field == 'autoStatus') {
        returnMsg += 'automatic summaries';
      } else if (field == 'xStatus') {
        returnMsg += 'cross-server display';
      }
      returnMsg = ' for your challenges **' + flag + '**.';
    }
    return returnMsg;
  }
  /**
   * Validates custom prefixes for Winnie.
   * @param {Object} msg - The message that ran this function.
   * @param {String} suffix - Information after the bot command.
   * @return {String} - The message to send to the user.
   */
  async validatePrefix(msg, suffix) {
    let returnMsg = '';
    if (suffix.length > 0 && suffix.length < 3) {
      config.cmd_prefix[msg.guild.id] = suffix;
      await dbc.dbUpdate(
          'configDB', {_id: msg.guild.id}, {$set: {prefix: newPrefix}});
      returnMsg = msg.author +
        ', you have changed my prefix to `' +
        suffix +
        '`.';
    } else {
      returnMsg = '**Error:**:' +
        ' My prefix must be less than three characters.';
    }
    return returnMsg;
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
      msgToSend = this.running[challengeID].stats(channel);
    } else {
      msgToSend = '**Error:** This challenge does not exist.';
    }
    return msgToSend;
  }
}

module.exports = new ChallengeList();
