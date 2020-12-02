import * as CommandHandler from './core/command-handler'
import I18n from './core/i18n'
import Logger from './core/logger'
import events from './events'
import { Client, ClientOptions } from 'discord.js'

/**
 * Registers all the event listeners used by Winnie.
 *
 * @param client - The Discord.js client instance
 */
function setupEvents(client: Client): void {
  events.forEach((event) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handle = async (...args: Array<any>) => await event.handle(...args, client)
    Logger.info(`Registering an handler for ${event.name} events.`)
    client.on(event.name, handle)
  })

  client.on('message', (message) => CommandHandler.handleCommand(message))
}

/**
 * The main function that starts Winnie.
 */
async function startWinnie(): Promise<void> {
  Logger.info('Welcome to Winnie Bot!')

  await I18n.init()

  const clientOptions: ClientOptions = {
    partials: [
      'USER',
      'GUILD_MEMBER',
      'MESSAGE',
      'REACTION',
    ],
  }

  Logger.info('Starting Winnie')
  const client = new Client(clientOptions)
  setupEvents(client)

  try {
    await client.login(process.env['BOT_TOKEN'])
  } catch (error) {
    Logger.error('Unable to log in to discord, did you set your bot token?')
    process.exit()
  }

  Logger.info('Successfully logged in to Discord.')
}

startWinnie().catch((error) => {
  Logger.error(`Unable to start Winnie.\n${error}`)
  process.exit()
})
