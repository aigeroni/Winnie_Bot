import { GuildCreateEvent } from './guild-create'
import { MessageEvent } from './message'
import { ReadyEvent } from './ready'

const eventsList = [
  GuildCreateEvent,
  MessageEvent,
  ReadyEvent
]

export const Events = {
  eventsList
}
