const Challenge = require('./challenge.js');
const challengelist = require('./challengelist.js');
const conn = require('mongoose').connection;

/** Represents a chain war. */
class ChainWar extends Challenge {
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
      joinedUsers
  ) {
    super(
        objectID,
        creator,
        warName + ' (' + current + '/' + total + ')',
        initStamp,
        countdown,
        duration,
        channel,
        'chain war',
        hidden,
        hookedChannels,
        joinedUsers
    );
    this.warName = warName;
    this.current = current;
    this.total = total;
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
      countdown: this.countdown,
      duration: this.duration,
      channel: this.channelID,
      hookedChannels: this.hookedChannels,
      joinedUsers: this.joinedUsers,
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
        this.channel.send('Error: Invalid state reached.');
        delete challengelist.challengeList[this.objectID];
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
        if (this.joinedUsers[user].countType == 'words') {
          conn.collection('userDB').update(
              {_id: user},
              {
                $inc: {
                  lifetimeWarWords:
                  parseInt(this.joinedUsers[user].countData),
                  lifetimeWordMinutes:
                  parseFloat(this.duration),
                },
              },
              {upsert: true}
          );
        } else if (this.joinedUsers[user].countType == 'lines') {
          conn.collection('userDB').update(
              {_id: user},
              {
                $inc: {
                  lifetimeWarLines:
                  parseInt(this.joinedUsers[user].countData),
                  lifetimeLineMinutes:
                  parseFloat(this.duration),
                },
              },
              {upsert: true}
          );
        } else if (this.joinedUsers[user].countType == 'pages') {
          conn.collection('userDB').update(
              {_id: user},
              {
                $inc: {
                  lifetimeWarPages:
                  parseInt(this.joinedUsers[user].countData),
                  lifetimePageMinutes:
                  parseFloat(this.duration),
                },
              },
              {upsert: true}
          );
        } else {
          conn.collection('userDB').update(
              {_id: user},
              {
                $inc: {
                  lifetimeWarMinutes:
                  parseInt(this.joinedUsers[user].countData),
                },
              },
              {upsert: true}
          );
        }
      }
      for (let i = 0; i < this.hookedChannels.length; i++) {
        challengelist.generateSummary(
            client.channels.get(this.hookedChannels[i]),
            this.objectID
        );
      }
      conn.collection('challengeDB').remove({_id: this.objectID});
      delete challengelist.challengeList[this.objectID];
    }
  }
}

module.exports = ChainWar;
