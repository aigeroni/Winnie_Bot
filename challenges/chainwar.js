const War = require('./war.js');
const clist = require('./clist.js');
const conn = require('mongoose').connection;

/** Represents a chain war. */
class ChainWar extends War {
  /**
   * Create a chain war.
   * @param {Number} objectID - The unique ID of the chain war.
   * @param {Number} creator - The Discord ID of the creator.
   * @param {String} warName - The name of the chain war.
   * @param {Number} initStamp - UNIX timestamp of creation time.
   * @param {Number} current - The number of the current war in the chain.
   * @param {Number} total - The total number of wars in the chain.
   * @param {Number} countdown - Time in minutes from creation to start.
   * @param {Number} duration - Duration in minutes.
   * @param {String} channel - Discord ID of start channel.
   * @param {Boolean} hidden - Flag for whether challenge is visible to users
   *  on other servers.
   * @param {Array} hookedChannels - A list of channels that have joined the
   *  war.
   * @param {Object} joinedUsers - A list of users who have joined the war.
   * @param {Object} chainTotal - Totals for all users, for all wars in the
   *  chain.
   */
  constructor(
      objectID,
      creator,
      warName,
      initStamp,
      current,
      total,
      countdown,
      duration,
      channel,
      hidden,
      hookedChannels,
      joinedUsers,
      chainTotal
  ) {
    super(
        objectID,
        creator,
        warName + ' (' + current + '/' + total + ')',
        initStamp,
        countdown[current - 1],
        duration,
        channel,
        hidden,
        hookedChannels,
        joinedUsers,
        'chain war'
    );
    this.warName = warName;
    this.current = current;
    this.total = total;
    this.chainTotal = chainTotal;
    this.countdownList = countdown;
    if (this.state == 2) {
      this.state = 3;
    }
    const challengeData = {
      _id: this.objectID,
      creator: this.creator,
      name: this.warName,
      startTime: this.initStamp,
      current: this.current,
      total: this.total,
      countdown: this.countdownList,
      duration: this.duration,
      channel: this.channelID,
      hookedChannels: this.hookedChannels,
      joinedUsers: this.joinedUsers,
      chainTotal: this.chainTotal,
      state: this.state,
      type: 'chain war',
      hidden: this.hidden,
    };
    const array = [challengeData];

    conn.collection('challengeDB').insert(array, {}, function(e, docs) {});
  }
  /** Update the chain war at each tick. */
  update() {
    switch (this.state) {
      case 0:
        this.start();
        break;
      case 1:
        this.end();
        break;
      case 2:
        break;
      case 3:
        this.terminate();
        break;
      default:
        this.channel.send('**Error:** Invalid state reached.');
        delete clist.running[this.objectID];
        break;
    }
  }
  /** Check to see whether the countdown is over, and start the war if so. */
  start() {
    super.start();
  }
  /** Construct the message displayed to users when a chain war begins. */
  startMsg() {
    super.startMsg();
  }
  /** Check to see whether the chain war is over, and end it if so. */
  end() {
    super.end();
  }
  /** Check to see whether the total period is over, and post the summary. */
  terminate() {
    this.cPost--;
    if (this.cPost == 0) {
      for (const user in this.joinedUsers) {
        if (this.joinedUsers.hasOwnProperty(user)) {
          const type = this.joinedUsers[user].countType;
          if (this.chainTotal[user] === undefined) {
            this.chainTotal[user] = {
              words: [0, 0],
              lines: [0, 0],
              pages: [0, 0],
              minutes: [0, 0],
              channelID: this.joinedUsers[user].channelID,
            };
          }
          this.chainTotal[user][type][0] +=
              parseInt(this.joinedUsers[user].countData);
          this.chainTotal[user][type][1] += 1;
        }
      }
      super.terminate();
    }
  }
}

module.exports = ChainWar;
