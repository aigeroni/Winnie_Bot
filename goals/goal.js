const goallist = require('./goallist.js');
const dbc = require('../dbc.js');

/** Represents a goal. */
class Goal {
  /**
   * Create a goal.
   * @param {Number} authorID - The Discord ID of the goal setter.
   * @param {Number} goal - The goal that the user is trying to reach.
   * @param {String} goalType - The type of goal that the user is trying to
   * reach (words, lines, pages, or minutes).
   * @param {Number} written - The user's progress towards their goal.
   * @param {Number} startTime - UNIX timestamp of the second the goal was set.
   * @param {Number} terminationTime - UNIX timestamp of the second the goal
   * will resolve.
   * @param {Number} channelID - Discord ID of start channel.
   */
  constructor(
      authorID,
      goal,
      goalType,
      written,
      startTime,
      terminationTime,
      channelID
  ) {
    this.authorID = authorID;
    this.goal = goal;
    this.goalType = goalType;
    this.written = written;
    this.startTime = startTime;
    this.terminationTime = terminationTime;
    this.channelID = channelID;
    this.channel = client.channels.get(this.channelID);

    const goalData = {
      authorID: this.authorID,
      goal: this.goal,
      goalType: this.goalType,
      written: this.written,
      startTime: this.startTime,
      terminationTime: this.terminationTime,
      channelID: this.channelID,
    };
    dbc.dbUpdate('goalDB', {authorID: this.authorID}, goalData);
  }
  /** Check to see whether the goal resolves, and handle it if so.
   * @return {Number} - The user's chance of hatching a raptor.
   */
  update() {
    if (new Date().getTime() >= this.terminationTime) {
      const raptorRollData = [this.channel, (this.written / this.goal) * 100];
      this.clearGoal(this.authorID);
      return raptorRollData;
    }
    return false;
  }
  /**
   * Clears a goal from the database.
   */
  clearGoal() {
    conn.collection('goalDB').remove({authorID: this.authorID});
    delete goallist.goalList[this.authorID];
  }
  /** Update the goal with the user's current progress.
   * @param {Number} wordNumber - The user's progress towards their goal.
   * @param {Boolean} type - Whether to overwrite the user's progress with the
   * given total (true), or add it to their existing progress (false).
   */
  addWords(wordNumber, type) {
    switch (type) {
      case false:
        this.written += parseInt(wordNumber);
        break;
      case true:
        this.written = parseInt(wordNumber);
        break;
    }
    conn
        .collection('goalDB')
        .update(
            {authorID: this.authorID},
            {$set: {written: this.written}},
            {upsert: false},
            function(err) {}
        );
  }
}

module.exports = Goal;
