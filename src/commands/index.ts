import { ApplicationCommandData } from 'discord.js'
import { Command } from '../types/command'
import { ConfigCommand } from './config'

const commandList: Command[] = [
  ConfigCommand
]

async function commandData (locale: string): Promise<ApplicationCommandData[]> {
  return [
    await ConfigCommand.commandData(locale)
  ]
}

export const Commands = {
  commandData,
  commandList
}
