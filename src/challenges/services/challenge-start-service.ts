import ChainWar from '../models/chainwar'
import ChallengeCache from '../challenge-cache'
import ChallengeService from './challenge-service'
// import clist from '../clist.js'
// import dbc from '../../dbc.js'
import Profanity from 'profanity-util'
import Sprint from '../models/sprint'
import War from '../models/war'
import emojiRegexImport from 'emoji-regex/es2015'
import { Message } from 'discord.js'

const emojiRegex = emojiRegexImport()

interface StartCommandFlags {
  join: boolean,
  display: boolean,
  args: Array<string>
}

/**
 * Class containing functions for challenge management.
 */
export default class ChallengeStartService {
  /**
   * Creates a new sprint.
   *
   * @param message - The message that ran this function.
   * @param prefix - The bot's prefix.
   * @param suffix - Information after the bot command.
   * @return The message to send to the user.
   */
  static async startSprint(message: Message, prefix: string, suffix: string): Promise<string> {
    const exampleCommandUsage = `Example: \`${prefix}sprint 200 10 1\``

    const flagData = await ChallengeStartService.flagCheck(message, suffix)

    const wordsString = flagData.args.shift()
    const words = wordsString ? parseInt(wordsString) : 1
    const timeoutString = flagData.args.shift()
    const timeout = timeoutString ? parseInt(timeoutString) : 1
    const startString = flagData.args.shift()
    const start = startString ? parseInt(startString) : 1

    let sprintName = flagData.args.join(' ')
    if (sprintName === '') {
      sprintName = message.author.username + '\'s sprint'
    }
    if (message.mentions.members.size > 0) { return '**Error:** Challenge names may not mention users.' }

    const nameValidationResult = ChallengeStartService.validateName(sprintName)
    if (nameValidationResult) { return nameValidationResult }

    const timeValidationResult = ChallengeStartService.validateTime(timeout)
    if (timeValidationResult) { return `${timeValidationResult} ${exampleCommandUsage}.` }

    const countdownValidationResult = ChallengeStartService.validateCountdown(start)
    if (countdownValidationResult) { return `${countdownValidationResult} ${exampleCommandUsage}.` }

    if (ChallengeService.validateGoal(words)) { return `${challenges.validateGoal(words)} ${exampleCommandUsage}.` }

    const sprintID = ChallengeCache.nextIndex()
    const sprint = new Sprint(
      sprintID,
      message.author.id,
      sprintName,
      new Date().getTime(),
      start,
      words,
      timeout,
      message.channel.id,
      flagData.display,
      [message.channel.id],
      {},
    )

    ChallengeCache.add(sprint)

    let returnMessage = ''
    if (flagData.join) {
      returnMessage += await sprint.join(message.author, message.channel.id)
    }

    return returnMessage
  }

  /**
   * Creates a new war.
   *
   * @param message - The message that ran this function.
   * @param prefix - The bot's prefix.
   * @param suffix - Information after the bot command.
   * @return The message to send to the user.
   */
  static async startWar(message: Message, prefix: string, suffix: string): Promise<string> {
    const commandUsage = `Example: \`${prefix}war 10 1\``

    const flagData = await ChallengeStartService.flagCheck(message, suffix)
    const durationString = flagData.args.shift()
    const duration = durationString ? parseInt(durationString) : 0
    const startString = flagData.args.shift()
    const start = startString ? parseInt(startString) : 1
    let warName = flagData.args.join(' ')
    if (warName === '') {
      warName = `${message.author.username}'s war`
    }

    if (message.mentions.members.size > 0) {
      return '**Error:** Challenge names may not mention users.'
    }

    const nameValidationResult = ChallengeStartService.validateName(warName)
    if (nameValidationResult) { return nameValidationResult }

    const timeValidationResult = ChallengeStartService.validateTime(duration)
    if (timeValidationResult) { return `${timeValidationResult} ${commandUsage}` }

    const countdownValidationResult = ChallengeStartService.validateCountdown(start)
    if (countdownValidationResult) { return `${countdownValidationResult} ${commandUsage}` }

    const warID = ChallengeCache.nextIndex()
    const war = new War(
      warID,
      message.author.id,
      warName,
      new Date().getTime(),
      start,
      duration,
      message.channel.id,
      flagData.display,
      [message.channel.id],
      {},
    )

    ChallengeCache.add(war)

    let returnMessage = ''
    if (flagData.join) {
      returnMessage += await war.join(message.author, message.channel.id)
    }

    return returnMessage
  }

