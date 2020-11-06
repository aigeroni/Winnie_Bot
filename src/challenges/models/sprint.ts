import Challenge from './challenge'
import ChallengeStates from './challenge-states'
import ChallengeTypes from './challenge-types'
import { Client, Guild, Snowflake } from 'discord.js'
import { SprintUser } from './challenge-user'

// const dbc = require('../dbc.js');

declare let client: Client

/**
 * Represents a sprint.
 */
export default class Sprint extends Challenge {
  /**
   * The goal, in number of words, of the sprint.
   */
  goal: number

  /**
   * Create a chain war.
   *
   * @param objectID - The unique ID of the sprint.
   * @param creator - The Discord ID of the creator.
   * @param displayName - The name of the sprint.
   * @param initStamp - UNIX timestamp of creation time.
   * @param countdown - Time in minutes from creation to start.
   * @param goal - The goal, in words, of the sprint.
   * @param duration - Duration in minutes.
   * @param channel - Discord ID of start channel.
   * @param hidden - Flag for whether challenge is visible to users on other servers.
   * @param hookedChannels - A list of channels that have joined the sprint.
   * @param joined - A list of users who have joined the sprint.
   */
  constructor(
    objectID: number,
    creator: Snowflake,
    displayName: string,
    initStamp: number,
    countdown: number,
    goal: number,
    duration: number,
    channel: Snowflake,
    hidden: boolean,
    hookedChannels: Array<Snowflake>,
    joined: Record<Snowflake, SprintUser>,
  ) {
    super(
      objectID,
      creator,
      displayName,
      initStamp,
      countdown,
      duration,
      channel,
      ChallengeTypes.SPRINT,
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
      channel: this.channel.id,
      hookedChannels: this.hookedChannels,
      joined: this.joined,
      state: this.state,
      type: ChallengeTypes.SPRINT,
      hidden: this.hidden,
    }
    const array = [challengeData]

    dbc.dbInsert('challengeDB', array)
  }

  /**
   * Starts a challenge.
   */
  init(): void {
    const currentTime = new Date().getTime()
    if (!(this.startStamp < currentTime)) {
      this.state = ChallengeStates.SCHEDULED
      this.cStart = Math.ceil((this.startStamp - currentTime) / 1000)
    } else if (!(this.endStamp < currentTime)) {
      this.state = ChallengeStates.IN_PROGRESS
      this.cDur = Math.ceil((this.endStamp - currentTime) / 1000)
    } else {
      this.state = ChallengeStates.IN_PROGRESS
      this.cDur = 0
    }

    if (this.state === ChallengeStates.SCHEDULED && this.cStart === this.countdown * 60) {
      const timeString = this.countdown === 1 ? 'minute' : 'minutes'
      const message = `Your ${this.type}, ${this.displayName} (ID ${this.objectID}), starts in ${this.countdown} ${timeString}`

      this.buildMessage(message)
    }
  }

  /**
   * Update the sprint at each tick.
   */
  async update(): Promise<void> {
    switch (this.state) {
    case 0:
      this.start()
      break
    case 1:
      this.end()
      break
    default:
      this.channel.send('**Error:** Invalid state reached.')
      await this.cancel()
      break
    }
  }

  /**
   * Builds user data for the challenge database.
   *
   * @param channel - The channel from which the user joined.
   * @param timestamp - The time at which the user finished the sprint.
   * @param minutes - The time taken to complete the sprint.
   * @return JSON object representing the total.
   */
  buildUserData(channel: Snowflake, timestamp: number, minutes: number): SprintUser {
    return {
      timestampCalled: timestamp,
      timeTaken: minutes,
      channelID: channel,
    }
  }

  /**
   * send the message displayed to users when a sprint begins.
   */
  startMessage(): void {
    const timeString = this.duration === 1 ? 'minute' : 'minutes'
    const message = `${this.displayName} (ID ${this.objectID}, ${this.duration}) ${timeString}) starts now! Race to ${this.goal} words!`

    this.hookedChannels.forEach((channelID) => {
      const userList = super.getUsers(channelID)
      const channelObject = this.getChannel(channelID)

      channelObject.send(`${message} ${userList}`)
    })
  }

