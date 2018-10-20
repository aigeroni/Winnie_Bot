const Challenge = require('./challenge.js');
const conn = require('mongoose').connection;

/** Represents a war. */
class War extends Challenge {
  /**
   * Create a chain war.
   * @param {Number} objectID - The unique ID of the war.
   * @param {Number} creator - The Discord ID of the creator.
   * @param {String} displayName - The name of the war.
   * @param {Number} initStamp - UNIX timestamp of creation time.
   * @param {Number} countdown - Time in minutes from creation to start.
   * @param {Number} duration - Duration in minutes.
   * @param {String} channel - Discord ID of start channel.
   * @param {Boolean} hidden - Flag for whether challenge is visible to users
   *  on other servers.
   * @param {Object} joinedUsers - A list of users who have joined the war.
   */
  constructor(
      objectID,
      creator,
      displayName,
      initStamp,
      countdown,
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
        'war',
        hidden,
        joinedUsers
    );

    const challengeData = {
      _id: this.objectID,
      creator: this.creator,
      name: this.displayName,
      startTime: this.initStamp,
      countdown: this.countdown,
      duration: this.duration,
      channel: this.channelID,
      joinedUsers: this.joinedUsers,
      state: this.state,
      type: 'war',
      hidden: this.hidden,
    };
    const array = [challengeData];

    conn.collection('challengeDB').insert(array, {}, function(e, docs) {});
  }
  /** Update the war at each tick. */
  update() {
    super.update();
  }
  /** Check to see whether the countdown is over, and start the war if so. */
  start() {
    super.start();
  }
  /** Construct the message displayed to users when a war begins. */
  startMsg() {
    super.startMsg();
  }
  /** Check to see whether the war is over, and end it if so. */
  end() {
    super.end();
  }
  /** Check to see whether the total period is over, and post the summary. */
  terminate() {
    super.terminate();
  }
}

module.exports = War;
