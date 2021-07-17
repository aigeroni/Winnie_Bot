import { CommandInteraction } from 'discord.js'
import { GuildConfig } from '../../models'
import { I18n } from '../../core'
import { SubCommand } from '../../types'

const NAME = 'announcements_channel'

export const ServerAnnouncementsChannelCommand: SubCommand = {
  name: NAME,
  commandData: async (locale: string) => ({
    name: NAME,
    description: await I18n.translate(locale, 'commands:server.announcementsChannel.description'),
    type: 'SUB_COMMAND_GROUP',
    options: [
      {
        name: 'get',
        description: await I18n.translate(locale, 'commands:server.announcementsChannel.get.description'),
        type: 'SUB_COMMAND'
      },
      {
        name: 'reset',
        description: await I18n.translate(locale, 'commands:server.announcementsChannel.reset.description'),
        type: 'SUB_COMMAND'
      },
      {
        name: 'set',
        description: await I18n.translate(locale, 'commands:server.announcementsChannel.set.description'),
        type: 'SUB_COMMAND',
        options: [
          {
            name: 'announcements_channel',
            description: await I18n.translate(locale, 'commands:server.announcementsChannel.set.args.announcementsChannel'),
            type: 'CHANNEL',
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
  if (guildConfig.announcementsChannelId == null) {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:server.announcementsChannel.get.errors.notSet'))
  } else {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:server.announcementsChannel.get.success', {
      announcementsChannel: guildConfig.announcementsChannelId
    }))
  }
}

async function reset (interaction: CommandInteraction, guildConfig: GuildConfig): Promise<void> {
  guildConfig.announcementsChannelId = null
  await guildConfig.save()

  if (guildConfig.errors.length > 0) {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:server.announcementsChannel.reset.error'))
  } else {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:server.announcementsChannel.reset.success'))
  }
}

async function set (interaction: CommandInteraction, guildConfig: GuildConfig): Promise<void> {
  const subcommandGroup = interaction.options[0]
  const subcommand = subcommandGroup.options == null ? undefined : subcommandGroup.options[0]
  if (subcommand == null) { return }

  const option = subcommand.options == null ? undefined : subcommand.options[0]
  if (option == null) { return }

  const announcementsChannel = option.value as string

  guildConfig.announcementsChannelId = announcementsChannel
  await guildConfig.save()

  if (guildConfig.errors.length > 0) {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:server.announcementsChannel.set.error'))
  } else {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:server.announcementsChannel.set.success', {
      announcementsChannel: guildConfig.announcementsChannelId
    }))
  }
}
