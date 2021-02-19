import { Command } from '../../types/command'
import { GuildConfig, UserConfig } from '../../models'
import { I18n } from '../../core/i18n'
import { Message } from 'discord.js'

/**
 * Updates the cross guild attribute.
 *
 * @param message The message from which the command was ran
 * @param guildConfig the config object for the current guild
 * @param userConfig the userConfig being modified
 * @param crossGuild the new value of the cross guild attribute
 */
const setCrossGuild = async (
  message: Message, guildConfig: GuildConfig, userConfig: UserConfig, crossGuild?: string
): Promise<void> => {
  if (!crossGuild) {
    message.reply(await I18n.translate(guildConfig.locale, 'commands:config.set.noValue', {
      prefix: guildConfig.prefix,
    }))
    return
  }

  if (crossGuild.toLowerCase() === 'true') {
    userConfig.crossGuild = true
  } else if (crossGuild.toLowerCase() === 'false') {
    userConfig.crossGuild = false
  } else {
    message.reply(await I18n.translate(guildConfig.locale, 'commands:config.set.invalidCrossGuild'))
    return
  }

  await userConfig.save()

  if (userConfig.errors.length > 0) {
    message.reply(await I18n.translate(guildConfig.locale, 'commands:config.set.invalidCrossGuild'))
  } else {
    message.reply(await I18n.translate(guildConfig.locale, 'commands:config.set.crossGuildSet', {
      crossGuild: userConfig.crossGuild,
    }))
  }
}

/**
 * Command used for getting, setting, and resetting user cross guild settings
 */
export const ConfigCrossGuildCommand: Command = {
  name: 'crossGuild',
  execute: async (message: Message, guildConfig: GuildConfig) => {
    const userConfig = await UserConfig.findOrCreate(message.author.id)
    const commandArgs = message.content.split(/ +/).slice(2)
    const command = commandArgs.shift()

    if (!command) {
      message.reply(await I18n.translate(guildConfig.locale, 'commands:config.crossGuild.noCommand', {
        prefix: guildConfig.prefix,
      }))
      return
    }

    switch (command) {
    case 'get':
      message.reply(await I18n.translate(
        guildConfig.locale,
        `commands:config.get.crossGuild${userConfig.crossGuild ? 'Enabled' : 'Disabled'}`
      ))
      break
    case 'set':
      setCrossGuild(message, guildConfig, userConfig, commandArgs.shift())
      break
    case 'reset':
      userConfig.crossGuild = true
      await userConfig.save()
      message.reply(await I18n.translate(guildConfig.locale, 'commands:config.crossGuild.reset'))
      break
    default:
      message.reply(await I18n.translate(guildConfig.locale, 'commands:config.crossGuild.unknownCommand', {
        prefix: guildConfig.prefix,
      }))
    }
  },
}
