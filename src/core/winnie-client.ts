import { ClientOptions, Client as DiscordJsClient } from 'discord.js'
import { Event } from '../types/event'

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
    partials: [
      'USER',
      'GUILD_MEMBER',
      'MESSAGE',
      'REACTION'
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
   * Attempts to login to Discord using a token provided through the
   * BOT_TOKEN environment variable.
   */
  async login (): Promise<void> {
    await this.client.login(process.env.BOT_TOKEN)
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
