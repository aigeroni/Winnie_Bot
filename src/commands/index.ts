import { ApplicationCommandData } from 'discord.js'
import { Command } from '../types'
import { ChallengeCommand } from './challenge'
import { ConfigCommand } from './config'
import { GoalCommand } from './goal'
import { ServerCommand } from './server'

const commandList: Command[] = [
  ChallengeCommand,
  ConfigCommand,
  GoalCommand,
  ServerCommand
]

async function commandData (locale: string): Promise<ApplicationCommandData[]> {
  return [
    await ChallengeCommand.commandData(locale),
    await ConfigCommand.commandData(locale),
    await GoalCommand.commandData(locale),
    await ServerCommand.commandData(locale)
  ]
}

export const Commands = {
  commandData,
  commandList
}
