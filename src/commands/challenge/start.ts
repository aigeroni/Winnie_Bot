import { CommandInteraction } from 'discord.js'
import { Jobs } from '../../jobs'
import { Challenge, GuildConfig } from '../../models'
import { ChallengeService } from '../../services'
import { I18n } from '../../core'
import { ChainWarCreateOptions, RaceCreateOptions, WarCreateOptions, RaceTypes, SubCommand, StartChallengeJobData } from '../../types'

const NAME = 'start'

export const ChallengeStartCommand: SubCommand = {
  name: NAME,
  commandData: async (locale: string) => ({
    name: NAME,
    description: await I18n.translate(locale, 'commands:challenge.start.description'),
    type: 'SUB_COMMAND_GROUP',
    options: [
      {
        name: 'chain',
        description: await I18n.translate(locale, 'commands:challenge.start.chain.description'),
        type: 'SUB_COMMAND',
        options: [
          {
            name: 'chain_length',
            description: await I18n.translate(locale, 'commands:challenge.start.chain.length.description'),
            type: 'INTEGER',
            required: true
          },
          {
            name: 'delay',
            description: await I18n.translate(locale, 'commands:challenge.start.chain.delay.description'),
            type: 'INTEGER',
            required: false
          },
          {
            name: 'duration',
            description: await I18n.translate(locale, 'commands:challenge.start.chain.duration.description'),
            type: 'INTEGER',
            required: false
          },
          {
            name: 'join',
            description: await I18n.translate(locale, 'commands:challenge.start.chain.join.description'),
            type: 'BOOLEAN',
            required: false
          },
          {
            name: 'name',
            description: await I18n.translate(locale, 'commands:challenge.start.chain.name.description'),
            type: 'STRING',
            required: false
          },
          {
            name: 'split',
            description: await I18n.translate(locale, 'commands:challenge.start.chain.split.description'),
            type: 'INTEGER',
            required: false
          }
        ]
      },
      {
        name: 'race',
        description: await I18n.translate(locale, 'commands:challenge.start.race.description'),
        type: 'SUB_COMMAND',
        options: [
          {
            name: 'delay',
            description: await I18n.translate(locale, 'commands:challenge.start.race.delay.description'),
            type: 'INTEGER',
            required: false
          },
          {
            name: 'duration',
            description: await I18n.translate(locale, 'commands:challenge.start.race.duration.description'),
            type: 'INTEGER',
            required: false
          },
          {
            name: 'join',
            description: await I18n.translate(locale, 'commands:challenge.start.race.join.description'),
            type: 'BOOLEAN',
            required: false
          },
          {
            name: 'name',
            description: await I18n.translate(locale, 'commands:challenge.start.race.name.description'),
            type: 'STRING',
            required: false
          },
          {
            name: 'target',
            description: await I18n.translate(locale, 'commands:challenge.start.race.target.description'),
            type: 'INTEGER',
            required: true
          },
          {
            name: 'type',
            description: await I18n.translate(locale, 'commands:challenge.start.race.type.description'),
            type: 'STRING',
            choices: Object.values(RaceTypes).map((type) => ({
              name: type,
              value: type
            })),
            required: false
          }
        ]
      },
      {
        name: 'war',
        description: await I18n.translate(locale, 'commands:challenge.start.war.description'),
        type: 'SUB_COMMAND',
        options: [
          {
            name: 'delay',
            description: await I18n.translate(locale, 'commands:challenge.start.war.delay.description'),
            type: 'INTEGER',
            required: false
          },
          {
            name: 'duration',
            description: await I18n.translate(locale, 'commands:challenge.start.war.duration.description'),
            type: 'INTEGER',
            required: false
          },
          {
            name: 'join',
            description: await I18n.translate(locale, 'commands:challenge.start.war.join.description'),
            type: 'BOOLEAN',
            required: false
          },
          {
            name: 'name',
            description: await I18n.translate(locale, 'commands:challenge.start.war.name.description'),
            type: 'STRING',
            required: false
          }
        ]
      }
    ]
  }),

  execute: async (interaction: CommandInteraction, guildConfig: GuildConfig) => {
    const subcommand = interaction.options.getSubcommand()
    if (subcommand == null) { return }

    switch (subcommand) {
      case 'chain':
        await chain(interaction, guildConfig)
        break
      case 'race':
        await race(interaction, guildConfig)
        break
      case 'war':
        await war(interaction, guildConfig)
        break
    }
  }
}

