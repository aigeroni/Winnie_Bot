import { Command } from '../../types/command'
import { GuildConfig } from '../../models'
import { I18n } from '../../core/i18n'
import { Message } from 'discord.js'

/**
 * Command used for getting, setting, and resetting a guild's locale.
 */
export const ServerLocaleCommand: Command = {
  name: 'locale',
  execute: async (message: Message, guildConfig: GuildConfig) => {
    const commandArgs = message.content.split(/ +/).slice(2)
    const command = commandArgs.shift()

    if (command == null) {
      await message.reply(await I18n.translate(guildConfig.locale, 'commands:server.locale.noCommand', {
        prefix: guildConfig.prefix
      }))
      return
    }

    switch (command) {
      case 'get':
        await getLocale(message, guildConfig)
        break
      case 'set':
        await setLocale(message, guildConfig, commandArgs.shift())
        break
      case 'reset':
        await resetLocale(message, guildConfig)
        break
      default:
        await message.reply(await I18n.translate(guildConfig.locale, 'commands:server.locale.unknownCommand', {
          prefix: guildConfig.prefix
        }))
    }
  }
}

/**
 * Gets the current locale for the guild.
 *
 * @param message The message which triggered the command.
 * @param guildConfig The configuration object for the guild.
 */
async function getLocale (message: Message, guildConfig: GuildConfig): Promise<void> {
  await message.reply(await I18n.translate(guildConfig.locale, 'commands:server.locale.get', {
    locale: guildConfig.locale
  }))
}

/**
 * Sets a new locale for the guild.
 *
 * @param message The message which triggered the command.
 * @param guildConfig The configuration object for the guild.
 * @param prefix The new prefix to use for the guild
 */
async function setLocale (message: Message, guildConfig: GuildConfig, locale?: string): Promise<void> {
  if (locale == null) {
    await message.reply(await I18n.translate(guildConfig.locale, 'commands:server.locale.noLocale'))
    return
  }

  const oldLocale = guildConfig.locale

  guildConfig.locale = locale
  await guildConfig.save()

  if (guildConfig.errors.length > 0) {
    guildConfig.locale = oldLocale
    await message.reply(await I18n.translate(oldLocale, 'commands:server.locale.invalid', {
      locale,
      locales: I18n.SUPPORTED_LANGUAGES.toString()
    }))
  } else {
    await message.reply(await I18n.translate(guildConfig.locale, 'commands:server.locale.set', {
      locale: guildConfig.locale
    }))
  }
}

/**
 * Reset the guild's command locale to the default.
 *
 * @param message The message which triggered the command.
 * @param guildConfig The configuration object for the guild.
 */
async function resetLocale (message: Message, guildConfig: GuildConfig): Promise<void> {
  guildConfig.locale = GuildConfig.DEFAULT_LOCALE
  await guildConfig.save()

  await message.reply(await I18n.translate(guildConfig.locale, 'commands:server.locale.reset', {
    locale: guildConfig.locale
  }))
}
