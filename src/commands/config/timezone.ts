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
  message: Message, guildConfig: GuildConfig, userConfig: UserConfig, timezone?: string
): Promise<void> => {
  if (timezone == null) {
    await message.reply(await I18n.translate(guildConfig.locale, 'commands:config.timezone.noValue', {
      prefix: guildConfig.prefix
    }))
    return
  }

  userConfig.timezone = new IANAZone(timezone)
  await userConfig.save()

  if (userConfig.errors.length > 0) {
    await message.reply(await I18n.translate(guildConfig.locale, 'commands:config.timezone.invalid', { timezone }))
  } else {
    await message.reply(await I18n.translate(guildConfig.locale, 'commands:config.timezone.set', {
      timezone: userConfig.timezone.name
    }))
  }
}

/**
 * Command used for getting, setting, and resetting user timezone settings
 */
export const ConfigTimezoneCommand: Command = {
  name: 'timezone',
  execute: async (message: Message, guildConfig: GuildConfig) => {
    const userConfig = await UserConfig.findOrCreate(message.author.id)
    const commandArgs = message.content.split(/ +/).slice(2)
    const command = commandArgs.shift()

    if (command == null) {
      await message.reply(await I18n.translate(guildConfig.locale, 'commands:config.timezone.noCommand', {
        prefix: guildConfig.prefix
      }))
      return
    }

    switch (command) {
      case 'get':
        if (userConfig.timezone != null) {
          await message.reply(await I18n.translate(guildConfig.locale, 'commands:config.timezone.get', {
            timezone: userConfig.timezone.name
          }))
        } else {
          await message.reply(await I18n.translate(guildConfig.locale, 'commands:config.timezone.notSet', {
            prefix: guildConfig.prefix
          }))
        }
        break
      case 'set':
        await setTimezone(message, guildConfig, userConfig, commandArgs.shift())
        break
      case 'reset':
        userConfig.timezone = null
        await userConfig.save()
        await message.reply(await I18n.translate(guildConfig.locale, 'commands:config.timezone.reset'))
        break
      default:
        await message.reply(await I18n.translate(guildConfig.locale, 'commands:config.timezone.unknownCommand', {
          prefix: guildConfig.prefix
        }))
    }
  }
}
