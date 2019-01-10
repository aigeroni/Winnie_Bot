const prompts = require('./data.js');
const fetch = require('node-fetch');
const conn = require('mongoose').connection;

/** Class containing functions to handle miscellaneous tools. */
class Tools {
  /** Initialise variables for tool management. */
  constructor() {
    this.raptorCount = {};
    this.userRaptors = {};
    this.announceChannel = {};
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
      returnMsg = msg.author + ', your target is **' + goalTotal + '**.';
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
    return msg.author +
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
      return msg.author + ', I need something to choose from!';
    } else {
      const items = suffix.split(',');
      const choiceID = Math.floor(Math.random() * items.length);
      return msg.author +
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
    if (!(server in this.raptorCount)) {
      this.raptorCount[server] = 0;
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
              {_id: server},
              {$inc: {
                count: 1,
              },
              },
              {upsert: true}
          );
      conn.collection('raptorUserDB').update(
          {_id: {server: server, user: author.id}},
          {$inc: {
            count: 1,
          },
          },
          {upsert: true}
      );
      const userData = await conn.collection('userDB').findOne(
          {_id: author.id}
      );
      const currentRaptors = userData.raptorTotal;
      if (currentRaptors == 0) {
        await conn.collection('raptorBuckets').update(
            {_id: 0},
            {$inc: {
              rank: 1,
            },
            }
        );
        await conn.collection('raptorBuckets').update(
            {_id: 1},
            {$setOnInsert: {
              rank: 1,
            }, $push: {
              users: author.id,
            },
            },
            {upsert: true}
        );
      } else {
        await conn.collection('raptorBuckets').update(
            {_id: currentRaptors},
            {$inc: {
              rank: 1,
            }, $pull: {
              users: author.id,
            },
            }
        );
        await conn.collection('raptorBuckets').update(
            {_id: currentRaptors + 1},
            {$setOnInsert: {
              rank: 1,
            }, $push: {
              users: author.id,
            },
            },
            {upsert: true}
        );
      }
      conn.collection('userDB').update(
          {_id: author.id},
          {$inc: {
            raptorTotal: 1,
          },
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
      await conn.collection('userDB').update(
          {_id: msg.author.id},
          {$set: {
            siteName: suffix,
          },
          },
          {upsert: true}
      );
      returnMsg = msg.author +
          ', your NaNo username has been set to `' +
          suffix +
          '`.';
    } else {
      returnMsg = msg.author +
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
    const document = await conn.collection('userDB').findOne(
        {_id: msg.author.id}
    );
    const data = await conn.collection('raptorBuckets').findOne(
        {users: msg.author.id}
    );
    const usersWithRaptors = await conn.collection('raptorBuckets').findOne(
        {_id: 0}
    );
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
    statsTable += '** of **' + (usersWithRaptors.rank - 1) +'**)';
    if (document == null || document.siteName === undefined) {
      statsTable += '\n*NaNo Site Username:* unknown';
    } else {
      statsTable += '\n*NaNo Site Username:* `' + document.siteName + '`';
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
              '. *';
            if (client.users.get(userOrd[i]) === undefined) {
              raptorMsg += 'Unknown User';
            } else {
              raptorMsg += client.users.get(userOrd[i]).username;
            }
            raptorMsg += ':* ' +
              this.userRaptors[msg.guild.id][userOrd[i]];
          }
        }
      }
    }
    return raptorMsg;
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
   * @param {String} prefix - The bot's prefix.
   * @param {String} suffix - Information after the bot command.
   * @return {String} - The message to send to the user.
   */
  rollDice(prefix, suffix) {
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
            '**Error:**: Both values in an RPG-style roll must be integers.' +
            ' Example: `' +
            prefix +
            'roll 2d6`.';
          diceSum = 0;
          break;
        } else {
          if (rpgRoll[0] > 20) {
            diceString = '**Error:**: I cannot roll more than 20 dice at once.';
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
          diceString = '**Error:**: Both values in a range roll must be' +
            ' integers. Example: `' +
            prefix +
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
              '**Error:**: The first number in a range' +
              ' roll must be smaller than the second.';
            diceSum = 0;
            break;
          }
        }
      } else {
        diceString = '**Error:**: ' + faces[i] + ' is not a valid roll.' +
          ' Example: `' +
          prefix +
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
    return diceString;
  }
}

module.exports = new Tools();
