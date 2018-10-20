const challengelist = require('./challengelist.js');
const conn = require('mongoose').connection;

/** Represents a challenge. */
class Challenge {
  /**
  * Create a challenge.
  * @param {Number} objectID - The unique ID of the challenge.
  * @param {Number} creator - The Discord ID of the creator.
  * @param {String} displayName - The name of the challenge.
  * @param {Number} initStamp - UNIX timestamp of creation time.
  * @param {Number} countdown - Time in minutes from creation to start.
  * @param {Number} duration - Duration in minutes.
  * @param {String} channel - Discord ID of start channel.
  * @param {String} type - The type of challenge that this object represents.
  * @param {Boolean} hidden - Flag for whether challenge is visible to users
  *  on other servers.
  * @param {Object} joinedUsers - A list of users who have joined the sprint.
  */
  constructor(objectID, creator, displayName, initStamp, countdown, duration,
      channel, type, hidden, joinedUsers) {
    this.objectID = objectID;
    this.creator = creator;
    this.displayName = displayName;
    this.initStamp = initStamp;
    this.countdown = countdown;
    this.duration = duration;
    this.channelID = channel;
    this.channel = client.channels.get(this.channelID);
    this.type = type;
    this.joinedUsers = joinedUsers;
    this.hookedChannels = [channel];
    this.state = 0;
    this.hidden = hidden;

    this.cStart = this.countdown * 60;
    this.cDur = this.duration * 60;
    this.cPost = challengelist.DUR_AFTER;

    this.startStamp = this.initStamp + (this.cStart * 1000);
    this.endStamp = this.startStamp + (this.cDur * 1000);
    this.delStamp = this.endStamp + (this.cPost * 1000);

    const dateCheck = new Date().getTime();
    if (this.startStamp < dateCheck) {
      if (this.endStamp < dateCheck) {
        if (this.delStamp < dateCheck) {
          this.state = 2;
          this.cPost = 0;
        } else {
          this.state = 2;
          this.cPost = Math.ceil((this.delStamp - dateCheck) / 1000);
        }
      } else {
        this.state = 1;
        this.cDur = Math.ceil((this.endStamp - dateCheck) / 1000);
      }
    } else {
      this.state = 0;
      this.cStart = Math.ceil((this.startStamp - dateCheck) / 1000);
    }
    if (this.state == 0 && this.cStart == this.countdown * 60) {
      if (this.countdown == 1) {
        this.channel.send('Your ' + type + ', ' + this.displayName
                    + ' (ID ' + this.objectID + '), starts in ' + this.countdown
                    + ' minute.');
      } else {
        this.channel.send('Your ' + type + ', ' + this.displayName
                    + ' (ID ' + this.objectID + '), starts in ' + this.countdown
                    + ' minutes.');
      }
    }
  }
  /** Update the challenge at each tick. */
  update() {
    switch (this.state) {
      case 0:
        this.start();
        break;
      case 1:
        this.end();
        break;
      case 2:
        this.terminate();
        break;
      default:
        this.channel.send('Error: Invalid state reached.');
        delete challengelist.challengeList[this.objectID];
        break;
    }
  }
  /** Check to see whether the countdown is over, and start the challenge
  * if so.
  */
  start() {
    if (this.cStart > 0) {
      this.cStart--;
    }
    if (this.cStart == 0) {
      this.startMsg();
    } else if (this.cStart == 60) {
      for (let i = 0; i < this.hookedChannels.length; i++) {
        const channelObject = client.channels.get(this.hookedChannels[i]);
        channelObject.send(this.displayName + ' starts in 1 minute.');
      }
    } else if (this.cStart % 300 == 0) {
      for (let i = 0; i < this.hookedChannels.length; i++) {
        const channelObject = client.channels.get(this.hookedChannels[i]);
        channelObject.send(this.displayName + ' starts in '
                    + this.cStart / 60 + ' minutes.');
      }
    } else if ([30, 10, 5].includes(this.cStart)) {
      for (let i = 0; i < this.hookedChannels.length; i++) {
        const channelObject = client.channels.get(this.hookedChannels[i]);
        channelObject.send(this.displayName + ' starts in '
                    + this.cStart + ' seconds.');
      }
    }
  }
  /** Construct the message displayed to users when a challenge begins. */
  startMsg() {
    for (let i = 0; i < this.hookedChannels.length; i++) {
      let userList = '';
      for (const user in this.joinedUsers) {
        if (this.joinedUsers[user].channelID == this.hookedChannels[i]) {
          userList += ' ' + client.users.get(user);
        }
      }
      const channelObject = client.channels.get(this.hookedChannels[i]);
      channelObject.send(this.displayName + ' (ID ' + this.objectID
                + ') starts now!' + userList);
    }
    this.state = 1;
  }
  /** Check to see whether the challenge is over, and end it if so. */
  end() {
    this.cDur--;
    if (this.cDur <= 0) {
      for (let i = 0; i < this.hookedChannels.length; i++) {
        let userList = '';
        for (const user in this.joinedUsers) {
          if (this.joinedUsers[user].channelID == this.hookedChannels[i]) {
            userList += ' ' + client.users.get(user);
          }
        }
        const channelObject = client.channels.get(this.hookedChannels[i]);
        channelObject.send(this.displayName + ' (ID ' + this.objectID
                    + ') has ended! Post your total to be '
                    + 'included in the summary.' + userList);
      }
      this.state = 2;
    } else if (this.cDur == 60) {
      for (let i = 0; i < this.hookedChannels.length; i++) {
        const channelObject = client.channels.get(this.hookedChannels[i]);
        channelObject.send('There is 1 minute remaining in '
                    + this.displayName + '.');
      }
    } else if (this.cDur % 300 == 0) {
      for (let i = 0; i < this.hookedChannels.length; i++) {
        const channelObject = client.channels.get(this.hookedChannels[i]);
        channelObject.send('There are ' + this.cDur/60
                    + ' minutes remaining in ' + this.displayName + '.');
      }
    } else if ([30, 10, 5].includes(this.cDur)) {
      for (let i = 0; i < this.hookedChannels.length; i++) {
        const channelObject = client.channels.get(this.hookedChannels[i]);
        channelObject.send('There are ' + this.cDur
                    + ' seconds remaining in ' + this.displayName + '.');
      }
    }
  }
  /** Check to see whether the total period is over, and post the summary. */
  terminate() {
    this.cPost--;
    if (this.cPost == 0) {
      for (let i = 0; i < this.hookedChannels.length; i++) {
        challengelist.generateSummary(client.channels.get(
            this.hookedChannels[i]), this.objectID);
      }
      conn.collection('challengeDB').remove(
          {_id: this.objectID}
      );
      delete challengelist.challengeList[this.objectID];
    }
  }
}

module.exports = Challenge;
