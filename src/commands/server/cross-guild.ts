import { Command } from '../../types/command'
import { GuildConfig } from '../../models'
import { I18n } from '../../core/i18n'
import { Message } from 'discord.js'

/**
 * Command used for getting, setting, and resetting server cross guild settings
 */
export const ServerCrossGuildCommand: Command = {
  name: 'crossguild',
  execute: async (message: Message, guildConfig: GuildConfig) => {
    const commandArgs = message.content.split(/ +/).slice(2)
    const command = commandArgs.shift()

    if (command == null) {
      await message.reply(await I18n.translate(guildConfig.locale, 'commands:server.crossGuild.noCommand', {
        prefix: guildConfig.prefix
      }))
      return
    }

    switch (command) {
      case 'get':
        await getCrossGuild(message, guildConfig)
        break
      case 'set':
        await setCrossGuild(message, guildConfig, commandArgs.shift())
        break
      case 'reset':
        await resetCrossGuild(message, guildConfig)
        break
      default:
        await message.reply(await I18n.translate(guildConfig.locale, 'commands:server.crossGuild.unknownCommand', {
          prefix: guildConfig.prefix
        }))
    }
  }
}

/**
 * Gets the current vaule of the crossGuild setting.
 *
 * @param message The message which triggered the command.
 * @param guildConfig The configuration object for the guild.
 */
async function getCrossGuild (message: Message, guildConfig: GuildConfig): Promise<void> {
  await message.reply(await I18n.translate(
    guildConfig.locale,
    `commands:server.crossGuild.${guildConfig.crossGuild ? 'enabled' : 'disabled'}`
  ))
}

/**
 * Updates the cross guild attribute.
 *
 * @param message The message from which the command was ran
 * @param guildConfig the config object for the current guild
 * @param crossGuild the new value of the cross guild attribute
 */
async function setCrossGuild (message: Message, guildConfig: GuildConfig, crossGuild?: string): Promise<void> {
  if (crossGuild == null) {
    await message.reply(await I18n.translate(guildConfig.locale, 'commands:server.crossGuild.noValue', {
      prefix: guildConfig.prefix
    }))
    return
  }

  if (crossGuild.toLowerCase() === 'true') {
    guildConfig.crossGuild = true
  } else if (crossGuild.toLowerCase() === 'false') {
    guildConfig.crossGuild = false
  } else {
    await message.reply(await I18n.translate(guildConfig.locale, 'commands:server.crossGuild.invalid'))
    return
  }

  await guildConfig.save()

  if (guildConfig.errors.length > 0) {
    await message.reply(await I18n.translate(guildConfig.locale, 'commands:server.crossGuild.invalid'))
  } else {
    await message.reply(await I18n.translate(guildConfig.locale, 'commands:server.crossGuild.successfullySet', {
      crossGuild: guildConfig.crossGuild
    }))
  }
}

/**
 * Reset the guild's crossGuild setting.
 *
 * @param message The message which triggered the command.
 * @param guildConfig The configuration object for the guild.
 */
async function resetCrossGuild (message: Message, guildConfig: GuildConfig): Promise<void> {
  guildConfig.crossGuild = true
  await guildConfig.save()

  await message.reply(await I18n.translate(guildConfig.locale, 'commands:server.crossGuild.reset'))
}
