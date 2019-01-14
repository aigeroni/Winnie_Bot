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
class ChallengeStart {
  /** Initialise variables required for challenge management. */
  constructor() {
    this.timerID = 1;
    this.crossServerStatus = {};
    this.autoSumStatus = {};
    this.regex = emojiRegex();
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
    } else if (this.validateName(sprintName)) {
      returnMsg = this.validateName(sprintName);
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
}

module.exports = new ChallengeStart();
