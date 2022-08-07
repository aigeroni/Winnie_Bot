import { ApplicationCommandData } from 'discord.js'
import { Command } from '../types'
import { ConfigCommand } from './config'
import { GoalCommand } from './goal'
import { PromptCommand } from './prompt'
import { ServerCommand } from './server'

const commandList: Command[] = [
  ConfigCommand,
  GoalCommand,
  PromptCommand,
  ServerCommand
]

async function commandData (locale: string): Promise<ApplicationCommandData[]> {
  return [
    await ConfigCommand.commandData(locale),
    await GoalCommand.commandData(locale),
    await PromptCommand.commandData(locale),
    await ServerCommand.commandData(locale)
  ]
}

export const Commands = {
  commandData,
  commandList
}
