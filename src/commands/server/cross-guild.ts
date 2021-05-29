import { CommandInteraction } from 'discord.js'
import { GuildConfig } from '../../models'
import { I18n } from '../../core/i18n'
import { SubCommand } from '../../types/subcommand'

const NAME = 'cross_guild'

export const ServerCrossGuildCommand: SubCommand = {
  name: NAME,
  commandData: async (locale: string) => ({
    name: NAME,
    description: await I18n.translate(locale, 'commands:server.crossGuild.description'),
    type: 'SUB_COMMAND_GROUP',
    options: [
      {
        name: 'get',
        description: await I18n.translate(locale, 'commands:server.crossGuild.get.description'),
        type: 'SUB_COMMAND'
      },
      {
        name: 'reset',
        description: await I18n.translate(locale, 'commands:server.crossGuild.reset.description'),
        type: 'SUB_COMMAND'
      },
      {
        name: 'set',
        description: await I18n.translate(locale, 'commands:server.crossGuild.set.description'),
        type: 'SUB_COMMAND',
        options: [
          {
            name: 'enabled',
            description: await I18n.translate(locale, 'commands:server.crossGuild.set.args.enabled'),
            type: 'BOOLEAN',
            required: true
          }
        ]
      }
    ]
  }),

  execute: async (interaction: CommandInteraction, guildConfig: GuildConfig) => {
    const subcommandGroup = interaction.options[0]
    const subcommand = subcommandGroup.options == null ? undefined : subcommandGroup.options[0]
    if (subcommand == null) { return }

    switch (subcommand.name) {
      case 'get':
        await get(interaction, guildConfig)
        break
      case 'reset':
        await reset(interaction, guildConfig)
        break
      case 'set':
        await set(interaction, guildConfig)
        break
    }
  }
}

async function get (interaction: CommandInteraction, guildConfig: GuildConfig): Promise<void> {
  const key = guildConfig.crossGuild ? 'enabled' : 'disabled'

  await interaction.reply(await I18n.translate(guildConfig.locale, `commands:server.crossGuild.get.${key}`))
}

async function reset (interaction: CommandInteraction, guildConfig: GuildConfig): Promise<void> {
  guildConfig.crossGuild = true
  await guildConfig.save()

  if (guildConfig.errors.length > 0) {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:server.crossGuild.reset.error'))
  } else {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:server.crossGuild.reset.success'))
  }
}

async function set (interaction: CommandInteraction, guildConfig: GuildConfig): Promise<void> {
  const subcommandGroup = interaction.options[0]
  const subcommand = subcommandGroup.options == null ? undefined : subcommandGroup.options[0]
  if (subcommand == null) { return }

  const option = subcommand.options == null ? undefined : subcommand.options[0]
  if (option == null) { return }

  // This should be a safe cast since the option type is defined as a boolean
  guildConfig.crossGuild = option.value as boolean
  await guildConfig.save()

  if (guildConfig.errors.length > 0) {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:server.crossGuild.set.error'))
  } else {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:server.crossGuild.set.success', {
      crossGuild: guildConfig.crossGuild
    }))
  }
}
