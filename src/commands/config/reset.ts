import { Command } from '../../types/command'
import { GuildConfig, UserConfig } from '../../models'
import { I18n } from '../../core/i18n'
import { Message } from 'discord.js'

/**
 * Command used for resetting user configuration
 */
export const ConfigResetCommand: Command = {
  name: 'reset',
  execute: async (message: Message, guildConfig: GuildConfig) => {
    const userConfig = await UserConfig.findOrCreate(message.author.id)
    const commandArgs = message.content.split(/ +/).slice(2)
    const attribute = commandArgs.shift()

    if (!attribute) {
      message.reply(await I18n.translate(
        guildConfig.locale,
        'commands:config.reset.noAttribute',
        {
          prefix: guildConfig.prefix,
        }
      ))
      return
    }

    switch (attribute) {
    case 'timezone':
      userConfig.timezone = null
      await userConfig.save()
      message.reply(await I18n.translate(
        guildConfig.locale,
        'commands:config.reset.timezone'
      ))
      break
    case 'crossGuild':
      userConfig.crossGuild = true
      await userConfig.save()
      message.reply(await I18n.translate(
        guildConfig.locale,
        'commands:config.reset.crossGuild'
      ))
      break
    default:
      message.reply(await I18n.translate(
        guildConfig.locale,
        'commands:config.reset.notAnAttribute',
        {
          attribute,
          prefix: guildConfig.prefix,
        }
      ))
    }
  },
}
