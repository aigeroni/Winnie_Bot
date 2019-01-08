const goallist = require('./goallist.js');
const Goal = require('./goal');
const timezoneJS = require('timezone-js');
const logger = require('../logger.js');
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
   * @param {String} prefix - The bot's prefix.
   * @param {String} suffix - Information after the bot command.
   * @return {Boolean} - False in the event of an error.
   */
  async setTimezone(msg, prefix, suffix) {
    let returnMsg = '';
    const timezone = suffix.replace(/[a-zA-Z0-9]*/g,
        function(txt) {
          return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
    logger.info(timezone);
    const dateCheck = new timezoneJS.Date();
    if (suffix == '') {
      returnMsg = msg.author + ', I need a timezone to set!';
    } else {
      try {
        // check to see if timezone is in IANA library
        dateCheck.setTimezone(timezone);
      } catch (e) {
        if (e.code == 'ENOENT') {
          await msg.channel.send(
              '**Fatal Error:** Winnie cannot locate' +
              ' timezone information.\nWinnie will now terminate.'
          );
          await logger.info(
              'Fatal error: Winnie_Bot cannot locate' +
              ' timezone information.\nWinnie_Bot will now terminate.'
          );
          process.exit(1);
        } else {
          returnMsg =
              '**Error:** Winnie_Bot accepts IANA timezone identifiers only.' +
              ' These generally take the format of' +
              ' Continent/Your_Areas_Largest_City.\n' +
              '**For example:** `' +
              prefix +
              'timezone America/New_York`, `' +
              prefix +
              'timezone Australia/Sydney`, `' +
              prefix +
              'timezone Europe/London`';
        }
        return returnMsg;
      }
      // check entered timezone against regex
      if (!this.regionRegex.test(timezone)) {
        returnMsg =
            '**Error:** Winnie_Bot accepts IANA timezone identifiers only.' +
            ' These generally take the format of' +
            ' Continent/Your_Areas_Largest_City.\n' +
            '**For example:** `' +
            prefix +
            'timezone America/New_York`, `' +
            prefix +
            'timezone Australia/Sydney`, `' +
            prefix +
            'timezone Europe/London`';
        return returnMsg;
      }
      // add user to role, confirm
      conn.collection('userDB').update(
          {_id: msg.author.id},
          {$set: {
            timezone: timezone,
          },
          },
          {upsert: true}
      );
      returnMsg = msg.author +
          ', you have set your timezone to **' +
          timezone +
          '**.';
    }
    return returnMsg;
  }
  /**
   * Set a goal for a user.
   * @param {Object} msg - The message that ran this function.
   * @param {String} prefix - The bot's prefix.
   * @param {String} suffix - Information after the bot command.
   * @return {String} - The message to send to the user.
   */
  async setGoal(msg, prefix, suffix) {
    let returnMsg = '';
    const args = suffix.split(' ');
    const goal = args.shift();
    let goalType = args.shift();
    if (goal === undefined || goal == '') {
      returnMsg = msg.author + ', I need a goal to set!';
    } else if (!Number.isInteger(Number(goal))) {
      returnMsg = '**Error:** Your goal must be a whole number. Example: `' +
          prefix +
          'set 1667`.';
    } else if (msg.author.id in goallist.goalList) {
      returnMsg = msg.author +
          ', you have already set a goal today. Use' +
          ' the update commands to record your progress.';
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
        returnMsg = '**Error:** Goal type must be words, lines, pages,' +
            ' or minutes. Example: `' +
            prefix +
            'set 50 lines`.';
      } else {
        if (goalType === undefined) {
          goalType = 'words';
        }
        try {
          const user = await conn.collection('userDB').findOne(
              {_id: msg.author.id}
          );
          logger.info(user);
          if (user == null || user.timezone == undefined) {
            return msg.author +
                ', you need to set your timezone before' +
                ' setting a daily goal. Use the `!timezone`' +
                ' command to do so.';
          } else {
            // get timezone
            const userTZ = user.timezone;
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
            return msg.author +
                ', your goal for today is **' +
                goal +
                '** ' +
                goalType +
                '.';
          }
        } catch (e) {
          logger.info(e, e.stack);
          returnMsg = msg.author +
              ', you need to set your timezone before' +
              ' setting a daily goal. Use the `!timezone` command to do so.';
        }
      }
    }
    return returnMsg;
  }
  /**
   * Update a user's goal.
   * @param {Object} msg - The message that ran this function.
   * @param {String} prefix - The bot's prefix.
   * @param {String} suffix - Information after the bot command.
   * @param {Boolean} overwrite - Whether the progress is being added to (false)
   * or overwritten (true).
   * @return {String} - The message to send to the user.
   */
  updateGoal(msg, prefix, suffix, overwrite) {
    let returnMsg = '';
    const args = suffix.split(' ');
    const goal = args.shift();
    if (suffix == '') {
      returnMsg = msg.author + ', I need some progress to update!';
    } else if (!Number.isInteger(parseInt(goal))) {
      returnMsg = '**Error:** Your progress must be a whole number.' +
          ' Example: `' +
          prefix +
          'update 256`.';
    } else if (!(msg.author.id in goallist.goalList)) {
      returnMsg = msg.author +
          ', you have not yet set a goal for today. Use `' +
          prefix +
          'set <goal>` to do so.';
    } else {
      goallist.goalList[msg.author.id].addWords(goal, overwrite);
      returnMsg = this.goalData(msg.author);
    }
    return returnMsg;
  }
  /**
   * Resets a user's goal.
   * @param {Object} msg - The message that ran this function.
   * @param {String} prefix - The bot's prefix.
   * @param {String} suffix - Information after the bot command.
   * @return {String} - The message to send to the user.
   */
  async resetGoal(msg, prefix, suffix) {
    let returnMsg = '';
    const args = suffix.split(' ');
    const newGoal = args.shift();
    let newType = args.join(' ');
    if (newType == '') {
      newType = 'words';
    }
    if (!(msg.author.id in goallist.goalList)) {
      returnMsg = msg.author +
          ', you have not yet set a goal for today. Use `' +
          prefix +
          'set <goal>` to do so.';
    } else if (suffix === undefined || !(Number.isInteger(parseInt(newGoal)))) {
      conn.collection('goalDB').remove({authorID: msg.author.id});
      delete goallist.goalList[msg.author.id];
      returnMsg = msg.author +
          ', you have successfully reset your daily goal.';
    } else if (newType == goallist.goalList[msg.author.id].goalType) {
      goallist.goalList[msg.author.id].goal = newGoal;
      returnMsg = this.goalData(msg.author);
    } else {
      conn.collection('goalDB').remove({authorID: msg.author.id});
      delete goallist.goalList[msg.author.id];
      returnMsg = await this.setGoal(msg, prefix, suffix);
    }
    return returnMsg;
  }
  /**
   * Allows a user to view their progress towards their goal.
   * @param {Object} msg - The message that ran this function.
   * @param {String} prefix - The bot's prefix.
   * @return {String} - The message to send to the user.
   */
  viewGoal(msg, prefix) {
    let returnMsg = '';
    if (!(msg.author.id in goallist.goalList)) {
      returnMsg = msg.author +
          ', you have not yet set a goal for today. Use `' +
          prefix +
          'set <goal>` to do so.';
    } else {
      returnMsg = this.goalData(msg.author);
    }
    return returnMsg;
  }
  /**
   * Compiles a user's progress towards their goal.
   * @param {Object} author - The goal setter's Discord account.
   * @return {String} - The message to send to the user.
   */
  goalData(author) {
    return author +
      ', you have written **' +
      goallist.goalList[author.id].written +
      '** ' +
      goallist.goalList[author.id].goalType +
      ' of your **' +
      goallist.goalList[author.id].goal +
      '**-' +
      goallist.goalList[author.id].goalType.slice(0, -1) +
      ' goal.';
  }
}

module.exports = new Goals();
