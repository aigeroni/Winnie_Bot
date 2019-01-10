const Challenge = require('./challenge');
const clist = require('./clist.js');
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

    conn.collection('challengeDB').insert(array, {}, function(e, docs) {});
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
        delete clist.running[this.objectID];
        break;
    }
  }
  /** Check to see whether the countdown is over, and start the sprint if so. */
  start() {
    super.start();
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
          clist.dbUpdate('userDB', user, data);
        }
      }
      super.terminate();
    } else if (this.cDur == 60) {
      super.sendMsg('There is 1 minute remaining in ' + this.displayName + '.');
    } else if (this.cDur % 300 == 0) {
      super.sendMsg(
          'There are ' + this.cDur / 60 + ' minutes remaining in ' +
          this.displayName + '.'
      );
    } else if ([30, 10, 5].includes(this.cDur)) {
      super.sendMsg(
          'There are ' + this.cDur + ' seconds remaining in ' +
          this.displayName + '.'
      );
    }
  }
}

module.exports = Sprint;
