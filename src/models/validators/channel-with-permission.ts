import { GuildChannel, PermissionResolvable, Snowflake } from 'discord.js'
import { ValidationOptions, registerDecorator } from 'class-validator'
import { WinnieClient } from '../../core/winnie-client'

/**
 * class-validator validator for validating whether a channel ID belongs to
 * a real channel and that Winnie_Bot has the given permissions in that channel.
 *
 * @param validationOptions Options to pass into the validator.
 */
export function IsChannelWithPermission (permission: PermissionResolvable, validationOptions?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (object: Object, propertyName: string): void {
    registerDecorator({
      name: 'IsChannelWithPermission',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        async validate (channelId: Snowflake): Promise<boolean> {
          let channel
          try {
            channel = await WinnieClient.client.channels.fetch(channelId)
          } catch (error) {
            return false
          }

          if (!(channel instanceof GuildChannel)) { return false }

          const guildChannel = channel
          const winnieMember = guildChannel.guild.me
          if (winnieMember == null) { return false }

          return guildChannel.permissionsFor(winnieMember)?.has(permission) ?? false
        }
      }
    })
  }
}
