/**
 * Represents an event handler.
 */
export interface Event {
  /**
   * The name of the event.
   *
   * This should always match an event name in the list here:
   * https://discord.js.org/#/docs/main/stable/class/Client
   */
  name: string,

  /**
   * The function that processes an event.
   *
   * @param props - The event props passed into the hander. This props are different
   *   depending on the event type. For a list of events and their props, see this list:
   *   https://discord.js.org/#/docs/main/stable/class/Client
   */
  handle(...props: any[]): void, // eslint-disable-line @typescript-eslint/no-explicit-any
}
