import { Command } from '../../types/command'
import { GuildConfig, UserConfig } from '../../models'
import { I18n } from '../../core/i18n'
import { Message } from 'discord.js'

/**
 * Command used for reading user configuration
 */
export const ConfigGetCommand: Command = {
  name: 'get',
  execute: async (message: Message, guildConfig: GuildConfig) => {
    const userConfig = await UserConfig.findOrCreate(message.author.id)
    const commandArgs = message.content.split(/ +/).slice(2)
    const attribute = commandArgs.shift()

    if (!attribute) {
      message.reply(await I18n.translate(
        guildConfig.locale,
        'commands:config.get.noAttribute',
        {
          prefix: guildConfig.prefix,
        }
      ))
      return
    }

    switch (attribute) {
    case 'timezone':
      if (userConfig.timezone) {
        message.reply(await I18n.translate(
          guildConfig.locale,
          'commands:config.get.timezone',
          {
            timezone: userConfig.timezone.name,
          }
        ))
      } else {
        message.reply(await I18n.translate(
          guildConfig.locale,
          'commands:config.get.timezoneNotSet',
          {
            prefix: guildConfig.prefix,
          }
        ))
      }
      break
    case 'crossGuild':
      message.reply(await I18n.translate(
        guildConfig.locale,
        `commands:config.get.crossGuild${userConfig.crossGuild ? 'Enabled' : 'Disabled'}`
      ))
      break
    default:
      message.reply(await I18n.translate(
        guildConfig.locale,
        'commands:config.get.notAnAttribute',
        {
          attribute,
          prefix: guildConfig.prefix,
        }
      ))
    }
  },
}
