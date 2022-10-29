import {
  ClientOptions,
  Client as DiscordJsClient,
  IntentsBitField,
  Partials
} from 'discord.js'
import { Event } from '../types'
import { I18n } from './i18n'
import { Logger } from './logger'

/**
 * THE™ Winnie_Bot client!
 */
class WinnieBotClient {
  /**
   * The options to be passed into the DiscordJS client instance.
   * See here for more info:
   * https://discord.js.org/#/docs/main/stable/typedef/ClientOptions
   */
  static clientOptions: ClientOptions = {
    intents: [
      IntentsBitField.Flags.Guilds,
      IntentsBitField.Flags.GuildMessages
    ],
    partials: [
      Partials.User,
      Partials.GuildMember,
      Partials.Message,
      Partials.Reaction
    ]
  }

  /**
   * The DiscordJS client instance
   */
  client: DiscordJsClient

  /**
   * Creates a new instance of the Winnie_Bot client.
   */
  constructor () {
    this.client = new DiscordJsClient(WinnieBotClient.clientOptions)
  }

  /**
 * The main function that starts Winnie.
 */
  async start (events: Event[]): Promise<void> {
    Logger.info('Welcome to Winnie_Bot!')

    await I18n.init()

    Logger.info('Starting Winnie')
    this.registerEvents(events)

    try {
      await this.login()
      Logger.info('Successfully logged in to Discord.')
    } catch (e) {
      Logger.error('Unable to log in to discord, did you set your bot token?')
      Logger.error(e)
      process.exit()
    }
  }

  /**
   * Attempts to login to Discord using a token provided through the
   * BOT_TOKEN environment variable.
   */
  async login (): Promise<void> {
    await this.client.login(process.env.BOT_TOKEN)
  }

  /**
   * Checks if the Winnie_Bot client is currently logged into discord
   * and able to make requests against Discord's API.
   *
   * @returns true If Winnie is logged in to Discord
   */
  isLoggedIn (): boolean {
    return this.client.isReady()
  }

  /**
   * Registers a new event handler with Winnie_Bot
   *
   * @param event The event to register
   */
  registerEvent (event: Event): void {
    this.client.on(event.name, event.handle)
  }

  /**
   * Registers a list of event handlers with Winnie_Bot
   *
   * @param events the list of events to register
   */
  registerEvents (events: Event[]): void {
    events.forEach((event) => this.client.on(event.name, event.handle))
  }
}

export const WinnieClient = new WinnieBotClient()
