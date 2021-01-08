import { Command } from '../../types/command'
import { GuildConfig, UserConfig } from '../../models'
import { I18n } from '../../core/i18n'
import { IANAZone } from 'luxon'
import { Message } from 'discord.js'

/**
 * Sets a new timezone for a user.
 *
 * @param message The message from which the command was ran
 * @param guildConfig the config object for the current guild
 * @param userConfig the userConfig being modified
 * @param timezone the new timezone
 */
const setTimezone = async (
  message: Message,
  guildConfig: GuildConfig,
  userConfig: UserConfig,
  timezone?: string
): Promise<void> => {
  if (!timezone) {
    message.reply(await I18n.translate(
      guildConfig.locale,
      'commands:config.set.noValue',
      {
        attribute: 'timezone',
        prefix: guildConfig.prefix,
      }
    ))
    return
  }

  userConfig.timezone = new IANAZone(timezone)
  await userConfig.save()

  if (userConfig.errors.length > 0) {
    message.reply(await I18n.translate(guildConfig.locale, 'commands:config.set.invalidTimezone', { timezone }))
  } else {
    message.reply(await I18n.translate(
      guildConfig.locale,
      'commands:config.set.timezoneSet',
      {
        timezone: userConfig.timezone.name,
      }
    ))
  }
}

/**
 * Updates the cross guild attribute.
 *
 * @param message The message from which the command was ran
 * @param guildConfig the config object for the current guild
 * @param userConfig the userConfig being modified
 * @param crossGuild the new value of the cross guild attribute
 */
const setCrossGuild = async (
  message: Message,
  guildConfig: GuildConfig,
  userConfig: UserConfig,
  crossGuild?: string
): Promise<void> => {
  if (!crossGuild) {
    message.reply(await I18n.translate(
      guildConfig.locale,
      'commands:config.set.noValue',
      {
        attribute: 'cross guild',
        prefix: guildConfig.prefix,
      }
    ))
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
    message.reply(await I18n.translate(
      guildConfig.locale,
      'commands:config.set.crossGuildSet',
      {
        crossGuild: userConfig.crossGuild,
      }
    ))
  }
}

/**
 * Command used for updating user configuration
 */
export const ConfigSetCommand: Command = {
  name: 'set',
  execute: async (message: Message, guildConfig: GuildConfig) => {
    const userConfig = await UserConfig.findOrCreate(message.author.id)
    const commandArgs = message.content.split(/ +/).slice(2)
    const attribute = commandArgs.shift()

    if (!attribute) {
      message.reply(await I18n.translate(
        guildConfig.locale,
        'commands:config.set.noAttribute',
        {
          prefix: guildConfig.prefix,
        }
      ))
      return
    }

    switch (attribute) {
    case 'timezone':
      await setTimezone(message, guildConfig, userConfig, commandArgs.shift())
      break
    case 'crossGuild':
      await setCrossGuild(message, guildConfig, userConfig, commandArgs.shift())
      break
    default:
      message.reply(await I18n.translate(
        guildConfig.locale,
        'commands:config.set.notAnAttribute',
        {
          attribute,
          prefix: guildConfig.prefix,
        }
      ))
    }
  },
}
