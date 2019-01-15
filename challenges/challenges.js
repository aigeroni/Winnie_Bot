const clist = require('./clist.js');

/** Class containing functions for challenge management. */
class Challenges {
  /** Initialise variables required for challenge management. */
  constructor() {
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
    } else if (clist.running[suffix].state == 0) {
      returnMsg = '**Error:** This challenge has not started yet!';
    } else {
      raptorCheck = true;
      const doneStamp = new Date().getTime();
      const timeTaken = (doneStamp - clist.running[suffix].startStamp) / 60000;
      clist.running[suffix]
          .submitUserData(msg.author.id, msg.channel.id, doneStamp, timeTaken);
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
    } else if (start.validateGoal(wordsWritten)) {
      returnMsg = start.validateGoal(wordsWritten);
    } else if (clist.running[chalID].type == 'sprint') {
      returnMsg = '**Error:** You cannot post a total for sprints.';
    } else if (clist.running[chalID].state < 2) {
      returnMsg = '**Error:** This challenge has not ended yet!';
    } else {
      raptorCheck = true;
      clist.running[chalID].submitUserData(msg.author.id,
          msg.channel.id, wordsWritten, writtenType);
      returnMsg = msg.author + ', your total of **' + wordsWritten +
        '** ' + writtenType + ' has been added to the summary.';
    }
    return {returnMsg: returnMsg, raptorCheck: raptorCheck};
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
    } else if (clist.hiddenCheck(chalID, msg.guild.id)) {
      returnData = msg.author + ', you do not have permission to ' +
        command + ' this challenge.';
    } else {
      returnData = false;
    }
    return returnData;
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
