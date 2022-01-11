import { ApplicationCommandData, CommandInteraction } from 'discord.js'
import { I18n } from '../../core'
import { GuildConfig } from '../../models'
import { Command } from '../../types'
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
