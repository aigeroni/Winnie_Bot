import { WinnieClient } from '../../core/winnie-client'
import { GuildConfig } from '../../models'
import { Commands } from '..'

async function deployCommands (guildConfig: GuildConfig): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    await WinnieClient.client.application?.commands.set(await Commands.commandData(GuildConfig.DEFAULT_LOCALE))
  } else {
    const guild = await WinnieClient.client.guilds.fetch(guildConfig.id)
    if (guild == null) { return }

    await guild.commands.set(await Commands.commandData(guildConfig.locale))
  }
}

export { deployCommands }
