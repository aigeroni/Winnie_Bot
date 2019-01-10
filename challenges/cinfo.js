const clist = require('./clist.js');
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
    let timerInfo = '';
    for (const i in clist.running) {
      if (clist.running.hasOwnProperty(i) && !(
        this.hiddenCheck(i, msg.guild.id))) {
        nonHiddenTotal += 1;
        // find originating server name
        const parentGuildName = parentGuild.name;
        let timeout = '';
        switch (clist.running[i].state) {
          case 0:
            if (clist.running[i].cStart % 60 < 10) {
              timeout =
                '0' + (clist.running[i].cStart % 60).toString();
            } else {
              timeout = clist.running[i].cStart % 60;
            }
            timerInfo +=
              i + ': ' + clist.running[i].displayName + ' (';
            if (clist.running[i].type == 'sprint') {
              timerInfo += clist.running[i].goal + ' words, ';
            }
            timerInfo +=
              clist.running[i].duration +
              ' minutes, starts in ' +
              Math.floor(clist.running[i].cStart / 60) +
              ':' +
              timeout +
              '), ' +
              parentGuildName +
              '\n';
            break;
          case 1:
            if (clist.running[i].cDur % 60 < 10) {
              timeout =
                '0' + (clist.running[i].cDur % 60).toString();
            } else {
              timeout = clist.running[i].cDur % 60;
            }
            timerInfo +=
              i + ': ' + clist.running[i].displayName + ' (';
            if (clist.running[i].type == 'sprint') {
              timerInfo += clist.running[i].goal + ' words, ';
            }
            timerInfo +=
              clist.running[i].duration +
              ' minutes, ' +
              Math.floor(clist.running[i].cDur / 60) +
              ':' +
              timeout +
              ' remaining), ' +
              parentGuildName +
              '\n';
            break;
          case 2:
          case 3:
            timerInfo +=
              i + ': ' + clist.running[i].displayName + ' (';
            if (clist.running[i].type == 'sprint') {
              timerInfo += clist.running[i].goal + ' words, ';
            }
            timerInfo +=
              clist.running[i].duration +
              ' minutes, ended), ' +
              parentGuildName +
              '\n';
            break;
          default:
            break;
        }
      }
    }
    let listMsg = '';
    if (nonHiddenTotal == 0) {
      listMsg +=
        'There are no challenges running.' + ' Why don\'t you start one?';
    } else if (nonHiddenTotal == 1) {
      listMsg += 'There is ' + nonHiddenTotal + ' challenge running:\n';
    } else {
      listMsg += 'There are ' + nonHiddenTotal + ' challenges running:\n';
    }
    if (nonHiddenTotal > 0) {
      listMsg += timerInfo;
    }
    return listMsg;
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
    let type = 'on';
    if (server.field == 'off') {
      type = 'off';
    }
    if (update === undefined) {
      returnMsg += msg.guild.name + ' currently has ';
      if (field == 'autoStatus') {
        returnMsg += 'automatic summaries';
      } else if (field == 'xStatus') {
        returnMsg += 'cross-server display';
      }
      returnMsg += ' **' + type + '**.';
    } else if (msg.member.permissions.has('ADMINISTRATOR')) {
      // if (args[1] == 'show' || args[1] == 'hide') {
      //   let autoType = 'on';
      //   if (args[1] == 'hide') {
      //     autoType = 'off';
      //     this.autoSumStatus[msg.guild.id] = true;
      //   } else {
      //     autoType = 'on';
      //     this.autoSumStatus[msg.guild.id] = false;
      //   }
      //   await conn
      //       .collection('configDB')
      //       .update(
      //           {_id: msg.guild.id},
      //           {$set: {autoStatus: this.autoSumStatus[msg.guild.id]}},
      //           {upsert: true}
      //       );
      //   returnMsg = msg.author +
      //       ', you have turned automatic summaries **' +
      //       autoType +
      //       '**.';
      // } else {
      //   returnMsg = msg.author +
      //       ', use **show|hide** to toggle automatic summaries.';
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
      await conn.collection('userDB').update(
          {_id: msg.author.id},
          {$set: {autoStatus: flag}},
          {upsert: true}
      );
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
}

module.exports = new Config();
