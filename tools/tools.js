const prompts = require('./data.js');
const config = require('../config.json');
const conn = require('mongoose').connection;

/** Class containing functions to handle miscellaneous tools. */
class Tools {
  /** Initialise variables for tool management. */
  constructor() {
    this.raptorCount = {};
    this.userRaptors = {};
  }
  /**
   * Gives the user a target for a number of minutes.
   * @param {Object} msg - The message that ran this function.
   * @param {String} suffix - Information after the bot command.
   */
  calcTarget(msg, suffix) {
    const args = suffix.split(' ');
    const difficulty = args.shift();
    const time = args.shift();
    let base = null;
    if (!Number.isInteger(Number(time))) {
      msg.channel.send(
          'Error: Duration must be a whole number. Example: `' +
          config.cmd_prefix +
          'target medium 15`.'
      );
    } else {
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
        default:
          base = null;
          break;
      }
      if (base === null) {
        msg.channel.send(
            'Error: Targets must be easy, medium, hard, or insane. Example: `' +
            config.cmd_prefix +
            'target medium 15`.'
        );
      } else {
        const goalPerMinute = Math.ceil(Math.random() * 11) + base;
        const goalTotal = goalPerMinute * time;
        msg.channel.send(
            msg.author + ', your target is **' + goalTotal + '**.'
        );
      }
    }
  }
  /**
   * Fetches a writing prompt for a user.
   * @param {Object} msg - The message that ran this function.
   * @param {String} suffix - Information after the bot command.
   */
  getPrompt(msg) {
    const choiceID = Math.floor(Math.random() * prompts.PROMPT_LIST.length);
    msg.channel.send(
        msg.author +
        ', your prompt is: **' +
        prompts.PROMPT_LIST[choiceID].trim() +
        '**'
    );
  }
  /**
   * Chooses an item from a comma-separated list.
   * @param {Object} msg - The message that ran this function.
   * @param {String} suffix - Information after the bot command.
   */
  chooseItem(msg, suffix) {
    const items = suffix.split(',');
    const choiceID = Math.floor(Math.random() * items.length);
    msg.channel.send(
        msg.author +
        ', from ' +
        suffix +
        ', I selected **' +
        items[choiceID].trim() +
        '**'
    );
  }
  /**
   * Roll to see whether a user hatches a raptor.
   * @param {Number} server - Discord ID of the user's server.
   * @param {Object} channel - The channel from which this function was called.
   * @param {Object} author - The user for whom a raptor is being rolled.
   * @param {Number} raptorChance - The chance of the user receiving a raptor.
   */
  raptor(server, channel, author, raptorChance) {
    if (!(server in this.raptorCount)) {
      this.raptorCount[server] = 0;
      conn
          .collection('raptorDB')
          .update(
              {server: server},
              {server: server, count: this.raptorCount[server]},
              {upsert: true}
          );
    }
    if (!(server in this.userRaptors)) {
      this.userRaptors[server] = {};
    }
    if (!(author.id in this.userRaptors[server])) {
      this.userRaptors[server][author.id] = 0;
    }
    const raptorRoll = Math.random() * 100;
    if (raptorRoll < raptorChance) {
      this.raptorCount[server] += 1;
      this.userRaptors[server][author.id] += 1;
      conn
          .collection('raptorDB')
          .update(
              {server: server},
              {server: server, count: this.raptorCount[server]},
              {upsert: true}
          );
      conn.collection('raptorUserDB').update(
          {server: server, user: author.id},
          {
            server: server,
            user: author.id,
            count: this.userRaptors[server][author.id],
          },
          {upsert: true}
      );
      channel.send(
          author +
          ', you have hatched a raptor! Your server currently houses ' +
          this.raptorCount[server] +
          ' raptors.'
      );
    }
  }
  /**
   * Displays raptor statistics.
   * @param {Object} client - The Discord client.
   * @param {Object} msg - The message that ran this function.
   */
  raptorStats(client, msg) {
    let raptorMsg = '__**Raptor Statistics:**__';
    const raptorOrd = this.sortCollection(this.raptorCount);
    for (let i = 0; i < raptorOrd.length; i++) {
      if (i < 10 || raptorOrd[i] == msg.guild.id) {
        raptorMsg +=
          '\n' +
          (i + 1) +
          '. *' +
          client.guilds.get(raptorOrd[i]) +
          ':* ' +
          this.raptorCount[raptorOrd[i]];
      }
    }
    if (!(this.userRaptors[msg.guild.id] === undefined)) {
      const userOrd = this.sortCollection(this.userRaptors[msg.guild.id]);
      if (this.raptorCount[msg.guild.id] > 0) {
        raptorMsg += '\n\n**Raptors by Author:**';
        for (let i = 0; i < userOrd.length; i++) {
          if (i < 10 || userOrd[i] == msg.author.id) {
            raptorMsg +=
              '\n' +
              (i + 1) +
              '. *' +
              client.users.get(userOrd[i]).username +
              ':* ' +
              this.userRaptors[msg.guild.id][userOrd[i]];
          }
        }
      }
    }
    msg.channel.send(raptorMsg);
  }
  /**
   * Sorts a collection.
   * @param {Object} toSort - The collection to sort.
   * @return {Object} - The sorted collection.
   */
  sortCollection(toSort) {
    const keys = Object.keys(toSort);
    keys.sort(function(x, y) {
      return toSort[y] - toSort[x];
    });
    return keys;
  }
  /**
   * Roll dice according to the user's specifications.
   * @param {Object} msg - The message that ran this function.
   * @param {String} suffix - Information after the bot command.
   */
  rollDice(msg, suffix) {
    let diceString = '';
    let diceSum = 0;
    const faces = suffix.split('+');
    for (let i = 0; i < faces.length; i++) {
      if (Number.isInteger(Number(faces[i]))) {
        // Single number
        if (faces.length == 1) {
          // Treat as a 1dx roll
          const roll = Math.floor(Math.random() * Number(faces[i])) + 1;
          diceString += roll;
          diceSum += roll;
        } else {
          // Add to the other rolls
          diceString += '(' + Number(faces[i]) + ')';
          diceSum += Number(faces[i]);
        }
      } else if (faces[i].split('d').length == 2) {
        // RPG-style roll
        const rpgRoll = faces[i].split('d');
        if (rpgRoll[0] == '') {
          rpgRoll[0] = 1;
        }
        if (
          !Number.isInteger(Number(rpgRoll[0])) ||
          !Number.isInteger(Number(rpgRoll[1]))
        ) {
          diceString =
            'Error: Both values in an RPG-style roll must be integers.' +
            ' Example: `' +
            config.cmd_prefix +
            'roll 2d6`.';
          diceSum = 0;
          break;
        } else {
          if (rpgRoll[0] > 20) {
            diceString = 'Error: I cannot roll more than 20 dice at once.';
            diceSum = 0;
            break;
          } else {
            for (let j = 0; j < Number(rpgRoll[0]); j++) {
              const roll = Math.floor(Math.random() * Number(rpgRoll[1])) + 1;
              diceString += roll;
              if (j < Number(rpgRoll[0]) - 1) {
                diceString += ', ';
              }
              diceSum += roll;
            }
          }
        }
      } else if (faces[i].split(' ').length == 2) {
        // Range roll
        const rangeRoll = faces[i].split(' ');
        if (
          !Number.isInteger(Number(rangeRoll[0])) ||
          !Number.isInteger(Number(rangeRoll[1]))
        ) {
          diceString = 'Error: Both values in a range roll must be integers.' +
            ' Example: `' +
            config.cmd_prefix +
            'roll 1 100`.';
          diceSum = 0;
          break;
        } else {
          if (Number(rangeRoll[0]) < Number(rangeRoll[1])) {
            const roll = Math.floor(
                Math.random() *
                (1 + Number(rangeRoll[1]) - Number(rangeRoll[0])) +
                Number(rangeRoll[0])
            );
            diceString += roll;
            diceSum += roll;
          } else {
            // First number is larger than second
            diceString =
              'Error: The first number in a range' +
              ' roll must be smaller than the second.';
            diceSum = 0;
            break;
          }
        }
      } else {
        diceString = 'Error: ' + faces[i] + ' is not a valid roll.' +
          ' Example: `' +
          config.cmd_prefix +
          'roll 2d6 + 5`.';
        diceSum = 0;
        break;
      }
      if (i < faces.length - 1) {
        diceString += ', ';
      }
    }
    if (diceSum > 0) {
      diceString += '\nTotal = ' + diceSum;
    }
    msg.channel.send(diceString);
  }
}

module.exports = new Tools();
