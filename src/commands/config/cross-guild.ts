import { ChatInputCommandInteraction, SlashCommandSubcommandGroupBuilder } from 'discord.js'
import { Command } from '../../types'
import { GuildConfig, UserConfig } from '../../models'
import { I18n } from '../../core'

const NAME = 'cross_guild'

export const ConfigCrossGuildCommand: Command = {
  name: NAME,
  data: async (locale: string) => {
    const commandDescription = await I18n.translate(locale, 'commands:config.crossGuild.description')
    const getCommandDescription = await I18n.translate(locale, 'commands:config.crossGuild.get.description')
    const resetCommandDescription = await I18n.translate(locale, 'commands:config.crossGuild.reset.description')
    const setCommandDescription = await I18n.translate(locale, 'commands:config.crossGuild.set.description')
    const setCommandOptionDescription = await I18n.translate(locale, 'commands:config.crossGuild.set.args.enabled')

    return new SlashCommandSubcommandGroupBuilder()
      .setName(NAME)
      .setDescription(commandDescription)
      .addSubcommand((subcommand) => subcommand.setName('get').setDescription(getCommandDescription))
      .addSubcommand((subcommand) => subcommand.setName('reset').setDescription(resetCommandDescription))
      .addSubcommand((subcommand) => (
        subcommand
          .setName('set')
          .setDescription(setCommandDescription)
          .addBooleanOption((option) => (
            option.setName('enabled').setDescription(setCommandOptionDescription).setRequired(true)
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
  const key = userConfig.crossGuild ? 'enabled' : 'disabled'

  await interaction.reply(await I18n.translate(guildConfig.locale, `commands:config.crossGuild.get.${key}`))
}

async function reset (interaction: ChatInputCommandInteraction, guildConfig: GuildConfig): Promise<void> {
  const userConfig = await UserConfig.findOrCreate(interaction.user.id)
  userConfig.crossGuild = true
  await userConfig.save()

  if (userConfig.errors.length > 0) {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:config.crossGuild.reset.error'))
  } else {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:config.crossGuild.reset.success'))
  }
}

async function set (interaction: ChatInputCommandInteraction, guildConfig: GuildConfig): Promise<void> {
  const userConfig = await UserConfig.findOrCreate(interaction.user.id)
  userConfig.crossGuild = interaction.options.getBoolean('enabled', true)
  await userConfig.save()

  if (userConfig.errors.length > 0) {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:config.crossGuild.set.error'))
  } else {
    if (userConfig.crossGuild) {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:config.crossGuild.set.enabled'))
    } else {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:config.crossGuild.set.disabled'))
    }
  }
}
