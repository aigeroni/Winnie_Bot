import { Command } from '../../types/command'
import { GuildConfig } from '../../models'
import { I18n } from '../../core/i18n'
import { Message } from 'discord.js'

/**
 * Command used for getting, setting, and resetting a guild's command prefix.
 */
export const ServerPrefixCommand: Command = {
  name: 'prefix',
  execute: async (message: Message, guildConfig: GuildConfig) => {
    const commandArgs = message.content.split(/ +/).slice(2)
    const command = commandArgs.shift()

    if (command == null) {
      await message.reply(await I18n.translate(guildConfig.locale, 'commands:server.prefix.noCommand', {
        prefix: guildConfig.prefix
      }))
      return
    }

    switch (command) {
      case 'get':
        await getPrefix(message, guildConfig)
        break
      case 'set':
        await setPrefix(message, guildConfig, commandArgs.shift())
        break
      case 'reset':
        await resetPrefix(message, guildConfig)
        break
      default:
        await message.reply(await I18n.translate(guildConfig.locale, 'commands:server.prefix.unknownCommand', {
          prefix: guildConfig.prefix
        }))
    }
  }
}

/**
 * Gets the current prefix for the guild.
 *
 * @param message The message which triggered the command.
 * @param guildConfig The configuration object for the guild.
 */
async function getPrefix (message: Message, guildConfig: GuildConfig): Promise<void> {
  await message.reply(await I18n.translate(guildConfig.locale, 'commands:server.prefix.get', {
    prefix: guildConfig.prefix
  }))
}

/**
 * Sets a new prefix for the guild.
 *
 * @param message The message which triggered the command.
 * @param guildConfig The configuration object for the guild.
 * @param prefix The new prefix to use for the guild
 */
async function setPrefix (message: Message, guildConfig: GuildConfig, prefix?: string): Promise<void> {
  if (prefix == null) {
    await message.reply(await I18n.translate(guildConfig.locale, 'commands:server.prefix.noPrefix'))
    return
  }

  guildConfig.prefix = prefix
  await guildConfig.save()

  if (guildConfig.errors.length > 0) {
    await message.reply(await I18n.translate(guildConfig.locale, 'commands:server.prefix.invalid', { prefix }))
  } else {
    await message.reply(await I18n.translate(guildConfig.locale, 'commands:server.prefix.set', {
      prefix: guildConfig.prefix
    }))
  }
}

/**
 * Reset the guild's command prefix to the default.
 *
 * @param message The message which triggered the command.
 * @param guildConfig The configuration object for the guild.
 */
async function resetPrefix (message: Message, guildConfig: GuildConfig): Promise<void> {
  guildConfig.prefix = GuildConfig.DEFAULT_PREFIX
  await guildConfig.save()

  await message.reply(await I18n.translate(guildConfig.locale, 'commands:server.prefix.reset', {
    prefix: guildConfig.prefix
  }))
}
