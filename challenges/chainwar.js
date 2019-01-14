const War = require('./war.js');
const clist = require('./clist.js');
const dbc = require('../dbc.js');

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
   * @param {Object} joined - A list of users who have joined the war.
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
      joined,
      chainTotal,
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
        joined,
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
      joined: this.joined,
      chainTotal: this.chainTotal,
      state: this.state,
      type: 'chain war',
      hidden: this.hidden,
    };
    const array = [challengeData];

    dbc.dbInsert('challengeDB', array);
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
  /**
   * Builds user data for the challenge database.
   * @param {String} channel - The channel from which the user joined.
   * @param {String} total - The total posted by the user.
   * @param {String} type - The type of the total.
   * @return {Object} - JSON object representing the total.
   */
  buildUserData(channel, total, type) {
    return super.buildUserData(channel, total, type);
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
    if (this.cPost <= 0) {
      this.addToChains();
      super.terminate();
      if (this.current == this.total) {
        for (let i = 0; i < this.hookedChannels.length; i++) {
          this.getChannel(this.hookedChannels[i]).send(this.chainSummary(
              this.hookedChannels[i], this.warName, this.chainTotal
          ));
        }
      }
    }
  }
  /** Add chain war totals to chain summary. */
  addToChains() {
    for (const user in this.joined) {
      if (this.joined.hasOwnProperty(user)) {
        const type = this.joined[user].countType;
        this.chainTotal = this.addToAggregate(this.chainTotal, user);
        this.chainTotal[user][type][0] +=
            parseInt(this.joined[user].countData);
        this.chainTotal[user][type][1] += parseInt(this.duration);
        this.chainTotal[user].channelID = this.joined[user].channelID;
      }
    }
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
    // for (const server in serverTotals) {
    //   if (serverTotals.hasOwnProperty(server)) {
    //     returnMsg += this.serverText(server, serverTotals);
    //   }
    // }
    if (summaryData == '') {
      summaryData = 'No totals were posted for this chain war.';
    }
    returnMsg += summaryData;
    return returnMsg;
  }
}

module.exports = ChainWar;
