import { CommandInteraction } from 'discord.js'
import { I18n } from '../../core'

/**
  * Prints an error message for when something happens that should be impossible.
  *
  * @param interaction The interaction that was executed
  * @param locale the locale to use when looking up strings
  */
export async function printGenericError (interaction: CommandInteraction, locale: string): Promise<void> {
  await interaction.reply(await I18n.translate(locale, 'commands:defaultError'))
}
