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
   * @param {String} prefix - The bot's prefix.
   * @param {String} suffix - The suffix of the calling message.
   * @return {String} - the help message.
   */
  buildHelpMsg(cmdList, prefix, suffix) {
    if (suffix) {
      let helpMsg = '';
      if (suffix == 'all') {
        helpMsg = [];
        helpMsg.push(
            '**Winnie_Bot Commands:**\n' +
            '*Replace the <angled brackets> with the relevant information. ' +
            'Anything in [square brackets] is optional.*\n\n'
        );
        for (let i = 0; i < this.commandTypes.length; i++) {
          helpMsg.push(this.buildHelpSection(cmdList, this.commandTypes[i]));
        }
        return helpMsg;
      }
      for (let i = 0; i < this.commandTypes.length; i++) {
        if (this.commandTypes[i] == suffix) {
          helpMsg = '**Winnie_Bot Commands:**\n' +
          '*Replace the <angled brackets> with the relevant information. ' +
          'Anything in [square brackets] is optional.*\n\n';
          helpMsg += this.buildHelpSection(cmdList, this.commandTypes[i]);
          return helpMsg;
        }
      }
      const cmd = cmdList[suffix];
      try {
        helpMsg += '**' + prefix + cmd.name;
      } catch (e) {
        helpMsg += '**Error:** That command does not exist.';
        return helpMsg;
      }
      if (cmd.usage) {
        helpMsg += ' ' + cmd.usage;
      }
      helpMsg += ':**\n' +
          cmd.description.replace(/%prefix/g, prefix) +
          '\n';
      if (cmd.example) {
        helpMsg += '**Example:** `' +
        prefix +
        cmd.example +
        '`\n';
      }
      if (cmd.aliases) {
        helpMsg += '**Aliases:** ' +
        cmd.aliases +
        '\n';
      }
      return helpMsg;
    } else {
      let helpMsg = '**Winnie_Bot Commands:**';
      for (let i = 0; i < this.commandTypes.length; i++) {
        const typeTitle = this.commandTypes[i].charAt(0).toUpperCase()
          + this.commandTypes[i].substr(1).toLowerCase();
        helpMsg += '\n__*' + typeTitle + ':*__\n';
        let first = true;
        for (const j in cmdList) {
          if (cmdList.hasOwnProperty(j)) {
            if (cmdList[j].type == this.commandTypes[i]) {
              if (!(cmdList[j].alias)) {
                if (first == false) {
                  helpMsg += ', ';
                }
                helpMsg += prefix + cmdList[j].name;
                if (cmdList[j].aliases) {
                  helpMsg += ' (aliases: ' +
                  cmdList[j].aliases +
                  ')';
                }
                first = false;
              }
            }
          }
        }
      }
      helpMsg += '\n\nUse `' +
        prefix +
        'help <command>` to get help for a specific command, `' +
        prefix +
        'help <challenges|goals|tools|config>` to get help' +
        ' for a command type, or `' +
        prefix +
        'help all` to have Winnie DM you help for all commands.';
      return helpMsg;
    }
  }
  /**
   * Builds a help message for a specific type of command.
   * @param {Object} cmdList - A list of Winnie's commands.
   * @param {String} cmdType - The type of command to provide help for.
   * @return {String} - the help message.
   */
  buildHelpSection(cmdList, cmdType) {
    const title = cmdType.charAt(0).toUpperCase() + cmdType.substr(1);
    let helpMsg = '__*' + title + ':*__\n';
    for (const i in cmdList) {
      if (cmdList.hasOwnProperty(i)) {
        if (!(cmdList[i].alias)) {
          if (cmdList[i].type == cmdType) {
            helpMsg += '**' + prefix + cmdList[i].name;
            if (cmdList[i].usage) {
              helpMsg += ' ' + cmdList[i].usage;
            }
            helpMsg += ':**\n' + cmdList[i].description + '\n';
            if (cmdList[i].example) {
              helpMsg += '**Example:** `' +
              prefix +
              cmdList[i].example +
              '`\n';
            }
            if (cmdList[i].aliases) {
              helpMsg += '**Aliases:** ' +
              cmdList[i].aliases +
              '\n';
            }
            helpMsg += '\n';
          }
        }
      }
    }
    return helpMsg;
  }
}

module.exports = new Help();
