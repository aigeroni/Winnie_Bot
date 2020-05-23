const dbc = require('../dbc.js');
const config = require('../config.json');

/** Information required for challenge creation and summary display. */
class ChallengeList {
  /** Initialise variables required for challenge creation and summaries. */
  constructor() {
    this.DUR_AFTER = 300;
    this.running = {};
    this.announceChannel = {};
  }
  /**
   * Check to see whether a challenge is hidden from a server.
   * @param {String} chalID - The ID of the challenge to check.
   * @param {String} guildID - The ID of the server to check against.
   * @return {Object} - User data.
   */
  hiddenCheck(chalID, guildID) {
    let check = false;
    if (this.running[chalID].hidden && this.running[chalID].channel.guild.id
        != guildID) {
      check = true;
    }
    return check;
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
    for (const i in this.running) {
      if (!(this.hiddenCheck(i, msg.guild.id))) {
        const guildName = this.running[i].channel.guild.name;
        nonHiddenTotal += 1;
        listData += this.buildChallengeData(i, guildName);
      }
    }
    let listMsg = '';
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
    switch (this.running[chalID].state) {
      case 0:
        timeVar = this.running[chalID].cStart;
        timeData = 'starts in %m:%s';
        break;
      case 1:
        timeVar = this.running[chalID].cDur;
        timeData = '%m:%s remaining';
        break;
      default:
        timeData = 'ended';
        break;
    }
    dataString += chalID + ': ' + this.running[chalID].displayName + ' (';
    if (this.running[chalID].type == 'sprint') {
      dataString += this.running[chalID].goal + ' words, ';
    }
    dataString += this.running[chalID].duration + ' minutes, ' +
      this.buildDataString(timeData, timeVar, this.running[chalID].type) +
      '), ' + guildName +'\n';
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
      dataString = timeData;
    } else {
      let seconds = timeVar % 60;
      if (seconds < 10) {
        seconds = '0' + seconds.toString();
      }
      dataString += timeData.replace(/%m/, Math.floor(timeVar / 60))
          .replace(/%s/, seconds);
    }
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
      returnMsg = this.updateStatus(
          msg.author, 'userDB', msg.author.id, flagType, args[0]
      );
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
    const user = await dbc.dbFind('userDB', {_id: author.id});
    let type = 'on';
    if (user[field] == 'off') {
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
    const server = await dbc.dbFind('configDB', {_id: msg.guild.id});
    const fieldOptions = {
      xStatus: 'Cross-Server Display',
      autoStatus: 'Automatic Summaries',
      prefix: 'Prefix',
      announce: 'Announcements Channel',
    };
    let fieldData = '';
    if (server[field] === undefined) {
      fieldData = 'not configured';
    } else {
      fieldData = server[field];
    }
    if (update === undefined || update == '') {
      returnMsg += '**' + msg.guild.name + ' ' + fieldOptions[field] +
        ':** ' + fieldData + '.';
    } else if (msg.member.permissions.has('ADMINISTRATOR')) {
      switch (field) {
        case 'prefix':
          returnMsg = this.validatePrefix(msg, update);
          break;
        case 'announce':
          returnMsg = this.validateChannel(msg, update);
          break;
        default:
          returnMsg = this.updateStatus(
              msg.author, 'configDB', msg.guild.id, field, update
          );
          break;
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
   * @param {String} db - The database name.
   * @param {String} id - The ID of the field to update.
   * @param {String} field - The field to update.
   * @param {String} flag - The flag to update to.
   * @return {String} - Message to send to user.
   */
  async updateStatus(author, db, id, field, flag) {
    let returnMsg = '';
    if (!(flag == 'on' || flag == 'off')) {
      returnMsg = author + ', use **on|off** to toggle preferences.';
    } else {
      const data = {$set: {}};
      data.$set = {[field]: flag};
      await dbc.dbUpdate(db, {_id: id}, data);
      returnMsg = author + ', you have turned ';
      if (field == 'autoStatus') {
        returnMsg += 'automatic summaries';
      } else if (field == 'xStatus') {
        returnMsg += 'cross-server display';
      }
      returnMsg += ' **' + flag + '**.';
    }
    return returnMsg;
  }
  /**
   * Validates custom prefixes for Winnie.
   * @param {String} msg - The message that initiated the change.
   * @param {String} update - Data to update with.
   * @return {String} - The message to send to the user.
   */
  async validatePrefix(msg, update) {
    let returnMsg = '';
    if (update == 'clear') {
      delete config.cmd_prefix[msg.guild.id];
      await dbc.dbUpdate(
          'configDB', {_id: msg.guild.id}, {$unset: {prefix: 1}});
      returnMsg = msg.author + ', you have reset my prefix.';
    } else if (update.length > 0 && update.length < 3) {
      config.cmd_prefix[msg.guild.id] = update;
      await dbc.dbUpdate(
          'configDB', {_id: msg.guild.id}, {$set: {prefix: update}});
      returnMsg = msg.author +
        ', you have changed my prefix to `' +
        update +
        '`.';
    } else {
      returnMsg = '**Error:**:' +
        ' My prefix must be less than three characters.';
    }
    return returnMsg;
  }
  /**
   * Validates announcement channels for Winnie.
   * @param {String} msg - The message that initiated the change.
   * @param {String} update - Data to update with.
   * @return {String} - The message to send to the user.
   */
  async validateChannel(msg, update) {
    let returnMsg = '';
    const channelObject = client.channels.get(update.slice(2, -1));
    if (channelObject == undefined) {
      returnMsg = '**Error:**: ' + update + ' is not a valid channel.';
    } else if (channelObject.guild.me.permissionsIn(channelObject)
        .hasPermission('SEND_MESSAGES')) {
      this.announceChannel[msg.guild.id] = channelObject.id;
      await dbc.dbUpdate(
          'configDB',
          {_id: msg.guild.id},
          {$set: {announce: channelObject.id}}
      );
      returnMsg = msg.author +
          ', you have changed the announcements channel to ' +
          channelObject + '.';
    } else {
      returnMsg = '**Error:**: I need permission to send messages' +
          ' in the announcements channel.';
    }
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
