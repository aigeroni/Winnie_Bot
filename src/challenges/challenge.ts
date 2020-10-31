import ChallengeStates from './challenge-states'
import ChallengeTypes from './challenge-types'
import { ChallengeUser } from './challenge-user'
import { Client, Snowflake, TextChannel, User } from 'discord.js'

// const clist = require('./clist.js')
// const config = require('../../config.json')
// const dbc = require('../dbc.js')

declare let client: Client

/**
 * Represents a challenge.
 */
export default abstract class Challenge {

  /**
   * The duration of the challenge, in seconds
   */
  protected cDur: number

  /**
   * The start channel
   */
  readonly channel: TextChannel

  /**
   * Time, in minutes, from challenge creation to challenge start
   */
  readonly countdown: number

  /**
   * Time, in seconds, between when the challenge ends and when the summary message is posted
   */
  protected cPost: number

  /**
   * The Snowflake (Discord ID) of the challenge creator
   */
  readonly creator: Snowflake

  /**
   * Time, is seconds, between challenge creation and challenge start
   */
  protected cStart: number

  /**
   * The UNIX timestamp at which this challenge deleted
   */
  readonly delStamp: number

  /**
   * The name of the challenge
   */
  readonly displayName: string

  /**
   * The duration of the challenge, in minutes
   */
  readonly duration: number

  /**
   * The UNIX timestamp at which this challenge ended
   */
  readonly endStamp: number

  /**
   * Whether or not this challenge is visable to users in other guilds
   */
  readonly hidden: boolean

  /**
   * A list of Snowflakes (Discord IDs) of channels that have joined the challenge
   */
  readonly hookedChannels: Array<Snowflake>

  /**
   * The UNIX timestamp at which this challenge was created
   */
  readonly initStamp: number

  /**
   * A Collection of users that have joined the challenge.
   *
   * The keys are the snowflakes of the users that have joined.
   * The values are JoinedUser objects that contain information about the user.
   */
  readonly joined: Record<Snowflake, ChallengeUser>

  /**
   * The ID of this challenge
   */
  readonly objectID: number

  /**
   * The UNIX timestamp at which this challenge started
   */
  readonly startStamp: number

  /**
   * The current start of the challenge
   */
  protected state: ChallengeStates

  /**
   * The type of challenge
   */
  readonly type: ChallengeTypes

  /**
   * Create a challenge.
   *
   * @param objectID - The unique ID of the challenge.
   * @param creator - The Discord ID of the creator.
   * @param displayName - The name of the challenge.
   * @param initStamp - UNIX timestamp of creation time.
   * @param countdown - Time in minutes from creation to start.
   * @param duration - Duration in minutes.
   * @param channel - Discord ID of start channel.
   * @param type - The type of challenge that this object represents.
   * @param hidden - Flag for whether challenge is visible to users on other servers.
   * @param hookedChannels - A list of channels that have joined the challenge.
   * @param joined - A list of users who have joined the challenge.
   */
  constructor(
    objectID: number,
    creator: Snowflake,
    displayName: string,
    initStamp: number,
    countdown: number,
    duration: number,
    channel: Snowflake,
    type: ChallengeTypes,
    hidden: boolean,
    hookedChannels: Array<Snowflake>,
    joined: Record<Snowflake, ChallengeUser>,
  ) {
    this.objectID = objectID
    this.creator = creator
    this.displayName = displayName
    this.initStamp = initStamp
    this.countdown = countdown
    this.duration = duration
    this.channel = this.getChannel(channel)
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
    } else if (!(this.delStamp < currentTime)) {
      this.state = ChallengeStates.ENDED
      this.cPost = Math.ceil((this.delStamp - currentTime) / 1000)
    } else {
      this.state = ChallengeStates.ENDED
      this.cPost = 0
    }

