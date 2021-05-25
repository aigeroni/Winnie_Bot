import { Command } from '../../types/command'
import { GuildConfig } from '../../models'
import { I18n } from '../../core/i18n'
import { Message } from 'discord.js'

/**
 * Command used for getting, setting, and resetting a guild's accouncements channel.
 */
export const ServerAnnouncementsChannelCommand: Command = {
  name: 'announcementchannel',
  execute: async (message: Message, guildConfig: GuildConfig) => {
    const commandArgs = message.content.split(/ +/).slice(2)
    const command = commandArgs.shift()

    if (command == null) {
      await message.reply(await I18n.translate(guildConfig.locale, 'commands:server.announcement.noCommand', {
        prefix: guildConfig.prefix
      }))
      return
    }

    switch (command) {
      case 'get':
        await getAnnouncementsChannel(message, guildConfig)
        break
      case 'set':
        await setAnnouncementsChannel(message, guildConfig)
        break
      case 'reset':
        await resetAnnouncementsChannel(message, guildConfig)
        break
      default:
        await message.reply(await I18n.translate(guildConfig.locale, 'commands:server.announcement.unknownCommand', {
          prefix: guildConfig.prefix
        }))
    }
  }
}

/**
 * Gets the current channel for the guild.
 *
 * @param message The message which triggered the command.
 * @param guildConfig The configuration object for the guild.
 */
async function getAnnouncementsChannel (message: Message, guildConfig: GuildConfig): Promise<void> {
  if (guildConfig.announcementsChannelId != null) {
    await message.reply(await I18n.translate(guildConfig.locale, 'commands:server.announcement.get', {
      channel: guildConfig.announcementsChannelId
    }))
  } else {
    await message.reply(await I18n.translate(guildConfig.locale, 'commands:server.announcement.notSet', {
      prefix: guildConfig.prefix
    }))
  }
}

/**
 * Sets a new channel for the guild.
 *
 * @param message The message which triggered the command.
 * @param guildConfig The configuration object for the guild.
 */
async function setAnnouncementsChannel (message: Message, guildConfig: GuildConfig): Promise<void> {
  const newChannelId = message.mentions.channels.firstKey() // Grab the ID of the first channel mentioned

  if (newChannelId == null) {
    await message.reply(await I18n.translate(guildConfig.locale, 'commands:server.announcement.noChannel'))
    return
  }

  guildConfig.announcementsChannelId = newChannelId
  await guildConfig.save()

  if (guildConfig.errors.length > 0) {
    await message.reply(await I18n.translate(guildConfig.locale, 'commands:server.announcement.invalid'))
  } else {
    await message.reply(await I18n.translate(guildConfig.locale, 'commands:server.announcement.set', {
      channel: guildConfig.announcementsChannelId
    }))
  }
}

/**
 * Reset the guild's channel to the default.
 *
 * @param message The message which triggered the command.
 * @param guildConfig The configuration object for the guild.
 */
async function resetAnnouncementsChannel (message: Message, guildConfig: GuildConfig): Promise<void> {
  guildConfig.announcementsChannelId = null
  await guildConfig.save()

  await message.reply(await I18n.translate(guildConfig.locale, 'commands:server.announcement.reset'))
}
