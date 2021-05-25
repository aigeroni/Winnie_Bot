import { Command } from '../../types/command'
import { GuildConfig } from '../../models'
import { I18n } from '../../core/i18n'
import { IANAZone } from 'luxon'
import { Message } from 'discord.js'

/**
 * Command used for getting, setting, and resetting guild timezone settings
 */
export const ServerTimezoneCommand: Command = {
  name: 'timezone',
  execute: async (message: Message, guildConfig: GuildConfig) => {
    const commandArgs = message.content.split(/ +/).slice(2)
    const command = commandArgs.shift()

    if (command == null) {
      await message.reply(await I18n.translate(guildConfig.locale, 'commands:server.timezone.noCommand', {
        prefix: guildConfig.prefix
      }))
      return
    }

    switch (command) {
      case 'get':
        await getTimezone(message, guildConfig)
        break
      case 'set':
        await setTimezone(message, guildConfig, commandArgs.shift())
        break
      case 'reset':
        await resetTimezone(message, guildConfig)
        break
      default:
        await message.reply(await I18n.translate(guildConfig.locale, 'commands:server.timezone.unknownCommand', {
          prefix: guildConfig.prefix
        }))
    }
  }
}

/**
 * Gets the current timezone for the guild.
 *
 * @param message The message which triggered the command.
 * @param guildConfig The configuration object for the guild.
 */
async function getTimezone (message: Message, guildConfig: GuildConfig): Promise<void> {
  if (guildConfig.timezone != null) {
    await message.reply(await I18n.translate(guildConfig.locale, 'commands:server.timezone.get', {
      timezone: guildConfig.timezone.name
    }))
  } else {
    await message.reply(await I18n.translate(guildConfig.locale, 'commands:server.timezone.notSet', {
      prefix: guildConfig.prefix
    }))
  }
}

/**
 * Sets a new timezone for a guild.
 *
 * @param message The message from which the command was ran
 * @param guildConfig the config object for the current guild
 * @param timezone the new timezone
 */
async function setTimezone (message: Message, guildConfig: GuildConfig, timezone?: string): Promise<void> {
  if (timezone == null) {
    await message.reply(await I18n.translate(guildConfig.locale, 'commands:server.timezone.noValue', {
      prefix: guildConfig.prefix
    }))
    return
  }

  guildConfig.timezone = new IANAZone(timezone)
  await guildConfig.save()

  if (guildConfig.errors.length > 0) {
    await message.reply(await I18n.translate(guildConfig.locale, 'commands:server.timezone.invalid', { timezone }))
  } else {
    await message.reply(await I18n.translate(guildConfig.locale, 'commands:server.timezone.set', {
      timezone: guildConfig.timezone.name
    }))
  }
}

/**
 * Reset the guild's timezone to null.
 *
 * @param message The message which triggered the command.
 * @param guildConfig The configuration object for the guild.
 */
async function resetTimezone (message: Message, guildConfig: GuildConfig): Promise<void> {
  guildConfig.timezone = null
  await guildConfig.save()

  await message.reply(await I18n.translate(guildConfig.locale, 'commands:server.timezone.reset'))
}
