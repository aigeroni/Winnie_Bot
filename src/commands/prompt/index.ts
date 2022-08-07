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
        required: true,
        choices: await Promise.all(Object.values(PromptTypes).map(async (type) => ({
          name: await I18n.translate(locale, `prompts:${type}.name`),
          value: type
        })))
      }
    ]
  }),
  execute: async (interaction: CommandInteraction, guildConfig: GuildConfig) => {
    const promptGenre = interaction.options.getString('type', true)
    const prompts = await I18n.translate(guildConfig.locale, `prompts:${promptGenre}.prompts`, { returnObjects: true }) as unknown
    const promptList = prompts as string[]
    const promptToReturn = promptList[Math.floor(Math.random() * promptList.length)]
    await interaction.reply(promptToReturn)
  }
}