  /**
   * Creates a new chain war.
   *
   * @param message - The message that ran this function.
   * @param prefix - The bot's prefix.
   * @param suffix - Information after the bot command.
   * @return The message to send to the user.
   */
  static async startChainWar(message: Message, prefix: string, suffix: string): Promise<string> {
    const commandUsage = `Example: \`${prefix}chainwar 2 10 1\`.`

    const flagData = await ChallengeStartService.flagCheck(message, suffix)

    const chainWarCountString = flagData.args.shift()
    const chainWarCount = chainWarCountString ? parseInt(chainWarCountString) : 0
    const durationString = flagData.args.shift()
    const duration = durationString ? parseInt(durationString) : 0

    const timeBetweenStrings = flagData.args.shift()?.split('|') ?? ['1']
    while (timeBetweenStrings.length < chainWarCount) {
      timeBetweenStrings.push(timeBetweenStrings[timeBetweenStrings.length-1])
    }
    const timeBetween = timeBetweenStrings.map((time) => parseInt(time))

    let warName = flagData.args.join(' ')
    if (warName === '') {
      warName = message.author.username + '\'s war'
    }

    if (message.mentions.members.size > 0) {
      return '**Error:** Challenge names may not mention users.'
    }

    const nameValidationResult = ChallengeStartService.validateName(warName)
    if (nameValidationResult) { return nameValidationResult }

    const timeValidationResult = ChallengeStartService.validateTime(duration)
    if (timeValidationResult) { return `${timeValidationResult} ${commandUsage}` }

    const chainCountValidationResult = ChallengeStartService.validateChainCount(timeBetween)
    if (chainCountValidationResult) { return `${chainCountValidationResult} ${commandUsage}` }

    const chainLengthValidationResult = ChallengeStartService.validateChainLength(chainWarCount)
    if (chainLengthValidationResult) { return `${chainLengthValidationResult} ${commandUsage}` }

    const chainWarID = ChallengeCache.nextIndex()
    const chainWar = new ChainWar(
      chainWarID,
      message.author.id,
      warName,
      new Date().getTime(),
      1,
      chainWarCount,
      timeBetween,
      duration,
      message.channel.id,
      flagData.display,
      [message.channel.id],
      {},
      {},
      {},
    )

    ChallengeCache.add(chainWar)

    let returnMessage = ''
    if (flagData.join) {
      returnMessage += await chainWar.join(message.author, message.channel.id)
    }

    return returnMessage
  }

  /**
   * Validates a challenge name.
   * @param name - The name to validate.
   * @return Message to send to user.
   */
  static validateName(name: string): string | undefined {
    if (Profanity.check(name).length > 0) {
      return '**Error:** Challenge names may not contain profanity.'
    } else if (emojiRegex.exec(name)) {
      return '**Error:** Challenge names may not contain emoji.'
    } else if (name.length > 150) {
      return '**Error:** Challenge names must be 150 characters or less.'
    }
  }

  /**
   * Validates a challenge duration.
   *
   * @param duration - The duration to validate.
   * @return Message to send to user.
   */
  static validateTime(duration: number): string | undefined {
    if (isNaN(duration)) {
      return '**Error:** Challenge duration must be a number.'
    } else if (duration > 60) {
      return '**Error:** Challenges cannot last for more than an hour.'
    } else if (duration < 1) {
      return '**Error:** Challenges must run for at least a minute.'
    }
  }

  /**
   * Validates splits between wars in a chain.
   *
   * @param splits - An array of splits to validate.
   * @return Message to send to user.
   */
  static validateChainCount(splits: Array<number>): string | undefined {
    let returnMessage

    splits.forEach((countdown) => {
      const countdownValidationResult = ChallengeStartService.validateCountdown(countdown)
      if (countdownValidationResult) { returnMessage = countdownValidationResult }
    })

    return returnMessage
  }

  /**
   * Validates the time before a challenge.
   *
   * @param start - The countdown time to validate.
   * @return Message to send to user.
   */
  static validateCountdown(start: number): string | undefined {
    if (isNaN(start)) {
      return '**Error:** Time to start must be a number.'
    } else if (start > 30) {
      return '**Error:** Challenges must start within 30 minutes.'
    } else if (start <= 0) {
      return '**Error:** Challenges cannot start in the past.'
    }
  }

  /**
   * Validates the number of wars in a chain.
   *
   * @param length - The length to validate.
   * @return Message to send to user.
   */
  static validateChainLength(length: number): string | undefined {
    if (isNaN(length)) {
      return '**Error:** War count must be a number.'
    }

    if (length < 2 || length > 10) {
      return '**Error:** Chains must be between two and ten wars long.'
    }
  }

  /**
   * Configure options for a challenge.
   *
   * @param message - The message that created the challenge.
   * @param suffix - Options to configure.
   * @return Promise object.
   */
  static async flagCheck(message: Message, suffix: string): Promise<StartCommandFlags> {
    let joinFlag = false
    let crossServerHide = false

    const args = suffix.split(' ')
    const user = await dbc.dbFind('userDB', {_id: message.author.id})
    const guild = await dbc.dbFind('configDB', {_id: message.guild.id})

    if (user !== null && user.xStatus === true || guild !== null && guild.xStatus === true) {
      crossServerHide = true
    }

    if (args[0] === 'join') {
      args.shift()
      joinFlag = true
    }

    if (args[0] === 'hide') {
      args.shift()
      crossServerHide = true
    }

    return {
      join: joinFlag,
      display: crossServerHide,
      args,
    }
  }
}
