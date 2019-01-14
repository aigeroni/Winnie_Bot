const profanity = require('profanity-util', {substring: 'lite'});
const emojiRegex = require('emoji-regex/es2015/index.js');
const ChainWar = require('./chainwar');
const Sprint = require('./sprint');
const War = require('./war');
const clist = require('./clist.js');
const dbc = require('../dbc.js');
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
    const flagData = await this.flagCheck(msg, suffix);
    const words = flagData.args.shift();
    const timeout = flagData.args.shift();
    let start = flagData.args.shift();
    if (start === undefined) {
      start = 1;
    }
    let sprintName = flagData.args.join(' ');
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
      clist.running[this.timerID] = new Sprint(
          this.timerID,
          msg.author.id,
          sprintName,
          new Date().getTime(),
          start,
          words,
          timeout,
          msg.channel.id,
          flagData.display,
          [msg.channel.id],
          {}
      );
      if (flagData.joinFlag) {
        returnMsg += await this.joinChallenge(msg, prefix, this.timerID);
      }
      await this.incrementID();
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
    const flagData = await this.flagCheck(msg, suffix);
    const duration = flagData.args.shift();
    let start = flagData.args.shift();
    let warName = flagData.args.join(' ');
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
      clist.running[this.timerID] = new War(
          this.timerID,
          msg.author.id,
          warName,
          new Date().getTime(),
          start,
          duration,
          msg.channel.id,
          flagData.display,
          [msg.channel.id],
          {}
      );
      if (flagData.joinFlag) {
        returnMsg += await this.joinChallenge(msg, prefix, this.timerID);
      }
      await this.incrementID();
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
    const flagData = await this.flagCheck(msg, suffix);
    const chainWarCount = flagData.args.shift();
    const duration = flagData.args.shift();
    let timeBetween = flagData.args.shift().split('|');
    while (timeBetween.length < chainWarCount) {
      timeBetween.push(timeBetween[timeBetween.length-1]);
    }
    let warName = flagData.args.join(' ');
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
    } else if (this.validateChainCount(timeBetween)) {
      returnMsg = this.validateChainCount(timeBetween)
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
      clist.running[this.timerID] = new ChainWar(
          this.timerID,
          msg.author.id,
          warName,
          new Date().getTime(),
          1,
          chainWarCount,
          timeBetween,
          duration,
          msg.channel.id,
          flagData.display,
          [msg.channel.id],
          {},
          {}
      );
      if (flagData.joinFlag) {
        returnMsg += await this.joinChallenge(msg, prefix, this.timerID);
      }
      await this.incrementID();
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
   * Validates splits between wars in a chain.
   * @param {String} splits - An array of splits to validate.
   * @return {String} - Message to send to user.
   */
  validateChainCount(splits) {
    let returnMsg = false;
    for (const item in splits) {
      if (this.validateCountdown(splits[item])) {
        returnMsg = this.validateCountdown(splits[item]);
      }
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
    await dbc.dbUpdate('timer', {data: this.timerID}, {data: this.timerID + 1});
    this.timerID = this.timerID + 1;
  }
  /**
   * Configure options for a challenge.
   * @param {String} msg - The message that created the challenge.
   * @param {Array} suffix - Options to configure.
   * @return {Promise} - Promise object.
   */
  async flagCheck(msg, suffix) {
    let joinFlag = false;
    let crossServerHide = false;
    const args = suffix.split(' ');
    const user = await conn.collection('userDB').findOne(
        {_id: msg.author.id}
    );
    const guild = await conn.collection('configDB').findOne(
        {_id: msg.guild.id}
    );
    if (
      (user != null && user.xStatus == true) ||
      (guild != null && guild.xStatus == true)
    ) {
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
    return {join: joinFlag, display: crossServerHide, args: args};
  }
}

module.exports = new ChallengeStart();
