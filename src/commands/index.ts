import { ConfigCommand } from './config'
import { ServerConfigCommand } from './server'

export const Commands = {
  commandList: [
    ConfigCommand,
    ServerConfigCommand
  ]
}
