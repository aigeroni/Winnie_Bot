import { GuildCreateEvent } from './guild-create'
import { InteractionEvent } from './interaction'
import { MessageEvent } from './message'
import { ReadyEvent } from './ready'

const eventsList = [
  GuildCreateEvent,
  InteractionEvent,
  MessageEvent,
  ReadyEvent
]

export const Events = {
  eventsList
}
