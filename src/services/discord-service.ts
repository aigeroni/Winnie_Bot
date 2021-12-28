import { Snowflake, Guild, GuildChannel, TextChannel } from 'discord.js'
import { Logger, WinnieClient } from '../core'
import { GuildConfig } from '../models'

async function getGuildFromChannel (channelId: Snowflake): Promise<Guild | undefined> {
  if (!WinnieClient.isLoggedIn()) { return }

  const channel = await WinnieClient.client.channels.fetch(channelId)
  if (channel == null) { return }

  if (channel instanceof GuildChannel) {
    return channel.guild
  }
}

async function sendMessageToChannel (channelId: Snowflake, getMessage: (guildConfig: GuildConfig) => Promise<string>): Promise<void> {
  const guild = await getGuildFromChannel(channelId)
  const channel = (await WinnieClient.client.channels.fetch(channelId)) as TextChannel
  if (guild == null || channel == null) { return }

  const guildConfig = await GuildConfig.findOrCreate(guild.id)

  const message = await getMessage(guildConfig)
  try {
    await channel.send(message)
  } catch (error) {
    Logger.error(`Unable to send message to channel ${channel.id}`)
  }
}

export const DiscordService = {
  getGuildFromChannel,
  sendMessageToChannel
}