  /**
   * Check to see whether the sprint is over, and post the summary if so.
   */
  end(): void {
    this.cDur--

    if (this.cDur <= 0) {
      Object.entries(this.joined).forEach(([userID, joinedUser]) => {
        const sprintUser = joinedUser as SprintUser

        if (sprintUser.timeTaken) {
          const data = {
            $inc: {
              lifetimeSprintWords: this.goal,
              lifetimeSprintMinutes: sprintUser.timeTaken,
            },
          }
          dbc.dbUpdate('userDB', {_id: userID}, data)
        }
      })
      this.terminate()
    } else if (this.cDur === 60) {
      this.buildMessage(`There is 1 minute remaining in ${this.displayName}.`)
    } else if (this.cDur % 300 === 0) {
      this.buildMessage(`There are ${this.cDur / 60} minutes remaining in ${this.displayName}.`)
    } else if ([30, 10, 5].includes(this.cDur)) {
      this.buildMessage(`There are ${this.cDur} seconds remaining in ${this.displayName}.`)
    }
  }

  /**
   * Prints statistics for a challenge.
   *
   * @param channel - Channel to print to.
   * @return Return message.
   */
  stats(channel: Snowflake): string {
    let returnMessage = `***Statistics for ${this.displayName}:***\n\n`
    if (this.state === ChallengeStates.IN_PROGRESS) {
      const serverTotals = this.serverTotals()
      const summaryServer = this.getChannel(channel).guild
      returnMessage += this.challengeByUser(summaryServer)
      if (Object.keys(serverTotals).length > 1) {
        returnMessage += '\n'
      }
      for (const server in serverTotals) {
        if (serverTotals[server]) {
          returnMessage += this.serverText(server, serverTotals)
        }
      }
    } else {
      returnMessage = 'This sprint has not started yet.'
    }
    if (returnMessage === '') {
      returnMessage = 'Nobody has finished this sprint yet.'
    }
    return returnMessage
  }

  /**
   * Summarises all totals for a given server.
   *
   * @param summaryServer - The server being summarised.
   * @return The message to send to the user.
   */
  challengeByUser(summaryServer: Guild): string {
    return Object.entries(this.joined).reduce((userTotals, [userID, joinedUser]) => {
      const sprintUser = joinedUser as SprintUser

      const count = this.goal
      const time = sprintUser.timeTaken

      if (!!time && this.channel.guild.id === summaryServer.id) {
        userTotals += `${client.users.get(userID)}: ${this.userTotals(time, count)}`
      }

      return userTotals
    }, '')
  }

  /**
   * Produces a per-server breakdown of user-entered totals for a sprint.
   * @param challengeID - Unique ID of the challenge being summarised.
   * @return The message to send to the user.
   */
  serverTotals(): Record<Snowflake, Array<number>> {
    return Object.values(this.joined).reduce((sprintTotals: Record<Snowflake, Array<number>>, joinedUser) => {
      const sprintUser = joinedUser as SprintUser
      const homeServerID = this.getChannel(joinedUser.channelID).guild.id

      sprintTotals = this.addToAggregate(sprintTotals, homeServerID)
      sprintTotals[homeServerID][0] += sprintUser.timeTaken
      sprintTotals[homeServerID][1] += this.goal

      return sprintTotals
    }, {})
  }

  /**
   * Displays sprint totals in a human-readable format.
   *
   * @param server - Snowflake of the server being posted to.
   * @param serverTotals - Summary of user-entered totals by server.
   * @return The message to send to the user.
   */
  serverText(server: Snowflake, serverTotals: Record<Snowflake, Array<number>>): string {
    let sprintText = '__' + client.guilds.get(server)?.name + '__:'
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
   *
   * @param serverList - The object to add to.
   * @param server - The object to add.
   * @return The relevant server.
   */
  addToAggregate(serverList: Record<Snowflake, Array<number>>, serverID: Snowflake): Record<Snowflake, Array<number>> {
    if (!serverList[serverID]) {
      serverList[serverID] = [0, 0]
    }
    return serverList
  }

  /**
   * Summarises a user's total.
   *
   * @param time - The user's completion time.
   * @param goal - The sprint's word goal.
   * @return The message to send to the user.
   */
  userTotals(time: number, goal: number): string {
    return `**${time.toFixed(2)}** minutes (**${(goal/time).toFixed(2)}** wpm)\n`
  }
}
