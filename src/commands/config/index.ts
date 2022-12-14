import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandGroupBuilder } from 'discord.js'
import { Command } from '../../types'
import { CommandService } from '../../services'
import { ConfigCrossGuildCommand } from './cross-guild'
import { ConfigTimezoneCommand } from './timezone'
import { GuildConfig, UserConfig } from '../../models'
import { I18n } from '../../core'

const NAME = 'config'

const commands = [
  ConfigCrossGuildCommand,
  ConfigTimezoneCommand
]

export const ConfigCommand: Command = {
  name: NAME,
  data: async (locale: string) => {
    return new SlashCommandBuilder()
      .setName(NAME)
      .setDescription(await I18n.translate(locale, 'commands:config.description'))
      .addSubcommandGroup(await ConfigCrossGuildCommand.data(locale) as SlashCommandSubcommandGroupBuilder)
      .addSubcommandGroup(await ConfigTimezoneCommand.data(locale) as SlashCommandSubcommandGroupBuilder)
  },
  execute: async (interaction: ChatInputCommandInteraction, guildConfig: GuildConfig, userConfig: UserConfig) => {
    await CommandService.executeTopLevelCommand(commands, interaction, guildConfig, userConfig)
  }
}
