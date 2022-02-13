import { Commands } from '..'
import { GuildConfig } from '../../models'
import { WinnieClient } from '../../core'

async function deployCommands (guildConfig: GuildConfig): Promise<void> {
  if (!WinnieClient.isLoggedIn()) { return }

  const guild = await WinnieClient.client.guilds.fetch(guildConfig.id)
  if (guild == null) { return }

  await guild.commands.set(await Commands.commandData(guildConfig.locale))
}

export { deployCommands }
