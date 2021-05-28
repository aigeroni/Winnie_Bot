import { ApplicationCommandData } from 'discord.js'
import { Command } from '../types/command'

const commandList: Command[] = []

async function commandData (locale: string): Promise<ApplicationCommandData[]> {
  return []
}

export const Commands = {
  commandData,
  commandList
}
