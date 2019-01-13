const Challenge = require('./challenge.js');
const dbc = require('../dbc.js');

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
   * @param {Array} hookedChannels - A list of channels that have joined the
   *  war.
   * @param {Object} joined - A list of users who have joined the war.
   * @param {String} type - The type of the war.
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
      hookedChannels,
      joined,
      type
  ) {
    if (type == undefined) {
      type = 'war';
    }
    super(
        objectID,
        creator,
        displayName,
        initStamp,
        countdown,
        duration,
        channel,
        type,
        hidden,
        hookedChannels,
        joined
    );

    const challengeData = {
      _id: this.objectID,
      creator: this.creator,
      name: this.displayName,
      startTime: this.initStamp,
      countdown: this.countdown,
      duration: this.duration,
      channel: this.channelID,
      hookedChannels: this.hookedChannels,
      joined: this.joined,
      state: this.state,
      type: 'war',
      hidden: this.hidden,
    };
    const array = [challengeData];

    dbc.dbInsert('challengeDB', array);
  }
  /** Update the war at each tick. */
  update() {
    super.update();
  }
  /**
   * Builds user data for the challenge database.
   * @param {String} channel - The channel from which the user joined.
   * @param {String} total - The total posted by the user.
   * @param {String} type - The type of the total.
   * @return {Object} - JSON object representing the total.
   */
  buildUserData(channel, total, type) {
    return {
      countData: total,
      countType: type,
      channelID: channel,
    };
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
    this.cPost--;
    if (this.cPost <= 0) {
      for (const user in this.joined) {
        if (this.joined.hasOwnProperty(user)) {
          let dataToChange = '$inc: {';
          if (this.joined[user].countType == 'words') {
            dataToChange +=
              'lifetimeWarWords: parseInt(this.joined[user].countData),' +
              'lifetimeWordMinutes: parseFloat(this.duration),},';
          } else if (this.joined[user].countType == 'lines') {
            dataToChange +=
              'lifetimeWarLines: parseInt(this.joined[user].countData),' +
              'lifetimeLineMinutes: parseFloat(this.duration),},';
          } else if (this.joined[user].countType == 'pages') {
            dataToChange +=
              'lifetimeWarPages: parseInt(this.joined[user].countData),' +
              'lifetimePageMinutes: parseFloat(this.duration),},';
          } else if (this.joined[user].countType == 'minutes') {
            dataToChange += 'lifetimeWarMinutes: ' +
              'parseInt(this.joined[user].countData),},';
          }
          dbc.dbUpdate('userDB', user, dataToChange);
        }
      }
      super.terminate();
    }
  }
}

module.exports = War;
