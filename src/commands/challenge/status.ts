import { CommandInteraction } from 'discord.js'
import { ChainWar, Challenge, GuildConfig, Race, War } from '../../models'
import { ChallengeService } from '../../services'
import { I18n, Logger } from '../../core'
import { SubCommand } from '../../types'
import { DateTime, Duration } from 'luxon'

const NAME = 'status'

export const ChallengeStatusCommand: SubCommand = {
  name: NAME,
  commandData: async (locale: string) => ({
    name: NAME,
    description: await I18n.translate(locale, 'commands:challenge.status.description'),
    type: 'SUB_COMMAND',
    options: [
      {
        name: 'id',
        description: await I18n.translate(locale, 'commands:challenge.status.args.id'),
        type: 'INTEGER',
        required: false
      }
    ]
  }),

  execute: async (interaction: CommandInteraction, guildConfig: GuildConfig) => {
    const challenge = await ChallengeService.getChallengeFromCommand(interaction, guildConfig)
    const challengeId = interaction.options.getInteger('id') ?? 0
    if (challenge == null) {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.status.error.challengeDoesNotExist', {
        id: challengeId
      }))
    } else if (challenge.errors.length > 0) {
      await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.status.error.couldNotGetStatus'))
    } else {
      await printStatus(challenge, interaction, guildConfig)
    }
  }
}

async function printStatus (challenge: Challenge, interaction: CommandInteraction, guildConfig: GuildConfig): Promise<void> {
  if (!challenge.isActive()) { // check whether challenge has been cancelled
    await interaction.reply(await I18n.translate(guildConfig.locale, 'commands:challenge.status.error.challengeDoesNotExist', {
      id: interaction.options.getInteger('id') ?? ''
    }))
  } else {
    switch (challenge.challenge_type) {
      case 'race':
        await raceStatus(challenge as Race, interaction, guildConfig)
        break
      case 'war':
        Logger.info('entered case')
        await warStatus(challenge as War, interaction, guildConfig)
        break
      case 'chain_war':
        await chainStatus(challenge as ChainWar, interaction, guildConfig)
        break
    }
  }
}

async function warStatus (war: War, interaction: CommandInteraction, guildConfig: GuildConfig): Promise<void> {
  if (war.hasStarted) { // war is running
    await interaction.reply(await I18n.translate(guildConfig.locale, 'challenges:status.warAfterStart', {
      challengeName: war.name,
      id: interaction.options.getInteger('id') ?? '',
      data: await I18n.translate(guildConfig.locale, 'challenges:dataWithRemaining.war', {
        duration: await I18n.translate(guildConfig.locale, 'challenges:minutesWithCount.minutes', { count: war.duration }),
        timeLeft: await getTimeRemaining(war.startAt.plus(Duration.fromObject({ minutes: war.duration })))
      })
    }))
  } else { // war hasn't started
    await interaction.reply(await I18n.translate(guildConfig.locale, 'challenges:status.warBeforeStart', {
      challengeName: war.name,
      id: interaction.options.getInteger('id') ?? '',
      data: await I18n.translate(guildConfig.locale, 'challenges:dataWithDelay.war', {
        duration: await I18n.translate(guildConfig.locale, 'challenges:minutesWithCount.minutes', { count: war.duration }),
        delayRemaining: await getTimeRemaining(war.startAt)
      })
    }))
  }
}

async function chainStatus (chain: ChainWar, interaction: CommandInteraction, guildConfig: GuildConfig): Promise<void> {
  if (chain.hasStarted) { // chain is running
    await interaction.reply(await I18n.translate(guildConfig.locale, 'challenges:status.chainAfterStart', {
      challengeName: chain.name,
      id: interaction.options.getInteger('id') ?? '',
      data: await I18n.translate(guildConfig.locale, 'challenges:dataWithRemaining.chain', {
        duration: await I18n.translate(guildConfig.locale, 'challenges:minutesWithCount.minutes', { count: chain.duration }),
        timeLeft: await getTimeRemaining(chain.startAt.plus(Duration.fromObject({ minutes: chain.duration })))
      })
    }))
  } else { // chain hasn't started
    await interaction.reply(await I18n.translate(guildConfig.locale, 'challenges:status.chainBeforeStart', {
      challengeName: chain.name,
      id: interaction.options.getInteger('id') ?? '',
      data: await I18n.translate(guildConfig.locale, 'challenges:dataWithDelay.chain', {
        duration: await I18n.translate(guildConfig.locale, 'challenges:minutesWithCount.minutes', { count: chain.duration }),
        delayRemaining: await getTimeRemaining(chain.startAt)
      })
    }))
  }
}

async function raceStatus (race: Race, interaction: CommandInteraction, guildConfig: GuildConfig): Promise<void> {
  if (race.hasStarted) { // race is running
    await interaction.reply(await I18n.translate(guildConfig.locale, 'challenges:status.raceAfterStart', {
      challengeName: race.name,
      id: interaction.options.getInteger('id') ?? '',
      data: await I18n.translate(guildConfig.locale, 'challenges:dataWithRemaining.race', {
        target: await I18n.translate(guildConfig.locale, `challenges:typesWithCount.${race.targetType}`, { count: race.target }),
        duration: await I18n.translate(guildConfig.locale, 'challenges:minutesWithCount.minutes', { count: race.timeOut }),
        timeLeft: await getTimeRemaining(race.startAt.plus(Duration.fromObject({ minutes: race.timeOut })))
      })
    }))
  } else { // race hasn't started
    await interaction.reply(await I18n.translate(guildConfig.locale, 'challenges:status.raceBeforeStart', {
      challengeName: race.name,
      id: interaction.options.getInteger('id') ?? '',
      data: await I18n.translate(guildConfig.locale, 'challenges:dataWithDelay.race', {
        target: await I18n.translate(guildConfig.locale, `challenges:typesWithCount.${race.targetType}`, { count: race.target }),
        duration: await I18n.translate(guildConfig.locale, 'challenges:minutesWithCount.minutes', { count: race.timeOut }),
        delayRemaining: await getTimeRemaining(race.startAt)
      })
    }))
  }
}

async function getTimeRemaining (eventTime: DateTime): Promise<string> {
  const timeLeft = eventTime.diff(DateTime.utc(), ['minutes', 'seconds']).toObject()
  if (timeLeft.minutes == null || timeLeft.seconds == null) {
    return 'invalid time'
  } else {
    let secondsLeft = timeLeft.seconds.toFixed(0)
    if (timeLeft.seconds < 10) {
      secondsLeft = '0' + secondsLeft
    }
    const timeString = timeLeft.minutes.toString() + ':' + secondsLeft
    return timeString
  }
}
