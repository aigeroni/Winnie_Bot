import { ApplicationCommandData, CommandInteraction, Snowflake } from 'discord.js'
import { Command } from '../../types'
import { GuildConfig } from '../../models'
import { I18n } from '../../core'
import { RaptorPeriods } from '../../types/raptors'

const NAME = 'raptor'

export const RaptorCommand: Command = {
  name: NAME,
  commandData: async (locale: string): Promise<ApplicationCommandData> => ({
    name: NAME,
    description: await I18n.translate(locale, 'commands:raptor.description'),
    options: [
      {
        name: 'period',
        description: await I18n.translate(locale, 'commands:raptor.args.period'),
        type: 'STRING',
        choices: Object.values(RaptorPeriods).map((period) => ({
          name: period,
          value: period
        })),
        required: false
      }
    ]
  }),
  execute: async (interaction: CommandInteraction, guildConfig: GuildConfig) => {
    true
  }
}

/**
  * Gets experience counts, based on raptors, for all guilds.
  *
  * @param interaction The interaction that was executed
  * @returns an array of raptor information for guilds.
  */
async function getGlobalRaptors (interaction: CommandInteraction): Promise<[]> {
  return []
}

/**
  * Gets experience counts, based on raptors, for all users in the calling guild.
  *
  * @param interaction The interaction that was executed
  * @param guild the locale to use when looking up strings
  * @returns an array of raptor information for users in the guild.
  */
async function getUserRaptors (interaction: CommandInteraction, guild: Snowflake): Promise<[]> {
  return []
}

/**
  * Builds a global leaderboard from the raptor experience.
  *
  * @param interaction The interaction that was executed
  * @param data The current state of the raptor database
  * @returns a text string of the guild leaderboard.
  */
async function buildGlobalLeaderboard (interaction: CommandInteraction, data: []): Promise<string> {
  return ''
}

/**
  * Builds a leaderboard for all users in the calling guild based on raptor experience.
  *
  * @param interaction The interaction that was executed
  * @param data The current state of the raptor database
  * @returns an array of raptor information for users in the guild.
  */
async function buildUserLeaderboard (interaction: CommandInteraction, data: []): Promise<string> {
  return ''
}
