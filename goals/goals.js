const goallist = require('./goallist.js');
const Goal = require('./goal');
const timezoneJS = require('timezone-js');
const logger = require('../logger.js');
const config = require('../config.json');
const conn = require('mongoose').connection;

/** Class containing functions for goal management. */
class Goals {
  /** Initialise variables for goal management. */
  constructor() {
    this.regionRegex = /^(Africa|America|Antarctica|Asia|Atlantic|Australia|Europe|Indian|Pacific|Etc)/;
  }
  /**
   * Check a list of roles for timezone roles.
   * @param {Object} roleList - A list of roles to check for timezones.
   * @return {Object} - A list of timezone roles.
   */
  regexCheck(roleList) {
    return this.test(roleList.name);
  }
  /**
   * Set a user's timezone.
   * @param {Object} msg - The message that ran this function.
   * @param {String} suffix - Information after the bot command.
   * @return {Boolean} - False in the event of an error.
   */
  async setTimezone(msg, suffix) {
    const timezone = suffix.replace(/[a-zA-Z0-9]*/g,
        function(txt) {
          return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
    logger.info(timezone);
    const dateCheck = new timezoneJS.Date();
    if (suffix == '') {
      msg.channel.send(msg.author + ', I need a timezone to set!');
    } else {
      try {
        // check to see if timezone is in IANA library
        dateCheck.setTimezone(timezone);
      } catch (e) {
        if (e.code == 'ENOENT') {
          await msg.channel.send(
              'Fatal error: Winnie_Bot cannot locate' +
              ' timezone information.\nWinnie_Bot will now terminate.'
          );
          process.exit(1);
        } else {
          msg.channel.send(
              'Error: Winnie_Bot accepts IANA timezone identifiers only.' +
              ' These generally take the format of' +
              ' Continent/Your_Areas_Largest_City.\n' +
              '**For example:** `' +
              config.cmd_prefix +
              'timezone America/New_York`, `' +
              config.cmd_prefix +
              'timezone Australia/Sydney`, `' +
              config.cmd_prefix +
              'timezone Europe/London`'
          );
        }
        return false;
      }
      // check entered timezone against regex
      if (!this.regionRegex.test(timezone)) {
        msg.channel.send(
            'Error: Winnie_Bot accepts IANA timezone identifiers only.' +
            ' These generally take the format of' +
            ' Continent/Your_Areas_Largest_City.\n' +
            '**For example:** `' +
            config.cmd_prefix +
            'timezone America/New_York`, `' +
            config.cmd_prefix +
            'timezone Australia/Sydney`, `' +
            config.cmd_prefix +
            'timezone Europe/London`'
        );
        return false;
      }
      // create new role if needed, find role ID
      try {
        if (msg.guild.roles.find('name', timezone) === null) {
          await msg.guild.createRole({name: timezone});
        }
      } catch (e) {
        if (e.code == 50013) {
          msg.channel.send(
              'Error: Winnie requires the Manage Roles permission to set' +
              ' timezones.  Please contact your server admin.'
          );
        } else {
          msg.channel.send('Unknown error. Check log file for details.');
        }
        return false;
      }
      const tzRole = msg.guild.roles.find('name', timezone);
      // get timezone
      const currentRoleList = msg.member.roles.filter(
          this.regexCheck,
          this.regionRegex
      );
      // add user to role, confirm
      await msg.member.removeRoles(currentRoleList);
      msg.channel.send(
          msg.author + ', you have set your timezone to **' + timezone + '**.'
      );
      await msg.member.addRole(tzRole);
    }
  }
  /**
   * Set a goal for a user.
   * @param {Object} msg - The message that ran this function.
   * @param {String} suffix - Information after the bot command.
   */
  setGoal(msg, suffix) {
    const args = suffix.split(' ');
    const goal = args.shift();
    let goalType = args.shift();
    if (goal === undefined || goal == '') {
      msg.channel.send(msg.author + ', I need a goal to set!');
    } else if (!Number.isInteger(Number(goal))) {
      msg.channel.send(
          'Error: Your goal must be a whole number. Example: `' +
          config.cmd_prefix +
          'set 1667`.'
      );
    } else if (msg.author.id in goallist.goalList) {
      msg.channel.send(
          msg.author +
          ', you have already set a goal today. Use' +
          ' the update commands to record your progress.'
      );
    } else {
      if (
        goalType == 'line' ||
        goalType == 'page' ||
        goalType == 'word' ||
        goalType == 'minute'
      ) {
        goalType += 's';
      }
      if (
        !(
          goalType == 'lines' ||
          goalType == 'pages' ||
          goalType == 'minutes' ||
          goalType == 'words' ||
          goalType === undefined
        )
      ) {
        msg.channel.send(
            'Error: Goal type must be words, lines, pages,' +
            ' or minutes. Example: `' +
            config.cmd_prefix +
            'set 50 lines`.');
      } else {
        if (goalType === undefined) {
          goalType = 'words';
        }
        try {
          // get timezone
          const tzRole = msg.member.roles.filter(
              this.regexCheck,
              this.regionRegex
          );
          const userTZ = tzRole.first().name;
          // get current time
          const startTime = new timezoneJS.Date();
          startTime.setTimezone(userTZ);
          // calculate next midnight based on timezone
          const endTime = new timezoneJS.Date();
          endTime.setTimezone(userTZ);
          endTime.setHours(24, 0, 0, 0);
          goallist.goalList[msg.author.id] = new Goal(
              msg.author.id,
              goal,
              goalType,
              0,
              startTime.getTime(),
              endTime.getTime(),
              msg.channel.id
          );
          msg.channel.send(
              msg.author +
              ', your goal for today is **' +
              goal +
              '** ' +
              goalType +
              '.'
          );
        } catch (e) {
          logger.info(e, e.stack);
          msg.channel.send(
              msg.author +
              ', you need to set your timezone before' +
              ' setting a daily goal. Use the !timezone command to do so.'
          );
        }
      }
    }
  }
  /**
   * Update a user's goal.
   * @param {Object} msg - The message that ran this function.
   * @param {String} suffix - Information after the bot command.
   * @param {Boolean} overwrite - Whether the progress is being added to (false)
   * or overwritten (true).
   */
  updateGoal(msg, suffix, overwrite) {
    if (suffix == '') {
      msg.channel.send(msg.author + ', I need some progress to update!');
    } else {
      const args = suffix.split(' ');
      const goal = args.shift();
      if (!Number.isInteger(parseInt(goal))) {
        msg.channel.send(
            'Error: Your progress must be a whole number. Example: `' +
            config.cmd_prefix +
            'update 256`.');
      } else if (!(msg.author.id in goallist.goalList)) {
        msg.channel.send(
            msg.author +
            ', you have not yet set a goal for today.' +
            ' Use `!set <goal>` to do so.'
        );
      } else {
        goallist.goalList[msg.author.id].addWords(goal, overwrite);
        msg.channel.send(
            msg.author +
            ', you have written **' +
            goallist.goalList[msg.author.id].written +
            '** ' +
            goallist.goalList[msg.author.id].goalType +
            ' of your **' +
            goallist.goalList[msg.author.id].goal +
            '**-' +
            goallist.goalList[msg.author.id].goalType.slice(0, -1) +
            ' goal.'
        );
      }
    }
  }
  /**
   * Resets a user's goal.
   * @param {Object} msg - The message that ran this function.
   * @param {String} suffix - Information after the bot command.
   */
  resetGoal(msg, suffix) {
    if (!(msg.author.id in goallist.goalList)) {
      msg.channel.send(
          msg.author +
          ', you have not yet set a goal for today. Use `!set <goal>` to do so.'
      );
    } else {
      const args = suffix.split(' ');
      const newGoal = args.shift();
      logger.info(newGoal);
      let newType = args.join(' ');
      if (newType == '') {
        newType = 'words';
      }
      if (suffix === undefined || !(Number.isInteger(parseInt(newGoal)))) {
        conn.collection('goalDB').remove({authorID: msg.author.id});
        delete goallist.goalList[msg.author.id];
        msg.channel.send(
            msg.author + ', you have successfully reset your daily goal.'
        );
      } else {
        if (newType == goallist.goalList[msg.author.id].goalType) {
          goallist.goalList[msg.author.id].goal = newGoal;
          msg.channel.send(
              msg.author +
              ', you have written **' +
              goallist.goalList[msg.author.id].written +
              '** ' +
              goallist.goalList[msg.author.id].goalType +
              ' of your **' +
              goallist.goalList[msg.author.id].goal +
              '**-' +
              goallist.goalList[msg.author.id].goalType.slice(0, -1) +
              ' goal.'
          );
        } else {
          conn.collection('goalDB').remove({authorID: msg.author.id});
          delete goallist.goalList[msg.author.id];
          this.setGoal(msg, suffix);
        }
      }
    }
  }
  /**
   * Allows a user to view their progress towards their goal.
   * @param {Object} msg - The message that ran this function.
   */
  viewGoal(msg) {
    if (!(msg.author.id in goallist.goalList)) {
      msg.channel.send(
          msg.author +
          ', you have not yet set a goal for today. Use `!set <goal>` to do so.'
      );
    } else {
      msg.channel.send(
          msg.author +
          ', you have written **' +
          goallist.goalList[msg.author.id].written +
          '** ' +
          goallist.goalList[msg.author.id].goalType +
          ' of your **' +
          goallist.goalList[msg.author.id].goal +
          '**-' +
          goallist.goalList[msg.author.id].goalType.slice(0, -1) +
          ' goal.'
      );
    }
  }
}

module.exports = new Goals();
