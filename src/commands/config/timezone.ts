import { ChatInputCommandInteraction, SlashCommandSubcommandGroupBuilder } from 'discord.js'
import { Command } from '../../types'
import { GuildConfig, UserConfig } from '../../models'
import { I18n } from '../../core'
import { IANAZone } from 'luxon'

const NAME = 'timezone'

export const ConfigTimezoneCommand: Command = {
  name: NAME,
  data: async (locale) => {
    const commandDescription = await I18n.translate(locale, 'commands:config.timezone.description')
    const getCommandDescription = await I18n.translate(locale, 'commands:config.timezone.get.description')
    const resetCommandDescription = await I18n.translate(locale, 'commands:config.timezone.reset.description')
    const setCommandDescription = await I18n.translate(locale, 'commands:config.timezone.set.description')
    const setCommandOptionDescription = await I18n.translate(locale, 'commands:config.timezone.set.args.timezone')

    return new SlashCommandSubcommandGroupBuilder()
      .setName(NAME)
      .setDescription(commandDescription)
      .addSubcommand((subcommand) => subcommand.setName('get').setDescription(getCommandDescription))
      .addSubcommand((subcommand) => subcommand.setName('reset').setDescription(resetCommandDescription))
      .addSubcommand((subcommand) => (
        subcommand
          .setName('set')
          .setDescription(setCommandDescription)
          .addStringOption((option) => (
            option.setName('timezone').setDescription(setCommandOptionDescription).setRequired(true)
          ))
      ))
  },
  execute: async (interaction: ChatInputCommandInteraction, guildConfig: GuildConfig, userConfig: UserConfig) => {
    const subcommand = interaction.options.getSubcommand()
    if (subcommand == null) { return }

    switch (subcommand) {
      case 'get':
        await get(interaction, guildConfig, userConfig)
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

async function get (interaction: ChatInputCommandInteraction, guildConfig: GuildConfig, userConfig: UserConfig): Promise<void> {
  if (userConfig.timezone == null) {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:config.timezone.get.error.notSet'))
  } else {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:config.timezone.get.success', {
      timezone: userConfig.timezone.name
    }))
  }
}

async function reset (interaction: ChatInputCommandInteraction, guildConfig: GuildConfig): Promise<void> {
  const userConfig = await UserConfig.findOrCreate(interaction.user.id)
  userConfig.timezone = null
  await userConfig.save()

  if (userConfig.errors.length > 0) {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:config.timezone.reset.error'))
  } else {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:config.timezone.reset.success'))
  }
}

async function set (interaction: ChatInputCommandInteraction, guildConfig: GuildConfig): Promise<void> {
  const userConfig = await UserConfig.findOrCreate(interaction.user.id)
  const timezone = interaction.options.getString('timezone', true)

  userConfig.timezone = new IANAZone(timezone)
  await userConfig.save()

  if (userConfig.errors.length > 0) {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:config.timezone.set.error.invalidValue'))
  } else {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:config.timezone.set.success', {
      timezone: userConfig.timezone.name
    }))
  }
}
