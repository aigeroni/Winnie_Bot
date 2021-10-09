import { GuildCreateEvent } from './guild-create'
import { InteractionEvent } from './interaction'
import { ReadyEvent } from './ready'

const eventsList = [
  GuildCreateEvent,
  InteractionEvent,
  ReadyEvent
]

export const Events = {
  eventsList
}
