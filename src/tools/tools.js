const prompts = require('./data.js');
const fetch = require('node-fetch');
const dbc = require('../dbc.js');

/** Class containing functions to handle miscellaneous tools. */
class Tools {
  /** Initialise variables for tool management. */
  constructor() {
    this.WAR_RAPTOR_CHANCE = 10;
  }
  /**
   * Gives the user a target for a number of minutes.
   * @param {Object} msg - The message that ran this function.
   * @param {String} prefix - The bot's prefix.
   * @param {String} suffix - Information after the bot command.
   * @return {String} - The message to send to the user.
   */
  calcTarget(msg, prefix, suffix) {
    let returnMsg = '';
    const args = suffix.split(' ');
    const difficulty = args.shift();
    const time = args.shift();
    let base = undefined;
    switch (difficulty) {
      case 'easy':
        base = 6;
        break;
      case 'medium':
        base = 17;
        break;
      case 'hard':
        base = 28;
        break;
      case 'insane':
        base = 39;
        break;
    }
    if (base === undefined) {
      returnMsg = '**Error:**: Targets must be easy, medium, hard, or insane.' +
        ' Example: `' + prefix + 'target medium 15`.';
    } else if (!Number.isInteger(Number(time))) {
      returnMsg = '**Error:**: Duration must be a whole number. Example: `' +
        prefix + 'target medium 15`.';
    } else {
      const goalTotal = (Math.ceil(Math.random() * 11) + base) * time;
      returnMsg = msg.author.toString()+ ', your target is **' + goalTotal + '**.';
    }
    return returnMsg;
  }
  /**
   * Fetches a writing prompt for a user.
   * @param {Object} msg - The message that ran this function.
   * @param {String} suffix - Information after the bot command.
   * @return {String} - The message to send to the user.
   */
  getPrompt(msg) {
    const choiceID = Math.floor(Math.random() * prompts.PROMPT_LIST.length);
    return msg.author.toString()+
        ', your prompt is: **' +
        prompts.PROMPT_LIST[choiceID].trim() +
        '**';
  }
  /**
   * Chooses an item from a comma-separated list.
   * @param {Object} msg - The message that ran this function.
   * @param {String} suffix - Information after the bot command.
   * @return {String} - The message to send to the user.
   */
  chooseItem(msg, suffix) {
    if (suffix == '') {
      return msg.author.toString()+ ', I need something to choose from!';
    } else {
      const items = suffix.split(',');
      const choiceID = Math.floor(Math.random() * items.length);
      return msg.author.toString()+
          ', from ' +
          suffix +
          ', I selected **' +
          items[choiceID].trim() +
          '**';
    }
  }
  /**
   * Roll to see whether a user hatches a raptor.
   * @param {Number} server - Discord ID of the user's server.
   * @param {Object} channel - The channel from which this function was called.
   * @param {Object} author - The user for whom a raptor is being rolled.
   * @param {Number} raptorChance - The chance of the user receiving a raptor.
   * @return {Object} - Async promise.
   */
  async raptor(server, channel, author, raptorChance) {
    const raptorRoll = Math.random() * 100;
    if (raptorRoll < raptorChance) {
      await dbc.dbUpdate('raptorDB', {_id: server}, {$inc: {count: 1}});
      await dbc.dbUpdate(
          'raptorUserDB', {_id: {server: server, user: author.id}},
          {$inc: {count: 1}},
      );
      const userData = await dbc.dbFind('userDB', {_id: author.id});
      const currentRaptors = userData.raptorTotal;
      if (currentRaptors == 0) {
        await dbc.dbUpdate('raptorBuckets', {_id: 0}, {$inc: {rank: 1}});
      } else {
        await dbc.dbUpdate(
            'raptorBuckets', {_id: currentRaptors},
            {$inc: {rank: 1}, $pull: {users: author.id}},
        );
      }
      await dbc.dbUpdate(
          'raptorBuckets', {_id: currentRaptors + 1},
          {$setOnInsert: {rank: 1}, $push: {users: author.id}},
      );
      await dbc.dbUpdate('userDB', {_id: author.id}, {$inc: {raptorTotal: 1}});
      const channelRaptors = await dbc.dbFind('raptorDB', {_id: server});
      channel.send(
          author +
          ', you have hatched a raptor! Your server currently houses ' +
          channelRaptors.count +
          ' raptors.',
      );
    }
  }
  /**
   * Displays user information.
   * @param {Object} msg - The message that ran this function.
   * @param {String} suffix - Information after the bot command.
   * @return {String} - The message to send to the user.
   */
  async siteName(msg, suffix) {
    let returnMsg = '';
    const siteUrl = 'https://nanowrimo.org/participants/' + suffix + '/stats';
    const requestData = await fetch(siteUrl);
    if (requestData.status == 200) {
      await dbc.dbUpdate(
          'userDB',
          {_id: msg.author.id},
          {$set: {siteName: suffix}},
      );
      returnMsg = msg.author.toString()+
          ', your NaNo username has been set to `' +
          suffix +
          '`.';
    } else {
      returnMsg = msg.author.toString()+
          ', I could not find the username `' +
          suffix +
          '` on the NaNo website!';
    }
    return returnMsg;
  }
  /**
   * Displays user information.
   * @param {Object} client - The Discord client.
   * @param {Object} msg - The message that ran this function.
   * @return {String} - The message to send to the user.
   */
  async userInfo(client, msg) {
    const document = await dbc.dbFind('userDB', {_id: msg.author.id});
    const data = await dbc.dbFind('raptorBuckets', {users: msg.author.id});
    const usersWithRaptors = await dbc.dbFind('raptorBuckets', {_id: 0});
    let statsTable = '***User Statistics for ' + msg.author.username + ':***\n';
    if (!(document == null || document.lifetimeSprintMinutes === undefined)) {
      statsTable += '\n*Sprint Statistics:* **' +
      parseFloat(document.lifetimeSprintMinutes).toFixed(2) +
      '** minutes to write **' +
      document.lifetimeSprintWords +
      '** words (**' +
      (document.lifetimeSprintWords /
        document.lifetimeSprintMinutes)
          .toFixed(2) +
      '** wpm)';
    }
    let firstSeen = true;
    if (!(document.lifetimeWarWords === undefined)) {
      firstSeen = false;
      statsTable += '\n*War Statistics:* ' +
        '**' +
        document.lifetimeWarWords +
        '** words in **' +
        document.lifetimeWordMinutes.toFixed(0) +
        '** minutes (**' +
        (document.lifetimeWarWords / document.lifetimeWordMinutes)
            .toFixed(2) +
        '** wpm)';
    }
    if (!(document.lifetimeWarLines === undefined)) {
      if (firstSeen == true) {
        statsTable += '\n*War Statistics:* ';
      } else {
        statsTable += ', ';
      }
      statsTable += '**' +
        document.lifetimeWarLines +
        '** lines in **' +
        document.lifetimeLineMinutes.toFixed(0) +
        '** minutes (**' +
        (document.lifetimeWarLines / document.lifetimeLineMinutes)
            .toFixed(2) +
        '** lpm)';
      firstSeen = false;
    }
    if (!(document.lifetimeWarPages === undefined)) {
      if (firstSeen == true) {
        statsTable += '\n*War Statistics:* ';
      } else {
        statsTable += ', ';
      }
      statsTable += '**' +
        document.lifetimeWarPages +
        '** pages in **' +
        document.lifetimePageMinutes.toFixed(0) +
        '** minutes (**' +
        (document.lifetimeWarPages / document.lifetimePageMinutes)
            .toFixed(2) +
        '** ppm)';
      firstSeen = false;
    }
    if (!(document.lifetimeWarMinutes === undefined)) {
      if (firstSeen == true) {
        statsTable += '\n*War Statistics:* ';
      } else {
        statsTable += ', ';
      }
      statsTable += '**' +
        document.lifetimeWarMinutes +
        '** minutes';
      firstSeen = false;
    }
    statsTable += '\n*Raptors:* **';
    if (document == null || document.raptorTotal === undefined) {
      statsTable += '**0** (Global Rank **' + usersWithRaptors.rank;
    } else {
      statsTable += document.raptorTotal +'** (Global Rank **' + data.rank;
    }
    statsTable += '** of **' + (usersWithRaptors.rank - 1) +
      '**)\n*NaNo Site Username:*';
    if (document == null || document.siteName === undefined) {
      statsTable += ' unknown';
    } else {
      statsTable += ' `' + document.siteName + '`';
    }
    if (document == null || document.timezone === undefined) {
      statsTable += '\n*Timezone:* unknown';
    } else {
      statsTable += '\n*Timezone:* `' + document.timezone + '`';
    }
    return statsTable;
  }
  /**
   * Displays raptor statistics.
   * @param {Object} client - The Discord client.
   * @param {Object} msg - The message that ran this function.
   * @return {String} - The message to send to the user.
   */
  async raptorStats(client, msg) {
    let raptorMsg = '__**Raptor Statistics:**__';
    raptorMsg += await this.raptorsByGuild(client, msg.guild.id);
    raptorMsg += await this.guildRaptors(client, msg.guild.id, msg.author.id);
    return raptorMsg;
  }
  /**
   * Displays raptor statistics by server.
   * @param {Object} client - The Discord client.
   * @param {Object} guildID - The server to display to.
   * @return {String} - The message to send to the user.
   */
  async raptorsByGuild(client, guildID) {
    let raptorMsg = '';
    const guilds = await dbc.dbSort('raptorDB', {}, {count: -1});
    let i = 0;
    await guilds.forEach(function(guild) {
      if (i < 10 || guild._id == guildID) {
        raptorMsg += '\n' + (i + 1) + '. *';
        if (client.guilds.cache.get(guild._id) === undefined) {
          raptorMsg += 'Unknown Server';
        } else {
          raptorMsg += client.guilds.cache.get(guild._id.name);
        }
        raptorMsg += ':* ' + guild.count;
      }
      i++;
    });
    return raptorMsg;
  }
  /**
   * Displays raptor statistics for a server.
   * @param {Object} client - The Discord client.
   * @param {Object} guildID - The server to display to.
   * @param {Object} userID - The user that called the raptor summary.
   * @return {String} - The message to send to the user.
   */
  async guildRaptors(client, guildID, userID) {
    let raptorMsg = '\n\n**Raptors by Author:**';
    const users = await dbc.dbSort(
        'raptorUserDB',
        {'_id.server': guildID},
        {count: -1},
    );
    let i = 0;
    await users.forEach(function(user) {
      if (i < 10 || user._id.user == userID) {
        raptorMsg += '\n' + (i + 1) + '. *';
        if (client.users.cache.get(user._id.user) === undefined) {
          raptorMsg += 'Unknown User';
        } else {
          raptorMsg += client.users.cache.get(user._id.user).username;
        }
        raptorMsg += ':* ' + user.count;
      }
      i++;
    });
    if (i == 0) {
      raptorMsg = '';
    }
    return raptorMsg;
  }
}

module.exports = new Tools();
