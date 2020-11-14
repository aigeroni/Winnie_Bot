// const dbc = require('../dbc.js')
// const config = require('../../config.json')

import ChainWar from './models/chainwar'
import ChallengeStates from './models/challenge-states'
import ChallengeTypes from './models/challenge-types'
import Sprint from './models/sprint'
import War from './models/war'
import { Client, Collection, GuildChannel, Message, Snowflake, User } from 'discord.js'

declare const client: Client

enum FieldOptions {
  X_STATUS = 'Cross-Server Display',
  AUTO_STATUS = 'Automatic Summaries',
  PREFIX = 'Prefix',
  ANNOUNCE = 'Announcements Channel',
}

/**
 * Information required for challenge creation and summary display.
 */
class ChallengeCache {
  /**
   * Cache of current running challenges
   */
  running: Collection<number, War | ChainWar | Sprint> = new Collection()

  /**
   * A collection of guild IDs and the IDs of the channel in those guilds
   * in which announcements should be posted.
   */
  announceChannel: Collection<Snowflake, Snowflake> = new Collection()

  /**
   * Returns the next available index for use as a challenge ID.
   *
   * @return the next available index
   */
  nextIndex(): number {
    return this.running.size
  }

  /**
   * Adds a new challenge to the list of running challenges
   *
   * @param challenge The challenge to add
   */
  add(challenge: War | ChainWar | Sprint): void {
    this.running.set(challenge.objectID, challenge)
  }

  /**
   * Gets the challenge with a given id
   *
   * @param challengeID - the ID of the challenge to get.
   * @returns the challenge
   */
  getRunning(challengeID: string): War | ChainWar | Sprint | undefined {
    return this.running.get(parseInt(challengeID))
  }

  /**
   * Check to see whether a challenge is hidden from a server.
   *
   * @param challengeID - The ID of the challenge to check.
   * @param guildID - The ID of the server to check against.
   * @return User data.
   */
  hiddenCheck(challengeID: number, guildID: Snowflake): boolean {
    const challenge = this.running.get(challengeID)
    if (!challenge) { return false }

    return challenge.hidden && challenge.channel.guild.id !== guildID
  }

  /**
   * Lists all running challenges.
   *
   * @param message - The message that ran this function.
   * @return The message to send to the user.
   */
  listChallenges(message: Message) {
    let nonHiddenTotal = 0
    let listData = ''

    this.running.forEach((challenge, id) => {
      const hidden = this.hiddenCheck(id, message.guild.id)

      if (hidden) {
        const guildName = challenge.channel.guild.name
        listData += this.buildChallengeData(id, guildName)
        nonHiddenTotal++
      }
    })

    let listMessage = ''
    if (nonHiddenTotal === 0) {
      listMessage = 'There are no challenges running. Why don\'t you start one?'
    } else if (nonHiddenTotal === 1) {
      listMessage = `There is ${nonHiddenTotal} challenge running:\n`
    } else {
      listMessage = `There are ${nonHiddenTotal} challenges running:\n`
    }
    listMessage += listData

    return listMessage
  }

  /**
   * Builds challenge data for display.
   *
   * @param challengeID - The challenge to build.
   * @param string guildName - Display name of the challenge's home server.
   * @return The message to send to the user.
   */
  buildChallengeData(challengeID: number, guildName: string): string {
    const challenge = this.running.get(challengeID)
    if (!challenge) { return '' }

    let dataString = ''
    let timeData = ''
    let timeVar

    switch (challenge.state) {
    case ChallengeStates.SCHEDULED:
      timeVar = challenge.cStart
      timeData = 'starts in %m:%s'
      break
    case ChallengeStates.IN_PROGRESS:
      timeVar = challenge.cDur
      timeData = '%m:%s remaining'
      break
    default:
      timeData = 'ended'
      break
    }

    dataString += `${challengeID}: ${challenge.displayName} (`

    if (challenge.type === ChallengeTypes.SPRINT) {
      const sprint = challenge as Sprint
      dataString += sprint.goal + ' words, '
    }

    dataString += `${challenge.duration} minutes, ${this.buildDataString(timeData, timeVar)}), ${guildName}\n`
    return dataString
  }

  /**
   * Builds a string with information about a challenge.
   *
   * @param timeData - Text describing the challenge.
   * @param timeVar - Time remaining in the challenge.
   * @return The message to send to the user.
   */
  buildDataString(timeData: string, timeVar?: number): string {
    if (!timeVar) { return `${timeData}` }

    const minutesRemaining = Math.floor(timeVar / 60)
    const secondsRemaining = timeVar % 60
    const seconds = secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining.toString()

    return timeData.replace(/%m/, minutesRemaining.toString()).replace(/%s/, seconds)
  }

  /**
   * Toggles cross-server display and auto-summary flags.
   *
   * @param message - The message that ran this function.
   * @param suffix - Information after the bot command.
   * @param flagType - The field to update.
   * @return The message to send to the user.
   */
  async updateFlags(message: Message, suffix: string, flagType: string): Promise<string> {
    let returnMessage = ''
    const args = suffix.split(' ')
    if (suffix === '') { // user checking own status
      returnMessage = await this.checkStatus(message.author, flagType)
    } else if (args[0] === 'server') { // server status
      returnMessage = await this.statusForServer(message, flagType, args[1])
    } else { // user updating own status
      returnMessage = await this.updateStatus(
        message.author, 'userDB', message.author.id, flagType, args[0],
      )
    }
    return returnMessage
  }

