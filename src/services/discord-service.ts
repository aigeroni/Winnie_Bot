import { Snowflake, Guild, GuildChannel, TextChannel } from 'discord.js'
import { I18n, WinnieClient } from '../core'
import { GuildConfig } from '../models'

async function getGuildFromChannel (channelId: Snowflake): Promise<Guild | undefined> {
  if (!WinnieClient.isLoggedIn()) { return }

  const channel = await WinnieClient.client.channels.fetch(channelId)
  if (channel == null) { return }

  if (channel instanceof GuildChannel) {
    return channel.guild
  }
}

async function sendMessageToChannel (channelId: Snowflake, messageKey: string, interpolations?: Record<string, string | number | boolean>): Promise<void> {
  const guild = await getGuildFromChannel(channelId)
  const channel = (await WinnieClient.client.channels.fetch(channelId)) as TextChannel
  if (guild == null || channel == null) { return }

  const guildConfig = await GuildConfig.findOrCreate(guild.id)

  const message = await I18n.translate(guildConfig.locale, messageKey, interpolations)
  await channel.send(message)
}

export const DiscordService = {
  getGuildFromChannel,
  sendMessageToChannel
}