    if (this.state === ChallengeStates.SCHEDULED && this.cStart === this.countdown * 60) {
      const timeString = this.countdown === 1 ? 'minute' : 'minutes'
      const message = `Your ${this.type}, ${this.displayName} (ID ${this.objectID}), starts in ${this.countdown} ${timeString}`

      this.buildMessage(message)
    }
  }

  /**
   * Update the challenge at each tick.
   */
  async update(): Promise<void> {
    switch (this.state) {
    case 0:
      this.start()
      break
    case 1:
      this.end()
      break
    case 2:
      await this.terminate()
      break
    default:
      this.channel.send('**Error:** Invalid state reached.')
      await this.cancel()
      break
    }
  }

  /**
   * Check to see whether the countdown is over, and start the challenge if so.
   */
  start(): void {
    if (this.cStart > 0) { this.cStart-- }

    if (this.cStart === 0) {
      this.startMessage()
      this.state = ChallengeStates.IN_PROGRESS
    } else if (this.cStart === 60) {
      this.buildMessage(`${this.displayName} starts in 1 minute.`)
    } else if (this.cStart % 300 === 0) {
      this.buildMessage(`${this.displayName} starts in ${this.cStart / 60} minutes.`)
    } else if ([30, 10, 5].includes(this.cStart)) {
      this.buildMessage(`${this.displayName} starts in ${this.cStart} seconds.`)
    }
  }

  /**
   * Check to see whether the challenge is over, and end it if so.
   */
  end(): void{
    this.cDur--

    if (this.cDur <= 0) {
      this.endMessage()
      this.state = 2
    } else if (this.cDur === 60) {
      this.buildMessage(`There is 1 minute remaining in ${this.displayName}.`)
    } else if (this.cDur % 300 === 0) {
      this.buildMessage(`There are ${this.cDur / 60} minutes remaining in ${this.displayName}.`)
    } else if ([30, 10, 5].includes(this.cDur)) {
      this.buildMessage(`There are ${this.cDur} seconds remaining in ${this.displayName}.`)
    }
  }

  /**
   * Check to see whether the total period is over, and post the summary.
   */
  async terminate(): Promise<void> {
    this.cPost--
    if (this.cPost > 0) { return }

    await dbc.dbRemove('challengeDB', { _id: this.objectID })
    clist.running.splice(clist.running.indexOf(this.objectID), 1)

    this.hookedChannels.forEach((channelID) => {
      const stats = this.stats(channelID)
      this.getChannel(channelID).send(stats)
    })
  }

  /**
   * Cancels the challenge.
   */
  async cancel(): Promise<void> {
    await dbc.dbRemove('challengeDB', {_id: this.objectID})
    clist.running.splice(clist.running.indexOf(this.objectID), 1)

    const message = `${this.displayName} (ID ${this.objectID}) has been cancelled.`
    this.hookedChannels.forEach((channelID) => {
      this.getChannel(channelID).send(`${message} ${this.getUsers(channelID)}`)
    })
  }

  /**
   * Adds a user to a challenge.
   *
   * @param {User} user - The User to add.
   * @param {String} channelID - The id of the channel from which the user joined.
   * @return {String} - Message to display to the user.
   */
  async join(user: User, channelID: Snowflake): Promise<string> {
    if (user.id in this.joined) {
      return `${user}, you already have notifications enabled for this challenge.`
    } else {
      await this.submitUserData(user.id, channelID)
      return `${user}, you have joined ${this.displayName}`
    }
  }

  /**
   * Remove a user from a challenge.
   *
   * @param user - The User to remove.
   * @param channelID - The id of the channel from which the user joined.
   * @return Message to display to the user.
   */
  async leave(user: User): Promise<string> {
    const joinedUser = this.joined[user.id]

    if (joinedUser === undefined) {
      return `${user}, you have not yet joined this challenge.`
    } else {
      delete this.joined[user.id]
      const dbData = {
        $set: {
          hookedChannels: this.hookedChannels,
          joined: this.joined,
        },
      }
      await dbc.dbUpdate('challengeDB', { _id: this.objectID }, dbData)
      return `${user}, you have left ${this.displayName}`
    }
  }

  /**
   * Construct the message displayed to users when a challenge begins.
   */
  startMessage(): void {
    this.hookedChannels.forEach((channelID) => {
      const userList = this.getUsers(channelID)
      const timeString = this.countdown === 1 ? 'minute' : 'minutes'
      const message = `${this.displayName} (ID ${this.objectID}, ${this.duration} ${timeString}) starts now`

      this.sendMessage(`${message} ${userList}`, channelID)
    })
  }

  /**
   * Sends the messages displayed to users when a challenge ends.
   */
  endMessage(): void {
    this.hookedChannels.forEach((channelID) => {
      const userList = this.getUsers(channelID)
      const channel = this.getChannel(channelID)

      let prefix = config.cmd_prefix['default']
      if (config.cmd_prefix[channel.guild.id]) {
        prefix = config.cmd_prefix[channel.guild.id]
      }

      const endedMessage = `${this.displayName} (ID ${this.objectID}) has ended!`
      const totalMessage = `Post your total using \`${prefix}total ${this.objectID} <total>\` to be included in the summary.`

      this.sendMessage(`${endedMessage} ${totalMessage} ${userList}`, channelID)
    })
  }

  /**
   * Prints statistics for a challenge.
   *
   * @param channel - Channel to print to.
   * @return Return message.
   */
  abstract stats(channel: Snowflake): string

  /**
   * Get all users hooked from a channel.
   *
   * @param channel - The Discord ID of the channel.
   * @return A list of user snowflakes.
   */
  getUsers(channelID: Snowflake): string {
    let userList = ''
    for (const user in this.joined) {
      if (this.joined[user].channelID === channelID) {
        userList += ' ' + client.users.get(user)
      }
    }
    return userList
  }

  /**
   * Builds user data for the challenge database.
   *
   * @param userID - The id of the user to build for.
   * @param channelID - The is of the channel from which the user joined.
   * @return Promise object.
   */
  async submitUserData(userID: Snowflake, channelID: Snowflake): Promise<void> {
    this.joined[userID] = this.buildUserData(channelID)
    if (this.hookedChannels.indexOf(channelID) < 0) {
      this.hookedChannels.push(channelID)
    }
    const dbData = {
      $set: {
        hookedChannels: this.hookedChannels,
        joined: this.joined,
      },
    }
    await dbc.dbUpdate('challengeDB', {_id: this.objectID}, dbData)
  }

  /**
   * Builds user data for the challenge database.
   *
   * @param channel - The channel from which the user joined.
   * @param _param1 - Needed to allow subclasses to have more params.
   *   When the challenge type is sprint, this value is `timestamp`
   *     The time at which the user finished the sprint.
   *   When the challenge type is war or chain war, this value is `total`
   *     The total posted by the user.
   * @param _param2 - Needed to allow subclasses to have more params.
   *  When the challenge type is sprint, this value is a number `minutes`
   *     The time taken to complete the sprint.
   *   When the challenge type is war or chain war, this value is a string `type`
   *     The type of the total.
   * @return The user data
   */
  buildUserData(channel: Snowflake, _param1?: number, _param2?: number | string): ChallengeUser { // eslint-disable-line @typescript-eslint/no-unused-vars
    return {
      channelID: channel,
    }
  }

  /**
   * Builds a message to send to all hooked channels.
   *
   * @param message - The message to send.
   */
  buildMessage(message: string): void {
    this.hookedChannels.forEach((channelID) => this.sendMessage(message, channelID))
  }

  /**
   * Sends a message.
   *
   * @param message - The message to send.
   * @param channelID - The ID of the channel to send the message to.
   */
  sendMessage(message: string, channelID: Snowflake): void {
    this.getChannel(channelID).send(message)
  }

  /**
   * Gets a channel object from its ID.
   *
   * @param channelID - The channel to get.
   * @return The channel snowflake.
   */
  getChannel(channelID: Snowflake): TextChannel {
    return client.channels.get(channelID) as TextChannel
  }
}
