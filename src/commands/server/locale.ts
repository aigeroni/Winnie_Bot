import { CommandInteraction } from 'discord.js'
import { CommandUtils } from '../utils'
import { GuildConfig } from '../../models'
import { I18n, Logger } from '../../core'
import { SubCommand } from '../../types'

const NAME = 'locale'

export const ServerLocaleCommand: SubCommand = {
  name: NAME,
  commandData: async (currentLocale: string) => ({
    name: NAME,
    description: await I18n.translate(currentLocale, 'commands:server.locale.description'),
    type: 'SUB_COMMAND_GROUP',
    options: [
      {
        name: 'get',
        description: await I18n.translate(currentLocale, 'commands:server.locale.get.description'),
        type: 'SUB_COMMAND'
      },
      {
        name: 'reset',
        description: await I18n.translate(currentLocale, 'commands:server.locale.reset.description'),
        type: 'SUB_COMMAND'
      },
      {
        name: 'set',
        description: await I18n.translate(currentLocale, 'commands:server.locale.set.description'),
        type: 'SUB_COMMAND',
        options: [
          {
            name: 'locale',
            description: await I18n.translate(currentLocale, 'commands:server.locale.set.args.locale'),
            type: 'STRING',
            required: true,
            choices: await Promise.all(I18n.SUPPORTED_LANGUAGES.map(async (localeCode) => {
              return {
                name: await I18n.translate(currentLocale, `locale:${localeCode}`),
                value: localeCode
              }
            }))
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
  Logger.info(interaction.options.getString('locale', true))
  guildConfig.locale = interaction.options.getString('locale', true)
  await guildConfig.save()

  if (guildConfig.errors.length > 0) {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:server.locale.set.error'))
    return
  }

  await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:server.locale.set.success', {
    locale: await I18n.translate(guildConfig.locale, 'winnie:locale.name')
  }))

  try {
    await CommandUtils.deployCommands(guildConfig)
  } catch {
    await interaction.followUp(await I18n.translate(guildConfig.locale, 'commands:deploy.error'))
    return
  }

  await interaction.followUp(await I18n.translate(guildConfig.locale, 'commands:deploy.success'))
}
