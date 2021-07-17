import { ApplicationCommandData } from 'discord.js'
import { Command } from '../types'
import { ConfigCommand } from './config'
import { ServerCommand } from './server'

const commandList: Command[] = [
  ConfigCommand,
  ServerCommand
]

async function commandData (locale: string): Promise<ApplicationCommandData[]> {
  return [
    await ConfigCommand.commandData(locale),
    await ServerCommand.commandData(locale)
  ]
}

export const Commands = {
  commandData,
  commandList
}
