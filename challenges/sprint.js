const Challenge = require('./challenge');
const conn = require('mongoose').connection;

/** Represents a sprint. */
class Sprint extends Challenge {
  /**
   * Create a chain war.
   * @param {Number} objectID - The unique ID of the sprint.
   * @param {Number} creator - The Discord ID of the creator.
   * @param {String} displayName - The name of the sprint.
   * @param {Number} initStamp - UNIX timestamp of creation time.
   * @param {Number} countdown - Time in minutes from creation to start.
   * @param {Number} goal - The goal, in words, of the sprint.
   * @param {Number} duration - Duration in minutes.
   * @param {String} channel - Discord ID of start channel.
   * @param {Boolean} hidden - Flag for whether challenge is visible to users
   *  on other servers.
   * @param {Object} joinedUsers - A list of users who have joined the sprint.
   */
  constructor(
      objectID,
      creator,
      displayName,
      initStamp,
      countdown,
      goal,
      duration,
      channel,
      hidden,
      joinedUsers
  ) {
    super(
        objectID,
        creator,
        displayName,
        initStamp,
        countdown,
        duration,
        channel,
        'sprint',
        hidden,
        joinedUsers
    );
    this.goal = goal;

    const challengeData = {
      _id: this.objectID,
      creator: this.creator,
      name: this.displayName,
      startTime: this.initStamp,
      countdown: this.countdown,
      goal: this.goal,
      duration: this.duration,
      channel: this.channelID,
      joinedUsers: this.joinedUsers,
      state: this.state,
      type: 'sprint',
      hidden: this.hidden,
    };
    const array = [challengeData];

    conn.collection('challengeDB').insert(array, {}, function(e, docs) {});
  }
  /** Update the sprint at each tick. */
  update() {
    super.update();
  }
  /** Check to see whether the countdown is over, and start the sprint if so. */
  start() {
    super.start();
  }
  /** Construct the message displayed to users when a sprint begins. */
  startMsg() {
    for (let i = 0; i < this.hookedChannels.length; i++) {
      let userList = '';
      for (const user in this.joinedUsers) {
        if (this.joinedUsers[user].channelID == this.hookedChannels[i]) {
          userList += ' ' + client.users.get(user);
        }
      }
      const channelObject = client.channels.get(this.hookedChannels[i]);
      channelObject.send(
          this.displayName +
          ' (ID ' +
          this.objectID +
          ') starts now! Race to ' +
          this.goal +
          ' words!' +
          userList
      );
    }
    this.state = 1;
  }
  /** Check to see whether the sprint is over, and end it if so. */
  end() {
    super.end();
  }
  /** Check to see whether the total period is over, and post the summary. */
  terminate() {
    super.terminate();
  }
}

module.exports = Sprint;
