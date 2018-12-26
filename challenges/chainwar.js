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
        'chain war',
        hidden,
        hookedChannels,
        joinedUsers
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
        if (this.joinedUsers.hasOwnProperty(user)) {
          if (!(user in this.chainTotal)) {
            this.chainTotal[user] = {
              words: [0, 0],
              lines: [0, 0],
              pages: [0, 0],
              minutes: [0, 0],
              channelID: this.joinedUsers[user].channelID,
            };
          }
          if (this.joinedUsers[user].countType == 'words') {
            this.chainTotal[user].words[0] +=
                parseInt(this.joinedUsers[user].countData);
            this.chainTotal[user].words[1] += 1;
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
            this.chainTotal[user].lines[0] +=
                parseInt(this.joinedUsers[user].countData);
            this.chainTotal[user].lines[1] += 1;
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
            this.chainTotal[user].pages[0] +=
                parseInt(this.joinedUsers[user].countData);
            this.chainTotal[user].pages[1] += 1;
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
          } else if (this.joinedUsers[user].countType == 'minutes') {
            this.chainTotal[user].minutes[0] +=
                parseInt(this.joinedUsers[user].countData);
            this.chainTotal[user].minutes[1] += 1;
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
      }
      for (let i = 0; i < this.hookedChannels.length; i++) {
        const channelToSend = client.channels.get(this.hookedChannels[i]);
        channelToSend.send(challengelist.generateSummary(
            channelToSend,
            this.objectID
        ));
      }
      if (this.current == this.total) {
        this.chainSummary();
      }
      conn.collection('challengeDB').remove({_id: this.objectID});
      delete challengelist.challengeList[this.objectID];
    }
  }
  /** Generate a summary for all wars in a chain. */
  chainSummary() {
    const channels = [];
    for (const user in this.chainTotal) {
      if (this.chainTotal.hasOwnProperty(user)) {
        channels.push(this.chainTotal[user].channelID);
      }
    }
    for (let i = 0; i < channels.length; i++) {
      let summaryData = '***Summary for ' + this.warName + ':***\n\n';
      const userTotals = {words: {}, lines: {}, pages: {}, minutes: {}};
      const summaryServer = client.channels.get(channels[i]).guild;
      for (const user in this.chainTotal) {
        if (this.chainTotal.hasOwnProperty(user)) {
          const userServer =
            client.channels.get(this.chainTotal[user].channelID).guild;
          if (
            summaryServer.id == userServer.id
          ) {
            if (!(userServer in userTotals['words'])) {
              userTotals['words'][userServer.id] = [0, 0];
            }
            if (!(userServer in userTotals['lines'])) {
              userTotals['lines'][userServer.id] = [0, 0];
            }
            if (!(userServer in userTotals['pages'])) {
              userTotals['pages'][userServer.id] = [0, 0];
            }
            if (!(userServer in userTotals['minutes'])) {
              userTotals['minutes'][userServer.id] = [0, 0];
            }
            let userTotal = client.users.get(user) + ': ';
            let firstType = true;
            if (this.chainTotal[user].words[0] > 0) {
              userTotals['words'][userServer.id][0] +=
                this.chainTotal[user].words[0];
              userTotals['words'][userServer.id][1] += 1;
              userTotal +=
                '**' +
                this.chainTotal[user].words[0] +
                '** ';
              if (this.chainTotal[user].words[0] == 1) {
                userTotal += 'word';
              } else {
                userTotal += 'words';
              }
              userTotal += ' (**' +
                (this.chainTotal[user].words[0] /
                  this.chainTotal[user].words[1]).toFixed(2) +
                '** words per war)';
              firstType = false;
            }
            if (this.chainTotal[user].lines[0] > 0) {
              userTotals['lines'][userServer.id][0] +=
                this.chainTotal[user].lines[0];
              userTotals['lines'][userServer.id][1] += 1;
              if (!(firstType)) {
                userTotal += ', ';
              }
              userTotal +=
                '**' +
                this.chainTotal[user].lines[0] +
                '** ';
              if (this.chainTotal[user].lines[0] == 1) {
                userTotal += 'line';
              } else {
                userTotal += 'lines';
              }
              userTotal += ' (**' +
                (this.chainTotal[user].lines[0] /
                  this.chainTotal[user].lines[1]).toFixed(2) +
                '** lines per war)';
              firstType = false;
            }
            if (this.chainTotal[user].pages[0] > 0) {
              userTotals['pages'][userServer.id][0] +=
                this.chainTotal[user].pages[0];
              userTotals['pages'][userServer.id][1] += 1;
              if (!(firstType)) {
                userTotal += ', ';
              }
              userTotal +=
                '**' +
                this.chainTotal[user].pages[0] +
                '** ';
              if (this.chainTotal[user].pages[0] == 1) {
                userTotal += 'page';
              } else {
                userTotal += 'pages';
              }
              userTotal += ' (**' +
                (this.chainTotal[user].pages[0] /
                  this.chainTotal[user].pages[1]).toFixed(2) +
                '** pages per war)';
              firstType = false;
            }
            if (this.chainTotal[user].minutes[0] > 0) {
              userTotals['minutes'][userServer.id][0] +=
                this.chainTotal[user].minutes[0];
              userTotals['minutes'][userServer.id][1] += 1;
              if (!(firstType)) {
                userTotal += ', ';
              }
              userTotal +=
                '**' +
                this.chainTotal[user].minutes[0] +
                '** ';
              if (this.chainTotal[user].minutes[0] == 1) {
                userTotal += 'minute';
              } else {
                userTotal += 'minutes';
              }
              userTotal += ' (**' +
                (this.chainTotal[user].minutes[0] /
                  this.chainTotal[user].minutes[1]).toFixed(2) +
                '** minutes per war)';
              firstType = false;
            }
            if (!(firstType)) {
              summaryData += userTotal + '\n';
            }
          } else {
            if (!(userServer in userTotals['words'])) {
              userTotals['words'][userServer.id] = [0, 0];
            }
            if (!(userServer in userTotals['lines'])) {
              userTotals['lines'][userServer.id] = [0, 0];
            }
            if (!(userServer in userTotals['pages'])) {
              userTotals['pages'][userServer.id] = [0, 0];
            }
            if (!(userServer in userTotals['minutes'])) {
              userTotals['minutes'][userServer.id] = [0, 0];
            }
            if (this.chainTotal[user].words > 0) {
              userTotals['words'][userServer.id][0] +=
                this.chainTotal[user].words;
              userTotals['words'][userServer.id][1] += 1;
            }
            if (this.chainTotal[user].lines > 0) {
              userTotals['lines'][userServer.id][0] +=
                this.chainTotal[user].lines;
              userTotals['lines'][userServer.id][1] += 1;
            }
            if (this.chainTotal[user].pages > 0) {
              userTotals['pages'][userServer.id][0] +=
                this.chainTotal[user].pages;
              userTotals['pages'][userServer.id][1] += 1;
            }
            if (this.chainTotal[user].minutes > 0) {
              userTotals['minutes'][userServer.id][0] +=
                this.chainTotal[user].minutes;
              userTotals['minutes'][userServer.id][1] += 1;
            }
          }
        }
      }
      // this channel's summary
      summaryData += summaryServer.name + ' Total:';
      let firstType = true;
      if (userTotals['words'][summaryServer.id][0] > 0) {
        summaryData += ' **' + userTotals['words'][summaryServer.id][0];
        if (userTotals['words'][summaryServer.id][0] == 1) {
          summaryData += '** word';
        } else {
          summaryData += '** words';
        }
        summaryData += ' (**' + (
          userTotals['words'][summaryServer.id][0]/
          userTotals['words'][summaryServer.id][1]).toFixed(0)
          + '** avg)';
        firstType = false;
      }
      if (userTotals['lines'][summaryServer.id][0] > 0) {
        if (!firstType) {
          summaryData += ',';
        }
        summaryData += ' **' + userTotals['lines'][summaryServer.id][0];
        if (userTotals['lines'][summaryServer.id][0] == 1) {
          summaryData += '** line';
        } else {
          summaryData += '** lines';
        }
        summaryData += ' (**' + (
          userTotals['lines'][summaryServer.id][0]/
          userTotals['lines'][summaryServer.id][1]).toFixed(0)
          + '** avg)';
        firstType = false;
      }
      if (userTotals['pages'][summaryServer.id][0] > 0) {
        if (!firstType) {
          summaryData += ',';
        }
        summaryData += ' **' + userTotals['pages'][summaryServer.id][0];
        if (userTotals['pages'][summaryServer.id][0] == 1) {
          summaryData += '** page';
        } else {
          summaryData += '** pages';
        }
        summaryData += ' (**' + (
          userTotals['pages'][summaryServer.id][0]/
          userTotals['pages'][summaryServer.id][1]).toFixed(0)
          + '** avg)';
        firstType = false;
      }
      if (userTotals['minutes'][summaryServer.id][0] > 0) {
        if (!firstType) {
          summaryData += ',';
        }
        summaryData += ' **' + userTotals['minutes'][summaryServer.id][0];
        if (userTotals['minutes'][summaryServer.id][0] == 1) {
          summaryData += '** minute';
        } else {
          summaryData += '** minutes';
        }
        summaryData += ' (**' + (
          userTotals['minutes'][summaryServer.id][0]/
          userTotals['minutes'][summaryServer.id][1]).toFixed(0)
          + '** avg)';
        firstType = false;
      }
      summaryData += '\n';
      // other channels' summaries
      for (let j = 0; j < channels.length; j++) {
        const currentServer = client.channels.get(channels[j]).guild;
        if (currentServer.id != summaryServer.id) {
          summaryData += '__*' + currentServer.name + '*__:';
          let xfirstType = true;
          if (userTotals['words'][currentServer.id][0] > 0) {
            summaryData += ' **' + userTotals['words'][currentServer.id][0];
            if (userTotals['words'][currentServer.id][0] == 1) {
              summaryData += '** word';
            } else {
              summaryData += '** words';
            }
            summaryData += ' (**' + (
              userTotals['words'][currentServer.id][0]/
              userTotals['words'][currentServer.id][1]).toFixed(0)
              + '** avg)';
            xfirstType = false;
          }
          if (userTotals['lines'][currentServer.id][0] > 0) {
            if (!xfirstType) {
              summaryData += ',';
            }
            summaryData += ' **' + userTotals['lines'][currentServer.id][0];
            if (userTotals['lines'][currentServer.id][0] == 1) {
              summaryData += '** line';
            } else {
              summaryData += '** lines';
            }
            summaryData += ' (**' + (
              userTotals['lines'][currentServer.id][0]/
              userTotals['lines'][currentServer.id][1]).toFixed(0)
              + '** avg)';
            xfirstType = false;
          }
          if (userTotals['pages'][currentServer.id][0] > 0) {
            if (!xfirstType) {
              summaryData += ',';
            }
            summaryData += ' **' + userTotals['pages'][currentServer.id][0];
            if (userTotals['pages'][currentServer.id][0] == 1) {
              summaryData += '** page';
            } else {
              summaryData += '** pages';
            }
            summaryData += ' (**' + (
              userTotals['pages'][currentServer.id][0]/
              userTotals['pages'][currentServer.id][1]).toFixed(0)
              + '** avg)';
            xfirstType = false;
          }
          if (userTotals['minutes'][currentServer.id][0] > 0) {
            if (!xfirstType) {
              summaryData += ',';
            }
            summaryData += ' **' + userTotals['minutes'][currentServer.id][0];
            if (userTotals['minutes'][currentServer.id][0] == 1) {
              summaryData += '** minute';
            } else {
              summaryData += '** minutes';
            }
            summaryData += ' (**' + (
              userTotals['minutes'][currentServer.id][0]/
              userTotals['minutes'][currentServer.id][1]).toFixed(0)
              + '** avg)';
            xfirstType = false;
          }
          summaryData += '\n';
        }
      }
      // send summary
      client.channels.get(channels[i]).send(summaryData);
    }
  }
}

module.exports = ChainWar;
