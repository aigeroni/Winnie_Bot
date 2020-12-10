import { Event } from '../core/types'
import { Guild } from 'discord.js'
import { GuildConfig } from '../models'

const GuildCreateEvent: Event = {
  name: 'guildCreate',
  handle: async (guild: Guild): Promise<void> => {
    await GuildConfig.findOrCreate(guild.id)
  },
}

export default GuildCreateEvent
