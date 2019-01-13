const clist = require('./clist.js');
const challenges = require('./challenges.js');
const dbc = require('../dbc.js');
const conn = require('mongoose').connection;

/** Class containing functions for challenge management. */
class Config {
  /** Initialise variables required for challenge management. */
  constructor() {
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
   * Builds a string with information about a challenge.
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
    if (clist.running[chalID].type == 'sprint') {
      dataString += clist.running[chalID].goal + ' words, ';
    }
    dataString += clist.running[chalID].duration + ' minutes, ';
    let seconds = timeVar % 60;
    if (seconds < 10) {
      seconds = '0' + seconds.toString();
    }
    dataString += timeData.replace(/%m/, Math.floor(timeVar / 60))
        .replace(/%s/, seconds) + '), ' + guildName +'\n';
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
        const data = '$set: {' + field + ':' + update + ',}';
        await dbc.dbUpdate('configDB', msg.guild.id, data);
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
   * Checks server configuration fields.
   * @param {Object} msg - The message that initiated the check.
   * @param {String} field - The field to check.
   * @return {String} - Message to send to user.
   */
  async configStatus(msg, field) {
    let returnMsg = '';
    const server = await conn.collection('configDB').findOne(
        {_id: msg.guild.id}
    );
    // if () {
      
    // }
    if (server == null || server.field === undefined) {
      returnMsg = msg.author +
          ', this server does not have ' + field + ' configured.';
    } else {
      returnMsg = msg.guild.name + '\'s ' + field + ' is ' + server.field;
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
      const data = '$set: {' + field + ':' + flag + '}';
      await dbc.dbUpdate('userDB', msg.author.id, data);
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
   * Updates per-server configuration.
   * @param {Object} msg - The message that ran this function.
   * @param {String} suffix - Information after the bot command.
   * @param {String} flagType - The field to update.
   * @return {String} - The message to send to the user.
   */
  async updateConfig(msg, suffix, flagType) {
    let returnMsg = '';
    const args = suffix.split(' ');
    if (suffix == '') { // check configuration

    } else { // update configuration

    }
    return returnMsg;
  }
  /**
   * Allows server admins to set a custom prefix for Winnie.
   * @param {Object} msg - The message that ran this function.
   * @param {String} suffix - Information after the bot command.
   * @return {String} - The message to send to the user.
   */
  async customPrefix(msg, suffix) {
    let returnMsg = '';
    // display Winnie's current prefix (all users)
    if (suffix == '') {
      
    } else if (msg.member.permissions.has('ADMINISTRATOR')) {
      if (suffix == 'clear') {
        await conn
            .collection('configDB')
            .update(
                {_id: msg.guild.id},
                {$set: {prefix: undefined}},
                {upsert: true}
            );
        returnMsg = msg.author +
            ', you have reset my prefix to the default `' +
            config.cmd_prefix['default'] +
            '`.';
      } else { // change prefix (admins only)
        if (suffix.length > 0 && suffix.length < 3) {
          config.cmd_prefix[msg.guild.id] = suffix;
          await conn
              .collection('configDB')
              .update(
                  {_id: msg.guild.id},
                  {$set: {prefix: suffix}},
                  {upsert: true}
              );
          returnMsg = msg.author +
              ', you have changed my prefix to `' +
              suffix +
              '`.';
        } else {
          returnMsg = '**Error:**:' +
            ' My prefix must be less than three characters.';
        }
      }
    } else {
      returnMsg = '**Error:**: Only server administrators are permitted to' +
          ' configure the prefix.';
    }
    return returnMsg;
  }
  /**
   * Allows server admins to configure a channel for word count reminders.
   * @param {Object} msg - The message that ran this function.
   * @param {String} suffix - Information after the bot command.
   * @return {String} - The message to send to the user.
   */
  async announcementChannel(msg, suffix) {
    let returnMsg = '';
    returnMsg = suffix;
    // display the current announcements channel (all users)
    if (suffix == '') {
      const data = await conn.collection('configDB').findOne(
          {_id: msg.guild.id}
      );
      if (data == null || data.announcements == undefined) {
        returnMsg = msg.author +
            ', announcements are not yet configured for this server.';
      } else {
        returnMsg = msg.author +
          ', announcements are posted in ' +
          client.channels.get(data.announcements) +
          '.';
      }
    } else { // change announcements channel (admins only)
      if (msg.member.permissions.has('ADMINISTRATOR')) {
        const channelObject = client.channels.get(suffix.slice(2, -1));
        if (channelObject != undefined) {
          const perms = (channelObject.guild.me.permissionsIn(channelObject));
          if (perms.hasPermission('SEND_MESSAGES')) {
            this.announceChannel[msg.guild.id] = channelObject.id;
            await conn
                .collection('configDB')
                .update(
                    {_id: msg.guild.id},
                    {$set: {announcements: channelObject.id}},
                    {upsert: true}
                );
            returnMsg = msg.author +
                ', you have changed the announcements channel to ' +
                channelObject +
                '.';
          } else {
            returnMsg = '**Error:**: I need permission to send messages' +
                ' in the announcements channel.';
          }
        } else {
          returnMsg = '**Error:**: ' +
              suffix +
              ' is not a valid channel.';
        }
      } else {
        returnMsg = '**Error:**: Only server administrators are permitted to' +
            ' configure the announcements channel.';
      }
    }
    return returnMsg;
  }
}

module.exports = new Config();
