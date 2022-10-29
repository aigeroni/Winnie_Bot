import { Event } from '../types'
import { Interaction } from 'discord.js'

/**
 * Handles the interaction event, fired when a user triggers an interaction.
 *
 * Used for:
 *  - responding to commands
 */
export const InteractionEvent: Event = {
  name: 'interaction',
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  handle: async (interaction: Interaction) => {}
}
