import ChallengeCache from '../challenge-cache'
import ChallengeStates from '../models/challenge-states'
import ChallengeTypes from '../models/challenge-types'
import { Message } from 'discord.js'

/**
 * Class containing functions for challenge management.
 */
export default class ChallengeService {
  /**
   * Add a user to the list of joined users for a challenge.
   *
   * @param message - The message that ran this function.
   * @param prefix - The bot's prefix.
   * @param suffix - Information after the bot command.
   * @return The message to send to the user.
   */
  static async joinChallenge(message: Message, prefix: string, suffix: string): Promise<string> {
    const challengeID = suffix
    const errorMessage = ChallengeService.checkIDError(challengeID, message, 'join', prefix)
    if (errorMessage) { return errorMessage }

    const challenge = ChallengeCache.getRunning(challengeID)
    return await challenge.join(message.author, message.channel.id)
  }

  /**
   * Remove a user from the list of joined users for a challenge.
   *
   * @param message - The message that ran this function.
   * @param prefix - The bot's prefix.
   * @param suffix - Information after the bot command.
   * @return The message to send to the user.
   */
  async leaveChallenge(message: Message, prefix: string, suffix: string): Promise<string> {
    const challengeID = suffix
    const errorMessage = ChallengeService.checkIDError(challengeID, message, 'leave', prefix)
    if (errorMessage) { return errorMessage }

    const challenge = ChallengeCache.getRunning(challengeID)
    return await challenge.leave(message.author)
  }

  /**
   * Terminates a challenge early.
   *
   * @param message - The message that ran this function.
   * @param prefix - The bot's prefix.
   * @param suffix - Information after the bot command.
   * @return Channels to send message to, and message to send.
   */
  async stopChallenge(message: Message, prefix: string, suffix: string): Promise<string> {
    const challengeID = suffix
    const errorMessage = ChallengeService.checkIDError(challengeID, message, 'cancel', prefix)
    if (errorMessage) { return errorMessage }

    const challenge = ChallengeCache.getRunning(challengeID)

    if (challenge.creator === message.author.id) {
      return await challenge.cancel(message.author)
    }

    const returnMessage = `**Error:** Only the creator of ${challenge} can end this challenge.`
    message.channel.send(returnMessage)
    return returnMessage
  }

  /**
   * Calls time for a sprint.
   *
   * @param message - The message that ran this function.
   * @param prefix - The bot's prefix.
   * @param suffix - Information after the bot command.
   * @return Message to send to user, raptor determination value.
   */
  async callTime(message: Message, prefix: string, suffix: string): Promise<Record<string, string | boolean>> {
    const challengeID = suffix
    let raptorCheck = false

    const errorMessage = ChallengeService.checkIDError(suffix, message, 'time', prefix)
    if (errorMessage) {
      return {
        returnMessage: errorMessage,
        raptorCheck,
      }
    }

    let returnMessage = ''
    const challenge = ChallengeCache.getRunning(challengeID)

    if (challenge.type !== ChallengeTypes.SPRINT) {
      returnMessage = '**Error:** You can only call time on a sprint.'
    } else if (challenge.state === ChallengeStates.SCHEDULED) {
      returnMessage = '**Error:** This challenge has not started yet!'
    } else {
      raptorCheck = true
      const doneStamp = new Date().getTime()
      const timeTaken = (doneStamp - clist.running[suffix].startStamp) / 60000
      challenge.submitUserData(message.author.id, message.channel.id, doneStamp, timeTaken)
      returnMessage = `${message.author}, you completed the sprint in ${timeTaken.toFixed(2)} minutes.`
    }

    return {
      returnMessage,
      raptorCheck,
    }
  }

  /**
   * Adds a total to a challenge.
   *
   * @param message - The message that ran this function.
   * @param prefix - The bot's prefix.
   * @param suffix - Information after the bot command.
   * @return Message to send to user, raptor determination value.
   */
  async addTotal(message: Message, prefix: string, suffix: string): Promise<Record<string, string | boolean>> {
    let returnMessage = ''
    const args = suffix.split(' ')
    const challengeID = args.shift() ?? ''
    const wordsWritten = args.shift() ?? ''
    const writtenType = this.typeAssign(args.shift())
    let raptorCheck = false

    if (!writtenType) {
      return {
        returnMessage: '**Error:** You must work in words, lines, or pages.',
        raptorCheck,
      }
    }

    const errorMessage = ChallengeService.checkIDError(challengeID, message, 'total', prefix)
    if (errorMessage) {
      return {
        returnMessage: errorMessage,
        raptorCheck,
      }
    }

    const challenge = ChallengeCache.getRunning(challengeID)
    const validationMessage = ChallengeService.validateGoal(wordsWritten)
    if (validationMessage) {
      returnMessage = validationMessage
    } else if (challenge.type !== ChallengeTypes.SPRINT) {
      returnMessage = '**Error:** You cannot post a total for sprints.'
    } else if (challenge.state < ChallengeStates.ENDED) {
      returnMessage = '**Error:** This challenge has not ended yet!'
    } else {
      raptorCheck = true
      challenge.submitUserData(message.author.id, message.channel.id, wordsWritten, writtenType)
      returnMessage = `${message.author}, your total of **${wordsWritten}** ${writtenType} has been added to the summary.`
    }

    return {
      returnMessage,
      raptorCheck,
    }
  }

  /**
   * Checks for a valid challenge ID.
   *
   * @param challengeID - The ID to test for validity.
   * @param message - The message that resulted in the check.
   * @param command - The command that resulted in this error.
   * @param prefix - The bot's prefix.
   * @return Error message.
   */
  static checkIDError(challengeID: string, message: Message, command: string, prefix: string): string | undefined {
    const id = parseInt(challengeID)

    if (isNaN(id) || id < 1) {
      return `**Error:** Challenge ID must be an integer. Example: \`${prefix}${command} 10793\`.`
    }

    if (!ChallengeCache.hasRunning(id)) {
      return `**Error:** Challenge ${challengeID} does not exist!`
    }

    if (ChallengeCache.isHidden(id, message.guild.id)) {
      return `${message.author}, you do not have permission to ${command} this challenge.`
    }
  }

  /**
   * Validate and assign a total type.
   *
   * @param type - The type of the challenge.
   * @return User data.
   */
  typeAssign(type: string | undefined): string | undefined {
    if (type === undefined) { return 'words' }
    if (type.charAt(type.length-1) !== 's') { type += 's' }

    if (!['words', 'lines', 'pages', 'minutes'].includes(type)) {
      return
    }

    return type
  }

  /**
   * Validates the word goal for a sprint.
   *
   * @param words - The goal to validate.
   * @return Message to send to user.
   */
  static validateGoal(words: string): string | undefined {
    if (words && !Number.isInteger(Number(words))) {
      return '**Error:** Word count must be a whole number.'
    } else if (parseInt(words) < 1) {
      return '**Error:** Word count cannot be negative.'
    }
  }
}