async function chain (interaction: CommandInteraction, guildConfig: GuildConfig): Promise<void> {
  const chainOptions = getChainOptions(interaction)
  const challenge = await ChallengeService.createChainWar(chainOptions)

  if (challenge.errors.length > 0) {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.start.chain.error.couldNotStartChain'))
  } else {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.start.chain.success'))
  }

  const challengeJobData = getJobData(challenge)
  Jobs.challengeJobs.StartChallengeJob.enqueue(challengeJobData).catch(async () => { await I18n.translate(guildConfig.locale, 'commands:challenge.start.chain.error.couldNotStartChain') })
}

async function race (interaction: CommandInteraction, guildConfig: GuildConfig): Promise<void> {
  const raceOptions = getRaceOptions(interaction)
  const challenge = await ChallengeService.createRace(raceOptions)

  if (challenge.errors.length > 0) {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.start.race.error.couldNotStartRace'))
  } else {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.start.race.success'))
  }

  const challengeJobData = getJobData(challenge)
  Jobs.challengeJobs.StartChallengeJob.enqueue(challengeJobData).catch(async () => { await I18n.translate(guildConfig.locale, 'commands:challenge.start.race.error.couldNotStartRace') })
}

async function war (interaction: CommandInteraction, guildConfig: GuildConfig): Promise<void> {
  const warOptions = getWarOptions(interaction)
  const challenge = await ChallengeService.createWar(warOptions)

  if (challenge.errors.length > 0) {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.start.war.error.couldNotStartWar'))
  } else {
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.start.war.success'))
  }

  const challengeJobData = getJobData(challenge)
  Jobs.challengeJobs.StartChallengeJob.enqueue(challengeJobData).catch(async () => { await I18n.translate(guildConfig.locale, 'commands:challenge.start.war.error.couldNotStartWar') })
}

/**
   * Parses the arguments passed into the command.
   *
   * @param interaction The command that was ran
   * @param guildConfig The config object of the guild the interaction was run in.
   * @param userConfig The config object of the user who ran the command.
   * @returns An object containing the parameters for creating the goal
   */
function getChainOptions (interaction: CommandInteraction): ChainWarCreateOptions {
  return {
    channelId: interaction.channel?.id,
    delay: interaction.options.getInteger('delay') ?? 5,
    duration: interaction.options.getInteger('duration') ?? 10,
    join: interaction.options.getBoolean('join') ?? false,
    chainLength: interaction.options.getInteger('chain_length') ?? 10,
    ownerId: interaction.user?.id,
    name: interaction.options.getString('type') ?? `${interaction.user.username}'s chain war`,
    split: interaction.options.getInteger('split') ?? 5
  }
}

/**
   * Parses the arguments passed into the command.
   *
   * @param interaction The command that was ran
   * @param guildConfig The config object of the guild the interaction was run in.
   * @param userConfig The config object of the user who ran the command.
   * @returns An object containing the parameters for creating the goal
   */
function getRaceOptions (interaction: CommandInteraction): RaceCreateOptions {
  return {
    channelId: interaction.channel?.id,
    delay: interaction.options.getInteger('delay') ?? 5,
    duration: interaction.options.getInteger('duration') ?? 30,
    join: interaction.options.getBoolean('join') ?? false,
    ownerId: interaction.user?.id,
    name: interaction.options.getString('type') ?? `${interaction.user.username}'s race`,
    target: interaction.options.getInteger('target') ?? 0,
    type: interaction.options.getString('type') as RaceTypes
  }
}

/**
   * Parses the arguments passed into the command.
   *
   * @param interaction The command that was ran
   * @param guildConfig The config object of the guild the interaction was run in.
   * @param userConfig The config object of the user who ran the command.
   * @returns An object containing the parameters for creating the goal
   */
function getWarOptions (interaction: CommandInteraction): WarCreateOptions {
  return {
    channelId: interaction.channel?.id,
    delay: interaction.options.getInteger('delay') ?? 5,
    duration: interaction.options.getInteger('duration') ?? 10,
    join: interaction.options.getBoolean('join') ?? false,
    ownerId: interaction.user?.id,
    name: interaction.options.getString('type') ?? `${interaction.user.username}'s war`
  }
}

/**
   * Parses the arguments passed into the command.
   *
   * @param interaction The command that was ran
   * @param guildConfig The config object of the guild the interaction was run in.
   * @param userConfig The config object of the user who ran the command.
   * @returns An object containing the parameters for creating the goal
   */
function getJobData (challenge: Challenge): StartChallengeJobData {
  return {
    challengeId: challenge.id
  }
}
