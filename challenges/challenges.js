const profanity = require('profanity-util', {substring: 'lite'});
const emojiRegex = require('emoji-regex/es2015/index.js');
const ChainWar = require('./chainwar');
const Sprint = require('./sprint');
const War = require('./war');
const clist = require('./clist.js');
const dbc = require('../dbc.js');
const logger = require('../logger.js');
const conn = require('mongoose').connection;

/** Class containing functions for challenge management. */
class Challenges {
  /** Initialise variables required for challenge management. */
  constructor() {
    // TODO: Move to a root-level config.js
    // file and import from there
    this.WAR_RAPTOR_CHANCE = 10;

    this.timerID = 1;
    this.crossServerStatus = {};
    this.autoSumStatus = {};
    this.regex = emojiRegex();
  }
  /**
   * Add a user to the list of joined users for a challenge.
   * @param {Object} msg - The message that ran this function.
   * @param {String} prefix - The bot's prefix.
   * @param {String} suffix - Information after the bot command.
   * @return {String} - The message to send to the user.
   */
  async joinChallenge(msg, prefix, suffix) {
    let returnMsg = '';
    const chalID = suffix;
    const returnInfo = this.checkIDError(chalID, msg, 'join', prefix);
    if (returnInfo) {
      returnMsg = returnInfo;
    } else {
      returnMsg = await clist.running[chalID].join(msg.author, msg.channel.id);
    }
    return returnMsg;
  }
  /**
   * Remove a user from the list of joined users for a challenge.
   * @param {Object} msg - The message that ran this function.
   * @param {String} prefix - The bot's prefix.
   * @param {String} suffix - Information after the bot command.
   * @return {String} - The message to send to the user.
   */
  async leaveChallenge(msg, prefix, suffix) {
    let returnMsg = '';
    const chalID = suffix;
    const returnInfo = this.checkIDError(chalID, msg, 'leave', prefix);
    if (returnInfo) {
      returnMsg = returnInfo;
    } else {
      returnMsg = await clist.running[chalID].leave(msg.author);
    }
    return returnMsg;
  }
  /**
   * Terminates a challenge early.
   * @param {Object} msg - The message that ran this function.
   * @param {String} prefix - The bot's prefix.
   * @param {String} suffix - Information after the bot command.
   * @return {Object} - Channels to send message to, and message to send.
   */
  async stopChallenge(msg, prefix, suffix) {
    let returnMsg = '';
    const chalID = suffix;
    let channelList = [msg.channel.id];
    const returnInfo = this.checkIDError(chalID, msg, 'cancel', prefix);
    if (returnInfo) {
      returnMsg = returnInfo;
    } else if (clist.running[chalID].creator == msg.author.id) {
      channelList = clist.running[chalID].hookedChannels;
      returnMsg = await clist.running[chalID].cancel(msg.author);
    } else {
      returnMsg = '**Error:** Only the creator of ' +
        clist.running[chalID] +
        ' can end this challenge.';
    }
    return {channelList: channelList, returnMsg: returnMsg};
  }
  /**
   * Creates a new sprint.
   * @param {Object} msg - The message that ran this function.
   * @param {String} prefix - The bot's prefix.
   * @param {String} suffix - Information after the bot command.
   * @return {String} - The message to send to the user.
   */
  async startSprint(msg, prefix, suffix) {
    let returnMsg = '';
    let joinFlag = false;
    let crossServerHide = this.crossServerStatus[msg.guild.id];
    const user = await conn.collection('userDB').findOne(
        {_id: msg.author.id}
    );
    if (user != null && user.autoStatus == 'off') {
      crossServerHide = true;
    }
    const args = suffix.split(' ');
    if (args[0] == 'join') {
      args.shift();
      joinFlag = true;
    }
    if (args[0] == 'hide') {
      args.shift();
      crossServerHide = true;
    }
    const words = args.shift();
    const timeout = args.shift();
    let start = args.shift();
    if (start === undefined) {
      start = 1;
    }
    let sprintName = args.join(' ');
    if (sprintName == '') {
      sprintName = msg.author.username + '\'s sprint';
    }
    if (msg.mentions.members.size > 0) {
      returnMsg = '**Error:** Challenge names may not mention users.';
    } else if (this.validateName(warName)) {
      returnMsg = this.validateName(warName);
    } else if (this.validateTime(timeout)) {
      returnMsg = this.validateTime(timeout)
        + ' Example: `' + prefix + 'sprint 200 10 1`.';
    } else if (this.validateCountdown(start)) {
      returnMsg = this.validateCountdown(start)
        + ' Example: `' + prefix + 'sprint 200 10 1`.';
    } else if (this.validateGoal(words)) {
      returnMsg = this.validateGoal(words)
        + ' Example: `' + prefix + 'sprint 200 10 1`.';
    } else {
      const creatorID = msg.author.id;
      const chalID = this.timerID;
      const startTime = new Date().getTime();
      clist.running[chalID] = new Sprint(
          chalID,
          creatorID,
          sprintName,
          startTime,
          start,
          words,
          timeout,
          msg.channel.id,
          crossServerHide,
          [msg.channel.id],
          {}
      );
      await this.incrementID();
      if (joinFlag) {
        returnMsg += await this.joinChallenge(msg, prefix, chalID);
      }
    }
    return returnMsg;
  }
  /**
   * Creates a new war.
   * @param {Object} msg - The message that ran this function.
   * @param {String} prefix - The bot's prefix.
   * @param {String} suffix - Information after the bot command.
   * @return {String} - The message to send to the user.
   */
  async startWar(msg, prefix, suffix) {
    let returnMsg = '';
    let joinFlag = false;
    const args = suffix.split(' ');
    let crossServerHide = this.crossServerStatus[msg.guild.id];
    const user = await conn.collection('userDB').findOne(
        {_id: msg.author.id}
    );
    if (user != null && user.autoStatus == 'off') {
      crossServerHide = true;
    }
    if (args[0] == 'join') {
      args.shift();
      joinFlag = true;
    }
    if (args[0] == 'hide') {
      args.shift();
      crossServerHide = true;
    }
    const duration = args.shift();
    let start = args.shift();
    let warName = args.join(' ');
    if (start === undefined) {
      start = 1;
    }
    if (warName == '') {
      warName = msg.author.username + '\'s war';
    }
    if (msg.mentions.members.size > 0) {
      returnMsg = '**Error:** Challenge names may not mention users.';
    } else if (this.validateName(warName)) {
      returnMsg = this.validateName(warName);
    } else if (this.validateTime(duration)) {
      returnMsg = this.validateTime(duration)
        + ' Example: `' + prefix + 'war 10 1`.';
    } else if (this.validateCountdown(start)) {
      returnMsg = this.validateCountdown(start)
        + ' Example: `' + prefix + 'war 10 1`.';
    } else {
      const creatorID = msg.author.id;
      const chalID = this.timerID;
      const startTime = new Date().getTime();
      clist.running[chalID] = new War(
          chalID,
          creatorID,
          warName,
          startTime,
          start,
          duration,
          msg.channel.id,
          crossServerHide,
          [msg.channel.id],
          {}
      );
      await this.incrementID();
      if (joinFlag) {
        returnMsg += await this.joinChallenge(msg, prefix, chalID);
      }
    }
    return returnMsg;
  }
  /**
   * Creates a new chain war.
   * @param {Object} msg - The message that ran this function.
   * @param {String} prefix - The bot's prefix.
   * @param {String} suffix - Information after the bot command.
   * @return {String} - The message to send to the user.
   */
  async startChainWar(msg, prefix, suffix) {
    let returnMsg = '';
    let joinFlag = false;
    let crossServerHide = this.crossServerStatus[msg.guild.id];
    const args = suffix.split(' ');
    const user = await conn.collection('userDB').findOne(
        {_id: msg.author.id}
    );
    if (user != null) {
      if (user.autoStatus == 'off') {
        crossServerHide = true;
      }
    }
    if (args[0] == 'join') {
      args.shift();
      joinFlag = true;
    }
    if (args[0] == 'hide') {
      args.shift();
      crossServerHide = true;
    }
    const chainWarCount = args.shift();
    const duration = args.shift();
    let timeBetween = args.shift().split('|');
    while (timeBetween.length < chainWarCount) {
      timeBetween.push(timeBetween[timeBetween.length-1]);
    }
    let warName = args.join(' ');
    if (timeBetween === undefined) {
      timeBetween = [1];
    }
    if (warName == '') {
      warName = msg.author.username + '\'s war';
    }
    if (msg.mentions.members.size > 0) {
      returnMsg = '**Error:** Challenge names may not mention users.';
    } else if (this.validateName(warName)) {
      returnMsg = this.validateName(warName);
    } else if (this.validateTime(duration)) {
      returnMsg = this.validateTime(duration)
        + ' Example: `' + prefix + 'chainwar 2 10 1`.';
    } else if (this.validateCountdown(start)) {
      returnMsg = this.validateCountdown(start)
        + ' Example: `' + prefix + 'chainwar 2 10 1`.';
    } else if (isNaN(chainWarCount)) {
      returnMsg = '**Error:** War count must be a number. Example: `' +
          prefix +
          'chainwar 2 10 1`.';
    } else if (timeBetween.some(isNaN)) {
      returnMsg = '**Error:** Time between wars must be a number. Example: `' +
          prefix +
          'chainwar 2 10 1`.';
    } else if (timeBetween.some(function(currentValue) {
      return currentValue > 30;
    })) {
      returnMsg = '**Error:** There cannot be more than 30 minutes' +
          ' between wars in a chain.';
    } else if (chainWarCount < 2 || chainWarCount > 10) {
      returnMsg = '**Error:** Chains must be between two and ten wars long.';
    } else if (duration * chainWarCount > 120) {
      returnMsg =
          '**Error:** Chain wars cannot run for more than two hours in total.';
    } else if (timeBetween <= 0) {
      returnMsg = '**Error:** Chain wars cannot overlap.';
    } else {
      try {
        const creatorID = msg.author.id;
        const chalID = this.timerID;
        const startTime = new Date().getTime();
        clist.running[chalID] = new ChainWar(
            chalID,
            creatorID,
            warName,
            startTime,
            1,
            chainWarCount,
            timeBetween,
            duration,
            msg.channel.id,
            crossServerHide,
            [msg.channel.id],
            {},
            {}
        );
        await this.incrementID();
        if (joinFlag) {
          returnMsg += await this.joinChallenge(msg, prefix, chalID);
        }
      } catch (e) {
        returnMsg = '**Error:** Chain war creation failed.';
        logger.error('Error %s: %s.', e, e.stack);
      }
    }
    return returnMsg;
  }
  /**
   * Calls time for a sprint.
   * @param {Object} msg - The message that ran this function.
   * @param {String} prefix - The bot's prefix.
   * @param {String} suffix - Information after the bot command.
   * @return {Object} - Message to send to user, raptor determination value.
   */
  async callTime(msg, prefix, suffix) {
    let returnMsg = '';
    let raptorCheck = false;
    const returnInfo = this.checkIDError(suffix, msg, 'time', prefix);
    if (returnInfo) {
      returnMsg = returnInfo;
    } else if (!(clist.running[suffix].type == 'sprint')) {
      returnMsg = '**Error:** You can only call time on a sprint.';
    } else {
      raptorCheck = true;
      const doneStamp = new Date().getTime();
      const timeTaken = (doneStamp - clist.running[suffix].startStamp) / 60000;
      clist.running[chalID].submitUserData(suffix, doneStamp, timeTaken);
      returnMsg = msg.author + ', you completed the sprint in ' +
        timeTaken.toFixed(2) + ' minutes.';
    }
    return {returnMsg: returnMsg, raptorCheck: raptorCheck};
  }
  /**
   * Adds a total to a challenge.
   * @param {Object} msg - The message that ran this function.
   * @param {String} prefix - The bot's prefix.
   * @param {String} suffix - Information after the bot command.
   * @return {Object} - Message to send to user, raptor determination value.
   */
  async addTotal(msg, prefix, suffix) {
    let returnMsg = '';
    const args = suffix.split(' ');
    const chalID = args.shift();
    const wordsWritten = args.shift();
    const writtenType = this.typeAssign(args.shift());
    let raptorCheck = false;
    const returnInfo = this.checkIDError(chalID, msg, 'total', prefix);
    if (!writtenType) {
      returnMsg = '**Error:** You must work in words, lines, or pages.';
    } else if (returnInfo) {
      returnMsg = returnInfo;
    } else if (this.validateGoal(wordsWritten)) {
      returnMsg = this.validateGoal(wordsWritten);
    } else if (clist.running[chalID].type == 'sprint') {
      returnMsg = '**Error:** You cannot post a total for sprints.';
    } else if (clist.running[chalID].state < 2) {
      returnMsg = '**Error:** This challenge has not ended yet!';
    } else {
      raptorCheck = true;
      clist.running[chalID].submitUserData(chalID, wordsWritten, writtenType);
      returnMsg = msg.author + ', your total of **' + wordsWritten +
        '** ' + writtenType + ' has been added to the summary.';
    }
    return {returnMsg: returnMsg, raptorCheck: raptorCheck};
  }
  /**
   * Validates a challenge name.
   * @param {String} name - The name to validate.
   * @return {String} - Message to send to user.
   */
  validateName(name) {
    let returnMsg = false;
    if (profanity.check(name).length > 0) {
      returnMsg = '**Error:** Challenge names may not contain profanity.';
    } else if (this.regex.exec(name)) {
      returnMsg = '**Error:** Challenge names may not contain emoji.';
    } else if (name.length > 150) {
      returnMsg = '**Error:** Challenge names must be 150 characters or less.';
    }
    return returnMsg;
  }
  /**
   * Validates a challenge duration.
   * @param {String} duration - The duration to validate.
   * @return {String} - Message to send to user.
   */
  validateTime(duration) {
    let returnMsg = false;
    if (isNaN(duration)) {
      returnMsg = '**Error:** Challenge duration must be a number.';
    } else if (duration > 60) {
      returnMsg = '**Error:** Challenges cannot last for more than an hour.';
    } else if (duration < 1) {
      returnMsg = '**Error:** Challenges must run for at least a minute.';
    }
    return returnMsg;
  }
  /**
   * Validates the time before a challenge.
   * @param {String} start - The countdown time to validate.
   * @return {String} - Message to send to user.
   */
  validateCountdown(start) {
    let returnMsg = false;
    if (isNaN(start)) {
      returnMsg = '**Error:** Time to start must be a number.';
    } else if (start > 30) {
      returnMsg = '**Error:** Challenges must start within 30 minutes.';
    } else if (start <= 0) {
      returnMsg = '**Error:** Challenges cannot start in the past.';
    }
    return returnMsg;
  }
  /**
   * Validates the word goal for a sprint.
   * @param {String} words - The goal to validate.
   * @return {String} - Message to send to user.
   */
  validateGoal(words) {
    let returnMsg = false;
    if (!Number.isInteger(Number(words))) {
      returnMsg = '**Error:** Word count must be a whole number.';
    } else if (words < 1) {
      returnMsg = '**Error:** Word count cannot be negative.';
    }
    return returnMsg;
  }
  /**
   * Increment the challenge ID.
   * @return {Promise} - Promise object.
   */
  async incrementID() {
    await dbc.dbUpdate('timer', {data: this.timerID}, {data: this.timerID + 1});
    this.timerID = this.timerID + 1;
  }
  /**
   * Checks for a valid challenge ID.
   * @param {String} chalID - The ID to test for validity.
   * @param {Object} msg - The message that resulted in the check.
   * @param {String} command - The command that resulted in this error.
   * @param {String} prefix - The bot's prefix.
   * @return {String} - Error message.
   */
  checkIDError(chalID, msg, command, prefix) {
    let returnData = '';
    if (isNaN(chalID) || chalID < 1) {
      returnData = '**Error:** Challenge ID must be an integer. Example: `' +
        prefix + command + ' 10793`.';
    } else if (!(chalID in clist.running)) {
      returnData = '**Error:** Challenge ' + chalID + ' does not exist!';
    } else if (this.hiddenCheck(chalID, msg.guild.id)) {
      returnData = msg.author + ', you do not have permission to ' +
        command + ' this challenge.';
    } else {
      returnData = false;
    }
    return returnData;
  }
  /**
   * Check to see whether a challenge is hidden from a server.
   * @param {String} chalID - The ID of the challenge to check.
   * @param {String} guildID - The ID of the server to check against.
   * @return {Object} - User data.
   */
  hiddenCheck(chalID, guildID) {
    let check = false;
    if (clist.running[chalID].hidden && client.channels.get(
        clist.running[chalID].channelID).guild.id != guildID) {
      check = true;
    }
    return check;
  }
  /**
   * Validate and assign a total type.
   * @param {String} type - The type of the challenge.
   * @return {String} - User data.
   */
  typeAssign(type) {
    if (type === undefined) {
      type = 'words';
    }
    if (type.charAt(type.length-1) != 's') {
      type += 's';
    }
    if (!(['words', 'lines', 'pages', 'minutes'].includes(type))) {
      type = false;
    }
    return type;
  }
}

module.exports = new Challenges();
