const config = require('./config.json');
/** Class containing help functions. */
class Help {
    /** Initialise variables for help functions.
     * @param {Object} commandTypes - A list of command categories.
     */
    constructor() {
      this.commandTypes = ['challenges', 'goals', 'tools', 'config'];
    }
    /**
     * Provides help messages for a command or list of commands.
     * @param {Object} cmdList - A list of Winnie's commands.
     * @param {String} suffix - The suffix of the calling message.
     */
    buildHelpMsg(cmdList, suffix) {
      if (suffix) {
        let helpMsg = '';
        for(let i = 0; i < this.commandTypes.length; i++) {
          if (this.commandTypes[i] == suffix) {
            helpMsg = this.buildHelpSection(cmdList, this.commandTypes[i]);
            return helpMsg;
          }
        }
        let cmd = cmdList[suffix];
        try {
          helpMsg = 'Help for **' + config.cmd_prefix + cmd.name;
        } catch (e) {
          helpMsg += 'That command does not exist.';
          return helpMsg;
        }
        if (cmd.usage) {
          helpMsg += ' ' + cmd.usage;
        }
        helpMsg += ':** ' + cmd.description + '\n';
        return helpMsg;
      } else {
        let helpMsgArray = [];
        helpMsgArray.push('**Winnie_Bot Commands:**\n'
          + '*Anything in [square brackets] is optional.*');
        for(let i = 0; i < this.commandTypes.length; i++) {
          helpMsgArray.push(this
            .buildHelpSection(cmdList, this.commandTypes[i]));
        }
        return helpMsgArray;
      }
    }
    /**
     * Builds a help message for a specific type of command.
     * @param {Object} cmdList - A list of Winnie's commands.
     * @param {String} cmdType - The type of command to provide help for.
     */
    buildHelpSection(cmdList, cmdType) {
      const title = cmdType.charAt(0).toUpperCase() + cmdType.substr(1);
      let helpMsg = '__*' + title + ':*__\n';
      for (const i in cmdList) {
        if (cmdList.hasOwnProperty(i)) {
          if (cmdList[i].type == cmdType) {
            helpMsg += '**' + config.cmd_prefix + cmdList[i].name;
            if (cmdList[i].usage) {
              helpMsg += ' ' + cmdList[i].usage;
            }
            helpMsg += ':** ' + cmdList[i].description + '\n';
          }
        }
      }
      return helpMsg;
    }
  }
  
  module.exports = new Help();
