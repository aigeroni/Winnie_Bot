const prompts = require('./data.js');
const config = require('../config.json');
const fetch = require('node-fetch');
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
   * @param {String} prefix - The bot's prefix.
   * @param {String} suffix - Information after the bot command.
   * @return {String} - The message to send to the user.
   */
  calcTarget(msg, prefix, suffix) {
    let returnMsg = '';
    const args = suffix.split(' ');
    const difficulty = args.shift();
    const time = args.shift();
    let base = null;
    if (!Number.isInteger(Number(time))) {
      returnMsg = 'Error: Duration must be a whole number. Example: `' +
          prefix +
          'target medium 15`.';
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
        returnMsg =
            'Error: Targets must be easy, medium, hard, or insane. Example: `' +
            prefix +
            'target medium 15`.';
      } else {
        const goalPerMinute = Math.ceil(Math.random() * 11) + base;
        const goalTotal = goalPerMinute * time;
        returnMsg = msg.author + ', your target is **' + goalTotal + '**.';
      }
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
      console.log(currentRaptors);
      if (currentRaptors == 0) {
        await conn.collection('raptorBuckets').update(
            {_id: 0},
            {$inc: {
              rank: 1,
            },
            }
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
      }
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
    let statsTable = '';
    const document = await conn.collection('userDB').findOne(
        {_id: msg.author.id}
    );
    const data = await conn.collection('raptorBuckets').findOne(
        {users: msg.author.id}
    );
    const usersWithRaptors = await conn.collection('raptorBuckets').findOne(
        {_id: 0}
    );
    if (!(document == null)) {
      statsTable += '***User Statistics for ' +
      client.users.get(document._id).username +
      ':***';
      let firstSeen = true;
      if (!(document.lifetimeSprintMinutes === undefined)) {
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
      if (!(document.raptorTotal === undefined)) {
        statsTable += '\n*Raptors:* **' +
            document.raptorTotal +
            '** (Global Rank **' +
            data.rank +
            '** of **' +
            (usersWithRaptors.rank - 1) +
            '**)';
      } else {
        statsTable += '\n*Raptors:* **0** (Global Rank **' +
            usersWithRaptors.rank +
            '** of **' +
            (usersWithRaptors.rank - 1) +
            '**)';
      }
      if (!(document.siteName === undefined)) {
        statsTable += '\n*NaNo Site Username:* `' +
          document.siteName +
          '`';
      } else {
        statsTable += '\n*NaNo Site Username:* unknown';
      }
      if (!(document.timezone === undefined)) {
        statsTable += '\n*Timezone:* `' + document.timezone + '`';
      } else {
        statsTable += '\n*Timezone:* unknown';
      }
    } else {
      statsTable += '***User Statistics for ' +
      msg.author.username +
      ':***\n';
      statsTable += '*Raptors:* **0** (Global Rank **' +
          usersWithRaptors.rank +
          '** of **' +
          (usersWithRaptors.rank - 1) +
          '**)\n';
      statsTable += '*NaNo Site Username:* unknown\n';
      statsTable += '*Timezone:* unknown\n';
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
              '. *' +
              client.users.get(userOrd[i]).username +
              ':* ' +
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
   * @param {Object} msg - The message that ran this function.
   * @param {String} prefix - The bot's prefix.
   * @param {String} suffix - Information after the bot command.
   * @return {String} - The message to send to the user.
   */
  rollDice(msg, prefix, suffix) {
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
            prefix +
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
              'Error: The first number in a range' +
              ' roll must be smaller than the second.';
            diceSum = 0;
            break;
          }
        }
      } else {
        diceString = 'Error: ' + faces[i] + ' is not a valid roll.' +
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
  /**
   * Allows server admins to set a custom prefix for Winnie.
   * @param {Object} msg - The message that ran this function.
   * @param {String} suffix - Information after the bot command.
   * @return {String} - The message to send to the user.
   */
  async customPrefix(msg, suffix) {
    let returnMsg = '';
    // display Winnie's current prefix (all users)
    if (suffix == '') {
      const data = await conn.collection('configDB').findOne(
          {_id: msg.guild.id}
      );
      if (data.prefix == undefined) {
        returnMsg = msg.author +
            ', this server does not have a custom prefix configured.';
      } else {
        returnMsg = msg.author +
            ', my current prefix is `' +
            data.prefix +
            '`.';
      }
    } else if (msg.member.permissions.has('ADMINISTRATOR')) {
      if (suffix == 'clear') {
        await conn
            .collection('configDB')
            .update(
                {_id: msg.guild.id},
                {$set: {prefix: undefined}},
                {upsert: true}
            );
        returnMsg = msg.author +
            ', you have reset my prefix to the default `' +
            config.cmd_prefix['default'] +
            '`.';
      } else { // change prefix (admins only)
        if (suffix.length > 0 && suffix.length < 3) {
          config.cmd_prefix[msg.guild.id] = suffix;
          await conn
              .collection('configDB')
              .update(
                  {_id: msg.guild.id},
                  {$set: {prefix: suffix}},
                  {upsert: true}
              );
          returnMsg = msg.author +
              ', you have changed my prefix to `' +
              suffix +
              '`.';
        } else {
          returnMsg = 'Error: My prefix must be less than three characters.';
        }
      }
    } else {
      returnMsg = 'Error: Only server administrators are permitted to' +
          ' configure the prefix.';
    }
    return returnMsg;
  }
  /**
   * Allows server admins to configure a channel for word count reminders.
   * @param {Object} msg - The message that ran this function.
   * @param {String} suffix - Information after the bot command.
   * @return {String} - The message to send to the user.
   */
  async announcementChannel(msg, suffix) {
    let returnMsg = '';
    returnMsg = suffix;
    // display the current announcements channel (all users)
    if (suffix == '') {
      const data = await conn.collection('configDB').findOne(
          {_id: msg.guild.id}
      );
      if (data.announcements == undefined) {
        returnMsg = msg.author +
            ', announcements are not yet configured for this server.';
      } else {
        returnMsg = msg.author +
          ', announcements are posted in ' +
          client.channels.get(data.announcements) +
          '.';
      }
    } else { // change announcements channel (admins only)
      if (msg.member.permissions.has('ADMINISTRATOR')) {
        const channelObject = client.channels.get(suffix.slice(2, -1));
        if (channelObject != undefined) {
          const perms = (channelObject.guild.me.permissionsIn(channelObject));
          if (perms.hasPermission('SEND_MESSAGES')) {
            await conn
                .collection('configDB')
                .update(
                    {_id: msg.guild.id},
                    {$set: {announcements: channelObject.id}},
                    {upsert: true}
                );
            returnMsg = msg.author +
                ', you have changed the announcements channel to ' +
                channelObject +
                '.';
          } else {
            returnMsg = 'Error: I need permission to send messages in the' +
                ' announcements channel.';
          }
        } else {
          returnMsg = 'Error: ' +
              suffix +
              ' is not a valid channel.';
        }
      } else {
        returnMsg = 'Error: Only server administrators are permitted to' +
            ' configure the announcements channel.';
      }
    }
    return returnMsg;
  }
}

module.exports = new Tools();
