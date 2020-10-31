const Challenge = require('./challenge')
const dbc = require('../dbc.js')

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
    joined,
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
      joined,
    )
    this.goal = goal
    this.cPost = 0

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
    }
    const array = [challengeData]

    dbc.dbInsert('challengeDB', array)
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
    } else {
      this.state = 1
      this.cDur = 0
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

  /** Update the sprint at each tick. */
  update() {
    switch (this.state) {
    case 0:
      this.start()
      break
    case 1:
      this.end()
      break
    default:
      this.channel.send('**Error:** Invalid state reached.')
      this.cancel()
      break
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
    }
  }

  /** Construct the message displayed to users when a sprint begins. */
  startMsg() {
    for (let i = 0; i < this.hookedChannels.length; i++) {
      const userList = super.getUsers(this.hookedChannels[i])
      const channelObject = this.getChannel(this.hookedChannels[i])
      let timeString = 'minutes'
      if (this.duration === 1) {
        timeString = 'minute'
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
          userList,
      )
    }
    this.state = 1
  }

  /** Check to see whether the sprint is over, and post the summary if so. */
  end() {
    this.cDur--
    if (this.cDur <= 0) {
      for (const user in this.joined) {
        if (this.joined[user].timeTaken !== undefined) {
          const data = {$inc: {lifetimeSprintWords: parseInt(this.goal),
            lifetimeSprintMinutes: this.joined[user].timeTaken}}
          dbc.dbUpdate('userDB', {_id: user}, data)
        }
      }
      super.terminate()
    } else if (this.cDur === 60) {
      super.buildMsg(
        'There is 1 minute remaining in ' + this.displayName + '.',
      )
    } else if (this.cDur % 300 === 0) {
      super.buildMsg(
        'There are ' + this.cDur / 60 + ' minutes remaining in ' +
          this.displayName + '.',
      )
    } else if ([30, 10, 5].includes(this.cDur)) {
      super.buildMsg(
        'There are ' + this.cDur + ' seconds remaining in ' +
          this.displayName + '.',
      )
    }
  }

  /** Prints statistics for a challenge.
   * @param {String} channel - Channel to print to.
   * @return {String} - Return message.
   */
  stats(channel) {
    let returnMsg = ''
    if (this.state === 1) {
      const serverTotals = this.serverTotals()
      const summaryServer = this.getChannel(channel).guild
      returnMsg += this.challengeByUser(summaryServer)
      if (Object.keys(serverTotals).length > 1) {
        returnMsg += '\n'
      }
      for (const server in serverTotals) {
        if (serverTotals.hasOwnProperty(server)) {
          returnMsg += this.serverText(server, serverTotals)
        }
      }
    } else {
      returnMsg = 'This sprint has not started yet.'
    }
    if (returnMsg === '') {
      returnMsg = 'Nobody has finished this sprint yet.'
    }
    return super.stats() + returnMsg
  }

  /**
   * Summarises all totals for a given server.
   * @param {String} summaryServer - The server being summarised.
   * @return {String} - The message to send to the user.
   */
  challengeByUser(summaryServer) {
    let userTotals = ''
    for (const user in this.joined) {
      if (this.joined.hasOwnProperty(user)) {
        const count = this.goal
        const time = this.joined[user].timeTaken
        if (time !== undefined && this.channel.guild.id === summaryServer.id) {
          userTotals += client.users.get(user) + ': ' +
            this.userTotals(time, count)
        }
      }
    }
    return userTotals
  }

  /**
   * Produces a per-server breakdown of user-entered totals for a sprint.
   * @param {String} challengeID - Unique ID of the challenge being summarised.
   * @return {String} - The message to send to the user.
   */
  serverTotals() {
    let sprintTotals = {}
    for (const user in this.joined) {
      if (this.joined[user].timeTaken !== undefined) {
        const homeServer =
          this.getChannel(this.joined[user].channelID).guild.id
        sprintTotals = this.addToAggregate(sprintTotals, homeServer)
        sprintTotals[homeServer][0] += this.joined[user].timeTaken
        sprintTotals[homeServer][1] += this.goal
      }
    }
    return sprintTotals
  }

  /**
   * Displays sprint totals in a human-readable format.
   * @param {String} server - Snowflake of the server being posted to.
   * @param {Object} serverTotals - Summary of user-entered totals by server.
   * @return {String} - The message to send to the user.
   */
  serverText(server, serverTotals) {
    let sprintText = '__' + client.guilds.get(server).name + '__:'
    sprintText += ' **' + serverTotals[server][0].toFixed(2) + '** minute'
    if (serverTotals[server][0] !== 1) {
      sprintText += 's'
    }
    sprintText += ' (**' + (
      serverTotals[server][1]/
      serverTotals[server][0]).toFixed(2) +
      '** wpm)\n'
    return sprintText
  }

  /**
   * Adds an object to an aggregate list of totals.
   * @param {Object} serverList - The object to add to.
   * @param {String} server - The object to add.
   * @return {String} - The relevant server.
   */
  addToAggregate(serverList, server) {
    if (serverList[server] === undefined) {
      serverList[server] = [0, 0]
    }
    return serverList
  }

  /**
   * Summarises a user's total.
   * @param {Number} time - The user's completion time.
   * @param {Number} goal - The sprint's word goal.
   * @return {String} - The message to send to the user.
   */
  userTotals(time, goal) {
    const userTotal = '**' + time.toFixed(2) + '** minutes (**' +
      (goal/time).toFixed(2) + '** wpm)\n'
    return userTotal
  }
}

module.exports = Sprint
