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
    if (user != null) {
      if (user.autoStatus == 'off') {
        crossServerHide = true;
      }
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
    let sprintName = args.join(' ');
    if (start === undefined) {
      start = 1;
    }
    if (sprintName == '') {
      sprintName = msg.author.username + '\'s sprint';
    }
    if (profanity.check(sprintName).length > 0) {
      returnMsg = '**Error:** Sprint names may not contain profanity.';
    } else if (this.regex.exec(sprintName)) {
      returnMsg = '**Error:** Sprint names may not contain emoji.';
    } else if (msg.mentions.members.size > 0) {
      returnMsg = '**Error:** Sprint names may not mention users.';
    } else if (!Number.isInteger(Number(words))) {
      returnMsg = '**Error:** Word goal must be a whole number. Example: `' +
          prefix +
          'sprint 200 10 1`.';
    } else if (isNaN(timeout)) {
      returnMsg = '**Error:** Sprint duration must be a number. Example: `' +
          prefix +
          'sprint 200 10 1`.';
    } else if (isNaN(start)) {
      returnMsg = '**Error:** Time to start must be a number. Example: `' +
          prefix +
          'sprint 200 10 1`.';
    } else if (start > 30) {
      returnMsg =
          '**Error:** Sprints cannot start more than 30 minutes in the future.';
    } else if (timeout > 60) {
      returnMsg = '**Error:** Sprints cannot last for more than an hour.';
    } else if (words < 1) {
      returnMsg = '**Error:** Word goal cannot be negative.';
    } else if (start <= 0) {
      returnMsg = '**Error:** Sprints cannot start in the past.';
    } else if (timeout < 1) {
      returnMsg = '**Error:** Sprints must run for at least a minute.';
    } else if (sprintName.length > 150) {
      returnMsg = '**Error:** Sprint names must be 150 characters or less.';
    } else {
      try {
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
      } catch (e) {
        returnMsg = '**Error:** Sprint creation failed.';
        logger.error('Error %s: %s.', e, e.stack);
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
        + 'Example: `' + prefix + 'war 10 1`.';
    } else if (this.validateCountdown(start)) {
      returnMsg = this.validateCountdown(start)
        + 'Example: `' + prefix + 'war 10 1`.';
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
    const user = await conn.collection('userDB').findOne(
        {_id: msg.author.id}
    );
    if (user != null) {
      if (user.autoStatus == 'off') {
        crossServerHide = true;
      }
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
    if (profanity.check(warName).length > 0) {
      returnMsg = '**Error:** War names may not contain profanity.';
    } else if (this.regex.exec(warName)) {
      returnMsg = '**Error:** War names may not contain emoji.';
    } else if (msg.mentions.members.size > 0) {
      returnMsg = '**Error:** War names may not mention users.';
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
    } else if (isNaN(duration)) {
      returnMsg = '**Error:** War duration must be a number. Example: `' +
          prefix +
          'chainwar 2 10 1`.';
    } else if (chainWarCount < 2 || chainWarCount > 10) {
      returnMsg = '**Error:** Chains must be between two and ten wars long.';
    } else if (duration * chainWarCount > 120) {
      returnMsg =
          '**Error:** Chain wars cannot run for more than two hours in total.';
    } else if (timeBetween <= 0) {
      returnMsg = '**Error:** Chain wars cannot overlap.';
    } else if (duration < 1) {
      returnMsg = '**Error:** Wars must run for at least a minute.';
    } else if (warName.length > 150) {
      returnMsg = '**Error:** War names must be 150 characters or less.';
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
    const chalID = suffix;
    let raptorCheck = true;
    const returnInfo = this.checkIDError(chalID, msg, 'time', prefix);
    if (returnInfo) {
      returnMsg = returnInfo;
    } else if (!(clist.running[chalID].type == 'sprint')) {
      raptorCheck = false;
      returnMsg = '**Error:** You can only call time on a sprint.';
    } else {
      const doneStamp = new Date().getTime();
      const timeTaken = (doneStamp - clist.running[chalID].startStamp) / 60000;
      clist.running[chalID].joined[msg.author.id] =
        this.buildUserData(msg, 'sprint', doneStamp, timeTaken);
      this.pushToHook(chalID, msg);
      const dbData = '$set: {joined: clist.running[chalID].joined,}';
      await dbc.dbUpdate('challengeDB', parseInt(chalID), dbData);
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
    let writtenType = args.shift();
    let raptorCheck = true;
    if (writtenType === undefined) {
      writtenType = 'words';
    }
    if (writtenType.charAt(writtenType.length-1) != 's') {
      writtenType += 's';
    }
    const returnInfo = this.checkIDError(chalID, msg, 'total', prefix);
    if (returnInfo) {
      returnMsg = returnInfo;
    } else if (!(
      writtenType == 'lines' || writtenType == 'pages' ||
      writtenType == 'words' || writtenType == 'minutes'
    )) {
      raptorCheck = false;
      returnMsg = '**Error:** You must work in words, lines, or pages.';
    } else if (clist.running[chalID].type == 'sprint') {
      raptorCheck = false;
      returnMsg = '**Error:** You cannot post a total for sprints.';
    } else if (clist.running[chalID].state < 2) {
      raptorCheck = false;
      returnMsg = '**Error:** This challenge has not ended yet!';
    } else if (!Number.isInteger(Number(wordsWritten))) {
      raptorCheck = false;
      returnMsg = msg.author +
          ', I need a whole number to include in the summary!';
    } else {
      for (const user in clist.running[chalID].joined) {
        if (user == msg.author.id && !(clist.running[chalID].joined[user]
            .countData === undefined)) {
          raptorCheck = false;
        }
      }
      if (Number(wordsWritten) < 1) {
        raptorCheck = false;
      }
      clist.running[chalID].joined[msg.author.id] = this.buildUserData(msg,
          clist.running[chalID].type, wordsWritten, writtenType);
      if (clist.running[chalID].hookedChannels.indexOf(msg.channel.id) == -1) {
        clist.running[chalID].hookedChannels.push(msg.channel.id);
      }
      const dbData = '$set: {joined: clist.running[chalID].joined,}';
      await dbc.dbUpdate('challengeDB', parseInt(chalID), dbData);
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
   * Increment the challenge ID.
   * @return {Promise} - Promise object.
   */
  async incrementID() {
    await conn.collection('timer').update(
        {data: this.timerID},
        {data: this.timerID + 1},
        {upsert: true}
    );
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
}

module.exports = new Challenges();
