import { CommandInteraction } from 'discord.js'
import { GuildConfig } from '../../models'
import { I18n } from '../../core/i18n'
import { SubCommand } from '../../types/subcommand'

const NAME = 'locale'

export const ServerLocaleCommand: SubCommand = {
  name: NAME,
  commandData: async (locale: string) => ({
    name: NAME,
    description: await I18n.translate(locale, 'commands:server.locale.description'),
    type: 'SUB_COMMAND_GROUP',
    options: [
      {
        name: 'get',
        description: await I18n.translate(locale, 'commands:server.locale.get.description'),
        type: 'SUB_COMMAND'
      },
      {
        name: 'reset',
        description: await I18n.translate(locale, 'commands:server.locale.reset.description'),
        type: 'SUB_COMMAND'
      },
      {
        name: 'set',
        description: await I18n.translate(locale, 'commands:server.locale.set.description'),
        type: 'SUB_COMMAND',
        options: [
          {
            name: 'locale',
            description: await I18n.translate(locale, 'commands:server.locale.set.args.locale'),
            type: 'STRING',
            required: true,
            choices: await Promise.all(I18n.SUPPORTED_LANGUAGES.map(async (locale) => {
              return {
                name: await I18n.translate(locale, 'winnie:locale.name'),
                value: locale
              }
            }))
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
  await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:server.locale.get.success', {
    locale: await I18n.translate(guildConfig.locale, 'winnie:locale.name')
  }))
}

async function reset (interaction: CommandInteraction, guildConfig: GuildConfig): Promise<void> {
  guildConfig.locale = GuildConfig.DEFAULT_LOCALE
  await guildConfig.save()

  if (guildConfig.errors.length > 0) {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:server.locale.reset.error'))
  } else {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:server.locale.reset.success', {
      locale: await I18n.translate(guildConfig.locale, 'winnie:locale.name')
    }))
  }
}

async function set (interaction: CommandInteraction, guildConfig: GuildConfig): Promise<void> {
  const subcommandGroup = interaction.options[0]
  const subcommand = subcommandGroup.options == null ? undefined : subcommandGroup.options[0]
  if (subcommand == null) { return }

  const option = subcommand.options == null ? undefined : subcommand.options[0]
  if (option == null) { return }

  const locale = option.value as string

  guildConfig.locale = locale
  await guildConfig.save()

  if (guildConfig.errors.length > 0) {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:server.locale.set.error'))
  } else {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:server.locale.set.success', {
      locale: await I18n.translate(guildConfig.locale, 'winnie:locale.name')
    }))
  }
}
