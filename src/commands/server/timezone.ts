import { CommandInteraction } from 'discord.js'
import { GuildConfig } from '../../models'
import { I18n } from '../../core'
import { IANAZone } from 'luxon'
import { SubCommand } from '../../types'

const NAME = 'timezone'

export const ServerTimezoneCommand: SubCommand = {
  name: NAME,
  commandData: async (locale: string) => ({
    name: NAME,
    description: await I18n.translate(locale, 'commands:server.timezone.description'),
    type: 'SUB_COMMAND_GROUP',
    options: [
      {
        name: 'get',
        description: await I18n.translate(locale, 'commands:server.timezone.get.description'),
        type: 'SUB_COMMAND'
      },
      {
        name: 'reset',
        description: await I18n.translate(locale, 'commands:server.timezone.reset.description'),
        type: 'SUB_COMMAND'
      },
      {
        name: 'set',
        description: await I18n.translate(locale, 'commands:server.timezone.set.description'),
        type: 'SUB_COMMAND',
        options: [
          {
            name: 'timezone',
            description: await I18n.translate(locale, 'commands:server.timezone.set.args.timezone'),
            type: 'STRING',
            required: true
          }
        ]
      }
    ]
  }),

  execute: async (interaction: CommandInteraction, guildConfig: GuildConfig) => {
    const subcommand = interaction.options.getSubcommand()
    if (subcommand == null) { return }

    switch (subcommand) {
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
  if (guildConfig.timezone == null) {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:server.timezone.get.error.notSet'))
  } else {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:server.timezone.get.success', {
      timezone: guildConfig.timezone.name
    }))
  }
}

async function reset (interaction: CommandInteraction, guildConfig: GuildConfig): Promise<void> {
  guildConfig.timezone = null
  await guildConfig.save()

  if (guildConfig.errors.length > 0) {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:server.timezone.reset.error'))
  } else {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:server.timezone.reset.success'))
  }
}

async function set (interaction: CommandInteraction, guildConfig: GuildConfig): Promise<void> {
  const timezone = interaction.options.getString('timezone', true)
  guildConfig.timezone = new IANAZone(timezone)
  await guildConfig.save()

  if (guildConfig.errors.length > 0) {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:server.timezone.set.error'))
  } else {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:server.timezone.set.success', {
      timezone: guildConfig.timezone.name
    }))
  }
}