  /**
   * Checks the status of user-entered flags.
   *
   * @param author - The user to check the flags of.
   * @param field - The field to check.
   * @return Message to send to user.
   */
  async checkStatus(author: User, field: string): Promise<string> {
    let returnMessage = ''
    const user = await dbc.dbFind('userDB', { _id: author.id })
    const type = user[field] === 'off' ? 'off' : 'on'

    returnMessage += `${author}, you currently have `
    if (field === 'autoStatus') {
      returnMessage += 'automatic summaries'
    } else if (field === 'xStatus') {
      returnMessage += 'cross-server display'
    }
    returnMessage += ` for your challenges **${type}**.`
    return returnMessage
  }

  /**
   * Checks the status of flags for a server.
   *
   * @param message - The message that initiated the check.
   * @param field - The field to check.
   * @param update - Information to update field with.
   * @return Message to send to user.
   */
  async statusForServer(message: Message, field: string, update: string): Promise<string> {
    const server = await dbc.dbFind('configDB', {_id: message.guild.id})

    let fieldData = ''
    if (server[field] === undefined) {
      fieldData = 'not configured'
    } else {
      fieldData = server[field]
    }

    if (update === undefined || update === '') {
      const option = field as FieldOptions
      return `**${message.guild.name} ${option}:** ${fieldData}.`
    }

    if (message.member.permissions.has('ADMINISTRATOR')) {
      let returnMessage = ''

      switch (field) {
      case 'prefix':
        returnMessage = await this.validatePrefix(message, update)
        break
      case 'announce':
        returnMessage = await this.validateChannel(message, update)
        break
      default:
        returnMessage = await this.updateStatus(message.author, 'configDB', message.guild.id, field, update)
        break
      }

      return returnMessage
    }

    return '**Error:** Only server administrators are permitted to configure server preferences.'
  }

  /**
   * Updates user-entered flags.
   *
   * @param author - The user to update the flags of.
   * @param db - The database name.
   * @param id - The ID of the field to update.
   * @param field - The field to update.
   * @param flag - The flag to update to.
   * @return Message to send to user.
   */
  async updateStatus(author: User, db: string, id: string, field: string, flag: string): Promise<string> {
    if (!(flag === 'on' || flag === 'off')) {
      return `${author}, use **on|off** to toggle preferences.`
    }

    let returnMessage = ''
    const data = {$set: {}}
    data.$set = {[field]: flag}
    await dbc.dbUpdate(db, {_id: id}, data)
    returnMessage = `${author}, you have turned `
    if (field === 'autoStatus') {
      returnMessage += 'automatic summaries'
    } else if (field === 'xStatus') {
      returnMessage += 'cross-server display'
    }
    returnMessage += ` **${flag}**.`

    return returnMessage
  }

  /**
   * Validates custom prefixes for Winnie.
   *
   * @param message - The message that initiated the change.
   * @param update - Data to update with.
   * @return The message to send to the user.
   */
  async validatePrefix(message: Message, update: string): Promise<string> {
    let returnMessage = ''
    if (update === 'clear') {
      delete config.cmd_prefix[message.guild.id]
      await dbc.dbUpdate(
        'configDB', {_id: message.guild.id}, {$unset: {prefix: 1}})
      returnMessage = message.author + ', you have reset my prefix.'
    } else if (update.length > 0 && update.length < 3) {
      config.cmd_prefix[message.guild.id] = update
      await dbc.dbUpdate(
        'configDB', {_id: message.guild.id}, {$set: {prefix: update}})
      returnMessage = message.author +
        ', you have changed my prefix to `' +
        update +
        '`.'
    } else {
      returnMessage = '**Error:**:' +
        ' My prefix must be less than three characters.'
    }
    return returnMessage
  }

  /**
   * Validates announcement channels for Winnie.
   *
   * @param message - The message that initiated the change.
   * @param update - Data to update with.
   * @return The message to send to the user.
   */
  async validateChannel(message: Message, update: string): Promise<string> {
    const channelObject = client.channels.get(update.slice(2, -1)) as GuildChannel
    if (channelObject === undefined) {
      return `**Error:**: ${update} is not a valid channel.`
    }

    if (channelObject.guild.me.permissionsIn(channelObject).hasPermission('SEND_MESSAGES')) {
      this.announceChannel.set(message.guild.id, channelObject.id)
      await dbc.dbUpdate('configDB', {_id: message.guild.id}, {$set: {announce: channelObject.id}})
      return `${message.author}, you have changed the announcements channel to ${channelObject}.`
    }

    return '**Error:**: I need permission to send messages in the announcements channel.'
  }

  /**
   * Generates a summary of posted totals for a challenge.
   *
   * @param channel - Discord ID of the channel being posted to.
   * @param challengeID - Unique ID of the challenge being summarised.
   * @return The message to send to the user.
   */
  generateSummary(channel: Snowflake, challengeID: number): string {
    const challenge = this.running.get(challengeID)

    if (!challenge) {
      return '**Error:** This challenge does not exist.'
    } else {
      return challenge.stats(channel)
    }
  }
}

export default new ChallengeCache()
