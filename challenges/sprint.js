const Challenge = require('./challenge');
const dbc = require('../dbc.js');

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
   * @param {Array} hookedChannels - A list of channels that have joined the
   *  sprint.
   * @param {Object} joined - A list of users who have joined the sprint.
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
      hookedChannels,
      joined
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
        hookedChannels,
        joined
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
      hookedChannels: this.hookedChannels,
      joined: this.joined,
      state: this.state,
      type: 'sprint',
      hidden: this.hidden,
    };
    const array = [challengeData];

    dbc.dbInsert('challengeDB', array);
  }
  /** Update the sprint at each tick. */
  update() {
    switch (this.state) {
      case 0:
        this.start();
        break;
      case 1:
        this.end();
        break;
      default:
        this.channel.send('**Error:** Invalid state reached.');
        this.cancel();
        break;
    }
  }
  /**
   * Builds user data for the challenge database.
   * @param {String} channel - The channel from which the user joined.
   * @param {String} timestamp - The time at which the user finished the sprint.
   * @param {String} minutes - The time taken to complete the sprint.
   * @return {Object} - JSON object representing the total.
   */
  buildUserData(channel, timestamp, minutes) {
    return {
      timestampCalled: timestamp,
      timeTaken: minutes,
      channelID: channel,
    };
  }
  /** Construct the message displayed to users when a sprint begins. */
  startMsg() {
    for (let i = 0; i < this.hookedChannels.length; i++) {
      const userList = super.getUsers(this.hookedChannels[i]);
      const channelObject = client.channels.get(this.hookedChannels[i]);
      let timeString = 'minutes';
      if (this.duration == 1) {
        timeString = 'minute';
      }
      channelObject.send(
          this.displayName +
          ' (ID ' +
          this.objectID +
          ', ' +
          this.duration +
          ' ' +
          timeString +
          ') starts now! Race to ' +
          this.goal +
          ' words!' +
          userList
      );
    }
    this.state = 1;
  }
  /** Check to see whether the sprint is over, and post the summary if so. */
  end() {
    this.cDur--;
    if (this.cDur <= 0) {
      for (const user in this.joined) {
        if (this.joined[user].timeTaken != undefined) {
          const data = '$inc: {lifetimeSprintWords:' + parseInt(this.goal) +
            ', lifetimeSprintMinutes:' + this.joined[user].timeTaken + ',}';
          dbc.dbUpdate('userDB', {_id: user}, data);
        }
      }
      super.terminate();
    } else if (this.cDur == 60) {
      super.buildMsg(
          'There is 1 minute remaining in ' + this.displayName + '.'
      );
    } else if (this.cDur % 300 == 0) {
      super.buildMsg(
          'There are ' + this.cDur / 60 + ' minutes remaining in ' +
          this.displayName + '.'
      );
    } else if ([30, 10, 5].includes(this.cDur)) {
      super.buildMsg(
          'There are ' + this.cDur + ' seconds remaining in ' +
          this.displayName + '.'
      );
    }
  }
}

module.exports = Sprint;
