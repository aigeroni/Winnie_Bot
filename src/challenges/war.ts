import Challenge from './challenge'
import ChallengeStates from './challenge-states'
import ChallengeTypes from './challenge-types'
import { ChallengeUser, WarUser } from './challenge-user'
import { Client, Guild, GuildChannel, Snowflake } from 'discord.js'

// const dbc = require('../dbc.js')

declare const client: Client

/**
 * Represents a war.
 */
export default class War extends Challenge {
  /**
   * Create a chain war.
   * @param objectID - The unique ID of the war.
   * @param creator - The Discord ID of the creator.
   * @param displayName - The name of the war.
   * @param initStamp - UNIX timestamp of creation time.
   * @param countdown - Time in minutes from creation to start.
   * @param duration - Duration in minutes.
   * @param channel - Discord ID of start channel.
   * @param hidden - Flag for whether challenge is visible to users on other servers.
   * @param hookedChannels - A list of channels that have joined the war.
   * @param joined - A list of users who have joined the war.
   * @param type - The type of the war.
   */
  constructor(
    objectID: number,
    creator: Snowflake,
    displayName: string,
    initStamp: number,
    countdown: number,
    duration: number,
    channel: Snowflake,
    hidden: boolean,
    hookedChannels: Array<Snowflake>,
    joined: Record<Snowflake, ChallengeUser>,
    type = ChallengeTypes.WAR,
  ) {
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
      joined,
    )

    const challengeData = {
      _id: this.objectID,
      creator: this.creator,
      name: this.displayName,
      startTime: this.initStamp,
      countdown: this.countdown,
      duration: this.duration,
      channel: this.getChannel(channel),
      hookedChannels: this.hookedChannels,
      joined: this.joined,
      state: this.state,
      type: ChallengeTypes.WAR,
      hidden: this.hidden,
    }
    const array = [challengeData]

    dbc.dbInsert('challengeDB', array)
  }

  /**
   * Builds user data for the challenge database.
   *
   * @param channel - The channel from which the user joined.
   * @param total - The total posted by the user.
   * @param type - The type of the total.
   * @return JSON object representing the total.
   */
  buildUserData(channel: Snowflake, total: number, type: string): WarUser {
    return {
      countData: total,
      countType: type,
      channelID: channel,
    }
  }

  /**
   * Check to see whether the total period is over, and post the summary.
   */
  async terminate(): Promise<void> {
    this.cPost--
    if (this.cPost > 0) { return }

    Object.entries(this.joined).forEach(async ([userID, joinedUser]) => {
      const warUser = joinedUser as WarUser
      const data = {
        $inc: {},
      }

      switch (warUser.countType) {
      case 'words':
        data.$inc = {
          lifetimeWarWords: warUser.countData,
          lifetimeWordMinutes: this.duration,
        }
        break
      case 'lines':
        data.$inc = {
          lifetimeWarLines: warUser.countData,
          lifetimeWordMinutes: this.duration,
        }
        break
      case 'pages':
        data.$inc = {
          lifetimeWarPages: warUser.countData,
          lifetimeWordMinutes: this.duration,
        }
        break
      case 'minutes':
        data.$inc = {
          lifetimeWordMinutes: warUser.countData,
        }
        break
      }

      await dbc.dbUpdate('userDB', { _id: userID }, data)
    })

    super.terminate()
  }

  /**
   * Prints statistics for a challenge.
   *
   * @param channel - Channel to print to.
   * @return Return message.
   */
  stats(channel: Snowflake): string {
    if (this.state !== ChallengeStates.ENDED) {
      return 'This war has not ended yet.'
    }

    const serverTotals = this.serverTotals()
    if (Object.keys(serverTotals).length === 0) {
      return 'Nobody has posted a total for this war yet.'
    }

    let returnMessage = `***Statistics for ${this.displayName}:***\n\n`
    returnMessage += `${this.challengeByUser(this.getChannel(channel).guild)}\n`

    for (const server in serverTotals) {
      returnMessage += this.serverText(server, serverTotals) + '\n'
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
    let userTotals = ''

    Object.entries(this.joined).forEach(async ([userID, joinedUser]) => {
      const warUser = joinedUser as WarUser
      const userChannel = client.channels.get(warUser.channelID) as GuildChannel
      const userInSummaryServer = userChannel?.guild?.id === summaryServer.id

      if (warUser.countType && userInSummaryServer) {
        const userTotal = this.userTotals(warUser.countData, warUser.countType, this.duration)
        userTotals += `${client.users.get(userID)}: ${userTotal}\n`
      }
    })

    return userTotals
  }

  /**
   * Produces a per-server breakdown of user-entered totals for a war.
   *
   * @return The message to send to the user.
   */
  serverTotals(): Record<Snowflake, Record<string, Array<number>>> {
    let serverTotals: Record<Snowflake, Record<string, Array<number>>> = {}

    Object.entries(this.joined).forEach(async ([, joinedUser]) => {
      const warUser = joinedUser as WarUser

      if (warUser.countType) {
        const userServerID = this.getChannel(warUser.channelID).guild.id
        serverTotals = this.addToAggregate(serverTotals, userServerID)

        serverTotals[userServerID][warUser.countType][0] += warUser.countData
        serverTotals[userServerID][warUser.countType][1] += 1
      }
    })

    return serverTotals
  }

  /**
   * Adds an object to an aggregate list of totals.
   *
   * @param serverList - The object to add to.
   * @param server - The object to add.
   * @return The relevant server.
   */
  addToAggregate(serverList: Record<Snowflake, Record<string, Array<number>>>, server: Snowflake): Record<Snowflake, Record<string, Array<number>>> {
    if (serverList[server] !== undefined) { return serverList }

    serverList[server] = {
      words: [0, 0],
      lines: [0, 0],
      pages: [0, 0],
      minutes: [0, 0],
    }

    return serverList
  }

  /**
   * Summarises a user's total.
   *
   * @param total - The user's total.
   * @param type - The total type.
   * @param time - The duration of the challenge.
   * @return The message to send to the user.
   */
  userTotals(total: number, type: string, time: number): string {
    let userTotal = `**${total}** ${total === 1 ? type.slice(0, -1) : type}`

    if (type !== 'minutes') {
      userTotal += ` (**${(total/time).toFixed(2)}** ${type.slice(0, 1)}pm)`
    }

    return userTotal
  }

  /**
   * Displays war totals in a human-readable format.
   *
   * @param {String} server - Snowflake of the server being posted to.
   * @param {Object} serverTotals - Summary of user-entered totals by server.
   * @return {String} - The message to send to the user.
   */
  serverText(serverID: Snowflake, serverTotals: Record<Snowflake, Record<string, Array<number>>>): string {
    let serverText = `__${client.guilds.get(serverID)?.name}__:`
    let firstType = true
    for (const item in serverTotals[serverID]) {
      if (serverTotals[serverID][item][1] > 0) {
        if (!firstType) {
          serverText += ', '
        }
        serverText += ' **' + serverTotals[serverID][item][0]
        if (serverTotals[serverID][item][0] === 1) {
          serverText += '** ' + item.slice(0, -1)
        } else {
          serverText += '** ' + item
        }
        serverText += ' (**' + (
          serverTotals[serverID][item][0]/
          serverTotals[serverID][item][1]).toFixed(0) +
          '** avg)'
        firstType = false
      }
    }
    return serverText
  }
}
