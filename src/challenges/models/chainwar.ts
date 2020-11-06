import ChallengeStates from './challenge-states'
import ChallengeTypes from './challenge-types'
import War from './war'
import { ChallengeUser, WarUser } from './challenge-user'
import { Client, GuildChannel, Snowflake } from 'discord.js'

// const clist = require('./clist.js')
// const dbc = require('../dbc.js')

declare const client: Client

/**
 * Represents a chain war.
 */
export default class ChainWar extends War {
  /**
   * The name of this war.
   *
   * Format:
   * <chain_war_name> (<current_war>/<total_wars>)
   * My Chain War (2/5)
   */
  warName: string

  /**
   * The index of the current war in the chain
   */
  current: number

  /**
   * The total number of wars in the chain.
   */
  total: number

  chainTotal: Record<Snowflake, Record<string, Array<number>>>
  serverTotal: Record<Snowflake, Record<string, Array<number>>>
  countdownList: Array<number>

  /**
   * Create a chain war.
   *
   * @param objectID - The unique ID of the chain war.
   * @param creator - The Discord ID of the creator.
   * @param warName - The name of the chain war.
   * @param initStamp - UNIX timestamp of creation time.
   * @param current - The number of the current war in the chain.
   * @param total - The total number of wars in the chain.
   * @param countdown - Time in minutes from creation to start.
   * @param duration - Duration in minutes.
   * @param channel - Discord ID of start channel.
   * @param hidden - Flag for whether challenge is visible to users on other servers.
   * @param hookedChannels - A list of channels that have joined the war.
   * @param joined - A list of users who have joined the war.
   * @param chainTotal - Totals for all users, for all wars in the chain.
   * @param serverTotal - Aggregate totals by server.
   */
  constructor(
    objectID: number,
    creator: Snowflake,
    warName: string,
    initStamp: number,
    current: number,
    total: number,
    countdown: Array<number>,
    duration: number,
    channel: Snowflake,
    hidden: boolean,
    hookedChannels: Array<Snowflake>,
    joined: Record<Snowflake, ChallengeUser>,
    chainTotal: Record<Snowflake, Record<string, Array<number>>>,
    serverTotal: Record<Snowflake, Record<string, Array<number>>>,
  ) {
    super(
      objectID,
      creator,
      `${warName} (${current}/${total})`,
      initStamp,
      countdown[current - 1],
      duration,
      channel,
      hidden,
      hookedChannels,
      joined,
      ChallengeTypes.CHAIN_WAR,
    )
    this.warName = warName
    this.current = current
    this.total = total
    this.chainTotal = chainTotal
    this.serverTotal = serverTotal
    this.countdownList = countdown
    if (this.state === ChallengeStates.ENDED) {
      this.state = ChallengeStates.POST_ENDED
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
      channel: this.channel.id,
      hookedChannels: this.hookedChannels,
      joined: this.joined,
      chainTotal: this.chainTotal,
      serverTotal: this.serverTotal,
      state: this.state,
      type: ChallengeTypes.CHAIN_WAR,
      hidden: this.hidden,
    }
    const array = [challengeData]

    dbc.dbInsert('challengeDB', array)
  }

  /**
   * Update the chain war at each tick.
   */
  async update(): Promise<void> {
    switch (this.state) {
    case ChallengeStates.SCHEDULED:
      this.start()
      break
    case ChallengeStates.IN_PROGRESS:
      this.end()
      break
    case ChallengeStates.ENDED:
      break
    case ChallengeStates.POST_ENDED:
      this.terminate()
      break
    default:
      this.channel.send('**Error:** Invalid state reached.')
      delete clist.running[this.objectID]
      break
    }
  }

  /**
   * Check to see whether the total period is over, and post the summary.
   */
  async terminate(): Promise<void> {
    this.cPost--
    if (this.cPost <= 0) {
      this.addToChains()
      super.terminate()
      if (this.current === this.total) {
        for (let i = 0; i < this.hookedChannels.length; i++) {
          this.getChannel(this.hookedChannels[i]).send(this.chainSummary(
            this.hookedChannels[i],
          ))
        }
      }
    }
  }

  /**
   * Add chain war totals to chain summary.
   */
  addToChains(): void {
    Object.entries(this.joined).forEach(([userID, joinedUser]) => {
      const warUser = joinedUser as WarUser
      const type = warUser.countType
      this.chainTotal = this.addToAggregate(this.chainTotal, userID)
      const serverID = this.getChannel(warUser.channelID).guild.id
      this.serverTotal = this.addToAggregate(this.serverTotal, serverID)

      if (warUser.countData) {
        this.chainTotal[userID][type][0] += warUser.countData
        this.chainTotal[userID][type][1] += this.duration
        this.serverTotal[serverID][type][0] += warUser.countData
        this.serverTotal[serverID][type][1] += 1
      }
    })
  }

  /**
   * Summarises all chain war aggregates for a given server.
   *
   * @param user - The user being summarised.
   * @param userObj - Information about the user being summarised.
   * @return The message to send to the user.
   */
  chainByUser(user: Snowflake, userObj: Record<Snowflake, Array<number>>): string {
    let returnMsg = ''
    let first = true
    for (const item in userObj) {
      if (userObj[item][1] > 0) {
        returnMsg += first === true ? `${client.users.get(user)}: ` : ', '
        returnMsg += this.userTotals(userObj[item][0], item, userObj[item][1])

        first = false
      }
    }

    return returnMsg
  }

  /**
   * Builds a summary of chain war aggregate totals for a given channel.
   *
   * @param channel - Discord ID of the channel being posted to.
   * @return The message to send to the user.
   */
  chainSummary(channelID: Snowflake): string {
    let returnMsg = `***Summary for ${this.warName }:***\n`
    let summaryData = ''

    const channel = client.channels.get(channelID) as GuildChannel
    const summaryServer = channel?.guild

    Object.entries(this.chainTotal).forEach(([userID, totals]) => {
      const userChannel = client.channels.get(this.joined[userID].channelID) as GuildChannel
      const userServer = userChannel?.guild
      if (userServer.id === summaryServer.id) {
        summaryData += `${this.chainByUser(userID, totals)}\n`
      }
    })

    if (Object.keys(this.serverTotal).length > 1) { summaryData += '\n' }

    Object.keys(this.serverTotal).forEach((serverID) => {
      summaryData += this.serverText(serverID, this.serverTotal) + '\n'
    })

    if (summaryData === '') {
      summaryData = 'No totals were posted for this chain war.'
    }

    returnMsg += summaryData
    return returnMsg
  }
}
