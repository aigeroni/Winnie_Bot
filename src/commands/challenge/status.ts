import { Challenge, GuildConfig, Race, War } from '../../models'
import { ChallengeService } from '../../services'
import { CommandInteraction } from 'discord.js'
import { DateTime, Duration } from 'luxon'
import { I18n } from '../../core'
import { StatusTypes } from '../../types/missions'
import { SubCommand } from '../../types'

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
    switch (challenge.challengeType) {
      case 'race':
        await raceStatus(challenge as Race, interaction, guildConfig)
        break
      case 'war':
        await warStatus(challenge as War, interaction, guildConfig)
        break
      // case 'chain':
      //   await chainStatus(challenge as ChainWar, interaction, guildConfig)
      //   break
    }
  }
}

async function warStatus (war: War, interaction: CommandInteraction, guildConfig: GuildConfig): Promise<void> {
  if (war.status === StatusTypes.RUNNING) { // war is running
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

// async function chainStatus (chain: ChainWar, interaction: CommandInteraction, guildConfig: GuildConfig): Promise<void> {
//   if (chain.status === StatusTypes.RUNNING) { // chain is running
//     await interaction.reply(await I18n.translate(guildConfig.locale, 'challenges:status.chainAfterStart', {
//       challengeName: chain.name,
//       id: interaction.options.getInteger('id') ?? '',
//       data: await I18n.translate(guildConfig.locale, 'challenges:dataWithRemaining.chain', {
//         duration: await I18n.translate(guildConfig.locale, 'challenges:minutesWithCount.minutes', { count: chain.duration }),
//         timeLeft: await getTimeRemaining(chain.startAt.plus(Duration.fromObject({ minutes: chain.duration })))
//       })
//     }))
//   } else { // chain hasn't started
//     await interaction.reply(await I18n.translate(guildConfig.locale, 'challenges:status.chainBeforeStart', {
//       challengeName: chain.name,
//       id: interaction.options.getInteger('id') ?? '',
//       data: await I18n.translate(guildConfig.locale, 'challenges:dataWithDelay.chain', {
//         duration: await I18n.translate(guildConfig.locale, 'challenges:minutesWithCount.minutes', { count: chain.duration }),
//         delayRemaining: await getTimeRemaining(chain.startAt)
//       })
//     }))
//   }
// }

async function raceStatus (race: Race, interaction: CommandInteraction, guildConfig: GuildConfig): Promise<void> {
  if (race.status === StatusTypes.RUNNING) { // race is running
    await interaction.reply(await I18n.translate(guildConfig.locale, 'challenges:status.raceAfterStart', {
      challengeName: race.name,
      id: interaction.options.getInteger('id') ?? '',
      data: await I18n.translate(guildConfig.locale, 'challenges:dataWithRemaining.race', {
        target: await I18n.translate(guildConfig.locale, `challenges:typesWithCount.${race.targetType}`, { count: race.target }),
        duration: await I18n.translate(guildConfig.locale, 'challenges:minutesWithCount.minutes', { count: race.duration }),
        timeLeft: await getTimeRemaining(race.startAt.plus(Duration.fromObject({ minutes: race.duration })))
      })
    }))
  } else { // race hasn't started
    await interaction.reply(await I18n.translate(guildConfig.locale, 'challenges:status.raceBeforeStart', {
      challengeName: race.name,
      id: interaction.options.getInteger('id') ?? '',
      data: await I18n.translate(guildConfig.locale, 'challenges:dataWithDelay.race', {
        target: await I18n.translate(guildConfig.locale, `challenges:typesWithCount.${race.targetType}`, { count: race.target }),
        duration: await I18n.translate(guildConfig.locale, 'challenges:minutesWithCount.minutes', { count: race.duration }),
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
