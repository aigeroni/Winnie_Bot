/** Information required for challenge creation and summary display. */
class ChallengeList {
  /** Initialise variables required for challenge creation and summaries. */
  constructor() {
    this.DUR_AFTER = 30;
    this.running = {};
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
