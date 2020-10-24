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
    let helpMsg = '';
    if (!suffix) {
      helpMsg = this.buildMainHelp(cmdList, prefix);
    } else if (suffix == 'all') {
      helpMsg = this.buildAllHelp(cmdList, prefix);
    } else if (this.commandTypes.indexOf(suffix) > -1) {
      helpMsg = '**Winnie_Bot Commands:**\n' +
        '*Replace the <angled brackets> with the relevant information. ' +
        'Anything in [square brackets] is optional.*\n\n' +
        this.buildHelpSection(cmdList, prefix, suffix);
    } else if (cmdList[suffix] === undefined) {
      helpMsg = '**Error:** That command does not exist.';
    } else {
      helpMsg = this.buildHelpItem(cmdList[suffix], prefix);
    }
    return helpMsg;
  }
  /**
   * Builds help message for all commands.
   * @param {Object} cmdList - A list of Winnie's commands.
   * @param {String} prefix - The bot's prefix.
   * @return {String} - the help message.
   */
  buildAllHelp(cmdList, prefix) {
    const helpMsg = [];
    helpMsg.push(
        '**Winnie_Bot Commands:**\n' +
        '*Replace the <angled brackets> with the relevant information. ' +
        'Anything in [square brackets] is optional.*\n\n',
    );
    for (let i = 0; i < this.commandTypes.length; i++) {
      helpMsg.push(this.buildHelpSection(
          cmdList,
          prefix,
          this.commandTypes[i],
      ));
    }
    return helpMsg;
  }
  /**
   * Builds a help message for a specific type of command.
   * @param {Object} cmdList - A list of Winnie's commands.
   * @param {String} prefix - The bot's prefix.
   * @param {String} cmdType - The type of command to provide help for.
   * @return {String} - the help message.
   */
  buildHelpSection(cmdList, prefix, cmdType) {
    let helpMsg = '__*' +
      cmdType.charAt(0).toUpperCase() +
      cmdType.substr(1) +
      ':*__\n';
    for (const i in cmdList) {
      if (!(cmdList[i].alias) && cmdList[i].type == cmdType) {
        helpMsg += this.buildHelpItem(cmdList[i], prefix);
      }
    }
    return helpMsg;
  }
  /**
   * Builds a help message for a specific command.
   * @param {Object} cmd - The command to provide help for.
   * @param {String} prefix - The bot's prefix.
   * @return {String} - the help message.
   */
  buildHelpItem(cmd, prefix) {
    let helpMsg = '**' + prefix + cmd.name;
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
    helpMsg += '\n';
    return helpMsg;
  }
  /**
   * Builds the main help message.
   * @param {Object} cmdList - A list of Winnie's commands.
   * @param {String} prefix - The bot's prefix.
   * @return {String} - the help message.
   */
  buildMainHelp(cmdList, prefix) {
    let helpMsg = '**Winnie_Bot Commands:**';
    for (let i = 0; i < this.commandTypes.length; i++) {
      helpMsg += this.buildMainSections(cmdList, prefix, this.commandTypes[i]);
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
  /**
   * Builds each section of the main help message.
   * @param {Object} cmdList - A list of Winnie's commands.
   * @param {String} prefix - The bot's prefix.
   * @param {String} cmdType - The type of command to provide help for.
   * @return {String} - the help message.
   */
  buildMainSections(cmdList, prefix, cmdType) {
    let helpMsg = '\n__*' +
      cmdType.charAt(0).toUpperCase() +
      cmdType.substr(1).toLowerCase() +
      ':*__\n';
    let first = true;
    for (const j in cmdList) {
      if (!(cmdList[j].alias) && cmdList[j].type == cmdType) {
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
    return helpMsg;
  }
}

module.exports = new Help();
