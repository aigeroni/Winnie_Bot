import Goal from './goal'
import GoalCache from './goal-cache'
import GoalTypes from './goal-types'
import mtz from 'moment-timezone'
import timezoneJS from 'timezone-js'
import { Message, User } from 'discord.js'

/**
 * Class containing functions for goal management.
 */
export default class Goals {
  static readonly REGION_REGEX = /^(Africa|America|Antarctica|Asia|Atlantic|Australia|Europe|Indian|Pacific|Etc)/

  /**
   * Set a user's timezone.
   *
   * @param message - The message that ran this function.
   * @param prefix - The bot's prefix.
   * @param suffix - Information after the bot command.
   * @return False in the event of an error.
   */
  static setTimezone(message: Message, prefix: string, suffix: string): string {
    const tz = suffix.replace(/[a-zA-Z0-9]*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    })
    if (suffix === '') {
      return `${message.author}, I need a timezone to set!`
    } else if (!this.REGION_REGEX.test(tz) || !mtz.tz.zone(tz)) {
      return '**Error:** Winnie_Bot accepts IANA timezone identifiers' +
        ' only. These generally take the format of' +
        ' Continent/Your_Areas_Largest_City.\n**For example:** `' +
        prefix + 'timezone America/New_York`, `' +
        prefix + 'timezone Australia/Sydney`, `' +
        prefix + 'timezone Europe/London`'
    } else {
      dbc.dbUpdate('userDB', {_id: message.author.id}, {$set: {timezone: tz}})
      return `${message.author}, you have set your timezone to **${tz}**.`
    }
  }

  /**
   * Set a goal for a user.
   *
   * @param message - The message that ran this function.
   * @param prefix - The bot's prefix.
   * @param suffix - Information after the bot command.
   * @return The message to send to the user.
   */
  static async setGoal(message: Message, prefix: string, suffix: string): Promise<string> {
    const args = suffix.split(' ')
    const goal = args.shift()
    let goalType = args.shift() ?? GoalTypes.WORDS
    if (goalType.charAt(goalType.length-1) !== 's') { goalType += 's' }

    const user = await dbc.dbFind('userDB', {_id: message.author.id})

    if (goal === undefined || goal === '') {
      return `${message.author}, I need a goal to set!`
    } else if (!Number.isInteger(Number(goal))) {
      return `**Error:** Your goal must be a whole number. Example: \`${prefix}set 1667\`.`
    } else if (message.author.id in goallist.goalList) {
      return `${message.author}, you have already set a goal today. Use the update commands to record your progress.`
    } else if (goalType as GoalTypes === undefined) {
      return `**Error:** Goal type must be words, lines, pages, or minutes. Example: \`${prefix}set 50 lines\`.`
    } else if (user === null || user.timezone === undefined) {
      return `${message.author}, you need to set your timezone before setting a daily goal. Use the \`!timezone\` command to do so.`
    } else {
      const startTime = new timezoneJS.Date(user.timezone)
      const endTime = new timezoneJS.Date(user.timezone)

      endTime.setHours(24, 0, 0, 0)
      GoalCache.add(new Goal(
        message.author.id,
        parseInt(goal),
        goalType as GoalTypes,
        0,
        startTime.getTime(),
        endTime.getTime(),
        message.channel.id,
      ))
      return `${message.author}, your goal for today is **${goal}** ${goalType}.`
    }
  }

  /**
   * Update a user's goal.
   *
   * @param message - The message that ran this function.
   * @param prefix - The bot's prefix.
   * @param suffix - Information after the bot command.
   * @param overwrite - Whether the progress is being added to (false)
   *   or overwritten (true).
   * @return The message to send to the user.
   */
  static updateGoal(message: Message, prefix: string, suffix: string, overwrite: boolean): string {
    const args = suffix.split(' ')
    const newGoal = args.shift()
    if (!newGoal) {
      return `${message.author}, I need some progress to update!`
    }

    const newGoalNum = parseInt(newGoal)
    if (!Number.isInteger(newGoalNum)) {
      return `**Error:** Your progress must be a whole number. Example: \`${prefix} update 256\`.`
    }

    const goal = GoalCache.get(message.author.id)
    if (!goal) {
      return `${message.author}, you have not yet set a goal for today. Use \`${prefix}set <goal>\` to do so.`
    }

    goal.addWords(newGoalNum, overwrite)
    return Goals.goalData(message.author)
  }

  /**
   * Resets a user's goal.
   *
   * @param message - The message that ran this function.
   * @param prefix - The bot's prefix.
   * @param suffix - Information after the bot command.
   * @return The message to send to the user.
   */
  static async resetGoal(message: Message, prefix: string, suffix: string): Promise<string> {
    const args = suffix.split(' ')
    const newGoal = args.shift()
    const newType = args.join(' ') ?? GoalTypes.WORDS
    const goal = GoalCache.get(message.author.id)

    if (!goal) {
      return `${message.author}, you have not yet set a goal for today. Use \`${prefix}set <goal>\` to do so.`
    } else if (!newGoal || !Number.isInteger(parseInt(newGoal))) {
      goal.clearGoal()
      return `${message.author}, you have successfully reset your daily goal.`
    } else if (newType === goal.goalType) {
      goal.goal = parseInt(newGoal)
      return this.goalData(message.author)
    } else {
      goal.clearGoal()
      return await Goals.setGoal(message, prefix, suffix)
    }
  }

  /**
   * Allows a user to view their progress towards their goal.
   *
   * @param message - The message that ran this function.
   * @param prefix - The bot's prefix.
   * @return The message to send to the user.
   */
  static viewGoal(message: Message, prefix: string): string {
    if (!GoalCache.has(message.author.id)) {
      return `${message.author}, you have not yet set a goal for today. Use \`${prefix}set <goal>\` to do so.`
    } else {
      return this.goalData(message.author)
    }
  }

  /**
   * Compiles a user's progress towards their goal.
   *
   * @param author - The goal setter's Discord account.
   * @return The message to send to the user.
   */
  static goalData(author: User): string {
    const goal = GoalCache.get(author.id)
    if (!goal) { return '' }

    return `${author}, you have written **${goal.written}** ${goal.goalType} of your **${goal.goal}**-${goal.goalType.slice(0, -1)} goal.`
  }
}
