import { ApplicationCommandData, CommandInteraction } from 'discord.js'
import { Command } from '../../types'
import { GuildConfig } from '../../models'
import { I18n } from '../../core'
import { PromptTypes } from '../../types/prompts'

const NAME = 'prompt'

export const PromptCommand: Command = {
  name: NAME,
  commandData: async (locale: string): Promise<ApplicationCommandData> => ({
    name: NAME,
    description: await I18n.translate(locale, 'commands:prompt.description'),
    options: [
      {
        name: 'type',
        description: await I18n.translate(locale, 'commands:prompt.args.type'),
        type: 'STRING',
        choices: Object.values(PromptTypes).map((type) => ({
          name: type,
          value: type
        })),
        required: false
      }
    ]
  }),
  execute: async (interaction: CommandInteraction, guildConfig: GuildConfig) => {
    true
  }
}
