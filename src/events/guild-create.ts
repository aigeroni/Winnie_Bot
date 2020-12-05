import { Event } from '../core/types'
import { Guild } from 'discord.js'
import { GuildConfig } from '../models'

const GuildCreateEvent: Event = {
  name: 'guildCreate',
  handle: async (guild: Guild): Promise<void> => {
    let guildConfig = await GuildConfig.findOne(guild.id)
    if (guildConfig) { return }

    guildConfig = new GuildConfig(guild.id)
    guildConfig.save()
  },
}

export default GuildCreateEvent
