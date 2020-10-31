const clist = require('./clist.js')
const config = require('../../config.json')
const dbc = require('../dbc.js')

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
   * @param {Array} hookedChannels - A list of channels that have joined the
   *  challenge.
   * @param {Object} joined - A list of users who have joined the
   *  challenge.
   */
  constructor(
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
    joined,
  ) {
    this.objectID = objectID
    this.creator = creator
    this.displayName = displayName
    this.initStamp = initStamp
    this.countdown = countdown
    this.duration = duration
    this.channelID = channel
    this.channel = this.getChannel(this.channelID)
    this.type = type
    this.joined = joined
    this.hookedChannels = hookedChannels
    this.state = 0
    this.hidden = hidden

    this.cStart = this.countdown * 60
    this.cDur = this.duration * 60
    this.cPost = clist.DUR_AFTER

    this.startStamp = this.initStamp + this.cStart * 1000
    this.endStamp = this.startStamp + this.cDur * 1000
    this.delStamp = this.endStamp + this.cPost * 1000

    this.init()
  }

  /** Starts a challenge. */
  init() {
    const dateCheck = new Date().getTime()
    if (!(this.startStamp < dateCheck)) {
      this.state = 0
      this.cStart = Math.ceil((this.startStamp - dateCheck) / 1000)
    } else if (!(this.endStamp < dateCheck)) {
      this.state = 1
      this.cDur = Math.ceil((this.endStamp - dateCheck) / 1000)
    } else if (!(this.delStamp < dateCheck)) {
      this.state = 2
      this.cPost = Math.ceil((this.delStamp - dateCheck) / 1000)
    } else {
      this.state = 2
      this.cPost = 0
    }
    if (this.state === 0 && this.cStart === this.countdown * 60) {
      let time = 'minute'
      if (this.countdown !== 1) {
        time += 's'
      }
      this.buildMsg(
        'Your ' + this.type + ', ' + this.displayName + ' (ID ' +
          this.objectID + '), starts in ' + this.countdown + ' ' + time + '.',
      )
    }
  }

  /** Update the challenge at each tick. */
  update() {
    switch (this.state) {
    case 0:
      this.start()
      break
    case 1:
      this.end()
      break
    case 2:
      this.terminate()
      break
    default:
      this.channel.send('**Error:** Invalid state reached.')
      this.cancel()
      break
    }
  }

  /** Adds a user to a challenge.
   * @param {String} user - The ID of the user to add.
   * @param {String} channelID - The channel from which the user joined.
   * @return {String} - Message to display to the user.
   */
  async join(user, channelID) {
    let returnMsg = ''
    if (user.id in this.joined) {
      returnMsg = user +
        ', you already have notifications enabled for this challenge.'
    } else {
      await this.submitUserData(user.id, channelID, undefined, undefined)
      returnMsg = user + ', you have joined ' + this.displayName
    }
    return returnMsg
  }

  /** Remove a user from a challenge.
   * @param {String} user - The ID of the user to remove.
   * @param {String} channelID - The channel from which the user joined.
   * @return {String} - Message to display to the user.
   */
  async leave(user) {
    let returnMsg = ''
    if (!(user.id in this.joined)) {
      returnMsg = user + ', you have not yet joined this challenge.'
    } else {
      delete this.joined[user.id]
      const dbData =
        {$set: {hookedChannels: this.hookedChannels, joined: this.joined}}
      await dbc.dbUpdate('challengeDB', {_id: this.objectID}, dbData)
      returnMsg = user + ', you have left ' + this.displayName
    }
    return returnMsg
  }

  /** Cancels a challenge.
   * @return {String} - Return message.
   */
  async cancel() {
    await dbc.dbRemove('challengeDB', {_id: this.objectID})
    delete clist.running[this.objectID]
    const returnMsg = this.displayName + ' (ID ' +
      this.objectID + ') has been cancelled. '
    for (let i = 0; i < this.hookedChannels.length; i++) {
      client.channels.get(this.hookedChannels[i]).send(returnMsg +
        this.getUsers(this.hookedChannels[i]))
    }
    return returnMsg
  }

  /**
   * Builds user data for the challenge database.
   * @param {String} user - The user to build for.
   * @param {String} channel - The channel from which the user joined.
   * @param {String} param1 - The first join parameter.
   * @param {String} param2 - The second join parameter.
   * @return {Promise} - Promise object.
   */
  async submitUserData(user, channel, param1, param2) {
    this.joined[user] = this.buildUserData(channel, param1, param2)
    if (this.hookedChannels.indexOf(channel) === -1) {
      this.hookedChannels.push(channel)
    }
    const dbData =
      {$set: {hookedChannels: this.hookedChannels, joined: this.joined}}
    await dbc.dbUpdate('challengeDB', {_id: this.objectID}, dbData)
  }

  /**
   * Builds user data for the challenge database.
   * @param {String} channel - The channel from which the user joined.
   * @return {Promise} - Promise object.
   */
  buildUserData(channel) {
    return {channelID: channel}
  }

  /** Check to see whether the countdown is over, and start the challenge
   * if so.
   */
  start() {
    if (this.cStart > 0) {
      this.cStart--
    }
    if (this.cStart === 0) {
      this.startMsg()
    } else if (this.cStart === 60) {
      this.buildMsg(this.displayName + ' starts in 1 minute.')
    } else if (this.cStart % 300 === 0) {
      this.buildMsg(
        this.displayName + ' starts in ' + this.cStart / 60 + ' minutes.',
      )
    } else if ([30, 10, 5].includes(this.cStart)) {
      this.buildMsg(
        this.displayName + ' starts in ' + this.cStart + ' seconds.',
      )
    }
  }

  /** Construct the message displayed to users when a challenge begins. */
  startMsg() {
    for (let i = 0; i < this.hookedChannels.length; i++) {
      const userList = this.getUsers(this.hookedChannels[i])
      let timeString = 'minute'
      if (this.duration !== 1) {
        timeString += 's'
      }
      this.sendMsg(
        this.displayName + ' (ID ' + this.objectID + ', ' + this.duration +
          ' ' + timeString + ') starts now!'+ userList, this.hookedChannels[i],
      )
    }
    this.state = 1
  }

  /** Check to see whether the challenge is over, and end it if so. */
  end() {
    this.cDur--
    if (this.cDur <= 0) {
      for (let i = 0; i < this.hookedChannels.length; i++) {
        const userList = this.getUsers(this.hookedChannels[i])
        const channelObject = this.getChannel(this.hookedChannels[i])
        let prefix = config.cmd_prefix['default']
        if (config.cmd_prefix[channelObject.guild.id]) {
          prefix = config.cmd_prefix[channelObject.guild.id]
        }
        channelObject.send(
          this.displayName + ' (ID ' + this.objectID +
            ') has ended! Post your total using `' + prefix + 'total ' +
            this.objectID + ' <total>` to be included in the summary.' +
            userList,
        )
      }
      this.state = 2
    } else if (this.cDur === 60) {
      this.buildMsg('There is 1 minute remaining in ' + this.displayName + '.')
    } else if (this.cDur % 300 === 0) {
      this.buildMsg(
        'There are ' + this.cDur / 60 + ' minutes remaining in ' +
          this.displayName + '.',
      )
    } else if ([30, 10, 5].includes(this.cDur)) {
      this.buildMsg(
        'There are ' + this.cDur + ' seconds remaining in ' +
          this.displayName + '.',
      )
    }
  }

  /** Check to see whether the total period is over, and post the summary. */
  terminate() {
    this.cPost--
    if (this.cPost <= 0) {
      for (let i = 0; i < this.hookedChannels.length; i++) {
        this.getChannel(this.hookedChannels[i]).send(
          this.stats(this.hookedChannels[i]))
      }
      dbc.dbRemove('challengeDB', {_id: this.objectID})
      delete clist.running[this.objectID]
    }
  }

  /** Prints statistics for a challenge.
   * @param {String} channel - Channel to print to.
   * @return {String} - Return message.
   */
  stats(channel) {
    return '***Statistics for ' + this.displayName + ':***\n\n'
  }

  /** Get all users hooked from a channel.
   * @param {String} channel - The Discord ID of the channel.
   * @return {String} - A list of user snowflakes.
   */
  getUsers(channel) {
    let userList = ''
    for (const user in this.joined) {
      if (this.joined[user].channelID === channel) {
        userList += ' ' + client.users.get(user)
      }
    }
    return userList
  }

  /** Builds a message to send to all hooked channels.
   * @param {String} msg - The message to send.
   */
  buildMsg(msg) {
    for (let i = 0; i < this.hookedChannels.length; i++) {
      this.sendMsg(msg, this.hookedChannels[i])
    }
  }

  /** Sends a message.
   * @param {String} msg - The message to send.
   * @param {String} channelID - The ID of the channel to send the message to.
   */
  sendMsg(msg, channelID) {
    this.getChannel(channelID).send(msg)
  }

  /**
   * Gets a channel object from its ID.
   * @param {String} channel - The channel to get.
   * @return {String} - The channel snowflake.
   */
  getChannel(channel) {
    return client.channels.get(channel)
  }
}

module.exports = Challenge
