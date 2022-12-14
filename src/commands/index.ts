import { Command } from '../types'
import { ConfigCommand } from './config'
import { SlashCommandBuilder } from 'discord.js'

const commandList: Command[] = [
  ConfigCommand
]

async function commandData (locale: string): Promise<any[]> {
  return [
    (await ConfigCommand.data(locale) as SlashCommandBuilder).toJSON()
  ]
}

export const Commands = {
  commandData,
  commandList
}
