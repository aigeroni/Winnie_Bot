const profanity = require('profanity-util', {substring: 'lite'});
const emojiRegex = require('emoji-regex/es2015/index.js');
const ChainWar = require('./chainwar');
const Sprint = require('./sprint');
const War = require('./war');
const challengelist = require('./challengelist.js');
const config = require('../config.json');
const logger = require('../logger.js');
const conn = require('mongoose').connection;

/** Class containing functions for challenge management. */
class Challenges {
  /** Initialise variables required for challenge management. */
  constructor() {
    // TODO: Move to a root-level config.js
    // file and import from there
    this.WAR_RAPTOR_CHANCE = 10;

    this.timerID = 1;
    this.crossServerStatus = {};
    this.autoSumStatus = {};
    this.regex = emojiRegex();
  }
  /**
   * Add a user to the list of joined users for a challenge.
   * @param {Object} msg - The message that ran this function.
   * @param {String} suffix - Information after the bot command.
   * @return {String} - The message to send to the user.
   */
  async joinChallenge(msg, suffix) {
    let returnMsg = '';
    const challengeID = suffix;
    if (isNaN(challengeID)) {
      returnMsg = 'Error: Challenge ID must be an integer. Example: `' +
          config.cmd_prefix +
          'join 10793`.';
    } else if (challengeID < 1) {
      returnMsg = 'Error: Challenge ID must be an integer. Example: `' +
          config.cmd_prefix +
          'join 10793`.';
    } else if (challengeID in challengelist.challengeList) {
      if (
        challengelist.challengeList[challengeID].hidden &&
        client.channels.get(challengelist.challengeList[challengeID].channelID)
            .guild.id != msg.guild.id
      ) {
        returnMsg = msg.author +
            ', you do not have permission to join' +
            ' this challenge.';
      } else {
        if (
          msg.author.id in challengelist.challengeList[challengeID].joinedUsers
        ) {
          returnMsg = msg.author +
              ', you already have notifications' +
              ' enabled for this challenge.';
        } else {
          if (challengelist.challengeList[challengeID].type == 'sprint') {
            challengelist.challengeList[challengeID].joinedUsers[
                msg.author.id
            ] = {
              timestampCalled: undefined,
              timeTaken: undefined,
              channelID: msg.channel.id,
            };
          } else {
            challengelist.challengeList[challengeID].joinedUsers[
                msg.author.id
            ] = {
              countData: undefined,
              countType: undefined,
              channelID: msg.channel.id,
            };
          }
          const pushID = msg.channel.id;
          const searchIndex = challengelist.challengeList[
              challengeID
          ].hookedChannels.indexOf(pushID);
          if (searchIndex == -1) {
            challengelist.challengeList[challengeID].hookedChannels.push(
                pushID
            );
          }
          returnMsg = msg.author +
              ', you have joined ' +
              challengelist.challengeList[challengeID].displayName;
          try {
            await conn.collection('challengeDB').update(
                {_id: parseInt(challengeID)},
                {
                  $set: {
                    hookedChannels:
                    challengelist.challengeList[challengeID].hookedChannels,
                    joinedUsers:
                    challengelist.challengeList[challengeID].joinedUsers,
                  },
                },
                {upsert: true}
            );
          } catch (e) {
            logger.error('Error: ' + e);
          }
        }
      }
    } else {
      returnMsg = 'Error: Challenge ' + challengeID + ' does not exist!';
    }
    return returnMsg;
  }
  /**
   * Remove a user from the list of joined users for a challenge.
   * @param {Object} msg - The message that ran this function.
   * @param {String} suffix - Information after the bot command.
   * @return {String} - The message to send to the user.
   */
  async leaveChallenge(msg, suffix) {
    let returnMsg = '';
    const challengeID = suffix;
    if (isNaN(challengeID)) {
      returnMsg = 'Error: Challenge ID must be an integer. Example: `' +
          config.cmd_prefix +
          'leave 10793`.';
    } else if (challengeID < 1) {
      returnMsg = 'Error: Challenge ID must be an integer. Example: `' +
          config.cmd_prefix +
          'leave 10793`.';
    } else if (challengeID in challengelist.challengeList) {
      if (
        msg.author.id in challengelist.challengeList[challengeID].joinedUsers
      ) {
        delete challengelist.challengeList[challengeID].joinedUsers[
            msg.author.id
        ];
        returnMsg = msg.author +
            ', you have left ' +
            challengelist.challengeList[challengeID].displayName;
        await conn.collection('challengeDB').update(
            {_id: parseInt(challengeID)},
            {
              $set: {
                joinedUsers: challengelist.challengeList[challengeID]
                    .joinedUsers,
              },
            },
            {upsert: true}
        );
      } else {
        returnMsg = msg.author +
            ', you have not yet joined this challenge.';
      }
    } else {
      returnMsg = 'Error: Challenge ' + challengeID + ' does not exist!';
    }
    return returnMsg;
  }
  /**
   * Creates a new sprint.
   * @param {Object} msg - The message that ran this function.
   * @param {String} suffix - Information after the bot command.
   * @return {String} - The message to send to the user.
   */
  async startSprint(msg, suffix) {
    let returnMsg = '';
    let joinFlag = false;
    let crossServerHide = this.crossServerStatus[msg.guild.id];
    const user = await conn.collection('userDB').findOne(
        {_id: msg.author.id}
    );
    if (user != null) {
      if (user.autoStatus == 'off') {
        crossServerHide = true;
      }
    }
    const args = suffix.split(' ');
    if (args[0] == 'join') {
      args.shift();
      joinFlag = true;
    }
    if (args[0] == 'hide') {
      args.shift();
      crossServerHide = true;
    }
    const words = args.shift();
    const timeout = args.shift();
    let start = args.shift();
    let sprintName = args.join(' ');
    if (start === undefined) {
      start = 1;
    }
    if (sprintName == '') {
      sprintName = msg.author.username + '\'s sprint';
    }
    if (profanity.check(sprintName).length > 0) {
      returnMsg = 'Error: Sprint names may not contain profanity.';
    } else if (this.regex.exec(sprintName)) {
      returnMsg = 'Error: Sprint names may not contain emoji.';
    } else if (msg.mentions.members.size > 0) {
      returnMsg = 'Error: Sprint names may not mention users.';
    } else if (!Number.isInteger(Number(words))) {
      returnMsg = 'Error: Word goal must be a whole number. Example: `' +
          config.cmd_prefix +
          'sprint 200 10 1`.';
    } else if (isNaN(timeout)) {
      returnMsg = 'Error: Sprint duration must be a number. Example: `' +
          config.cmd_prefix +
          'sprint 200 10 1`.';
    } else if (isNaN(start)) {
      returnMsg = 'Error: Time to start must be a number. Example: `' +
          config.cmd_prefix +
          'sprint 200 10 1`.';
    } else if (start > 30) {
      returnMsg =
          'Error: Sprints cannot start more than 30 minutes in the future.';
    } else if (timeout > 60) {
      returnMsg = 'Error: Sprints cannot last for more than an hour.';
    } else if (words < 1) {
      returnMsg = 'Error: Word goal cannot be negative.';
    } else if (start <= 0) {
      returnMsg = 'Error: Sprints cannot start in the past.';
    } else if (timeout < 1) {
      returnMsg = 'Error: Sprints must run for at least a minute.';
    } else if (sprintName.length > 150) {
      returnMsg = 'Error: Sprint names must be 150 characters or less.';
    } else {
      try {
        const creatorID = msg.author.id;
        const challengeID = this.timerID;
        const startTime = new Date().getTime();
        challengelist.challengeList[challengeID] = new Sprint(
            challengeID,
            creatorID,
            sprintName,
            startTime,
            start,
            words,
            timeout,
            msg.channel.id,
            crossServerHide,
            [msg.channel.id],
            {}
        );
        await conn
            .collection('timer')
            .update(
                {data: this.timerID},
                {data: this.timerID + 1},
                {upsert: true}
            );
        this.timerID = this.timerID + 1;
        if (joinFlag) {
          returnMsg += await this.joinChallenge(msg, challengeID);
        }
      } catch (e) {
        returnMsg = 'Error: Sprint creation failed.';
        logger.error('Error %s: %s.', e, e.stack);
      }
    }
    return returnMsg;
  }
  /**
   * Creates a new war.
   * @param {Object} msg - The message that ran this function.
   * @param {String} suffix - Information after the bot command.
   * @return {String} - The message to send to the user.
   */
  async startWar(msg, suffix) {
    let returnMsg = '';
    let joinFlag = false;
    let crossServerHide = this.crossServerStatus[msg.guild.id];
    const user = await conn.collection('userDB').findOne(
        {_id: msg.author.id}
    );
    if (user != null) {
      if (user.autoStatus == 'off') {
        crossServerHide = true;
      }
    }
    const args = suffix.split(' ');
    if (args[0] == 'join') {
      args.shift();
      joinFlag = true;
    }
    if (args[0] == 'hide') {
      args.shift();
      crossServerHide = true;
    }
    const duration = args.shift();
    let start = args.shift();
    let warName = args.join(' ');
    if (start === undefined) {
      start = 1;
    }
    if (warName == '') {
      warName = msg.author.username + '\'s war';
    }
    if (profanity.check(warName).length > 0) {
      returnMsg = 'Error: War names may not contain profanity.';
    } else if (this.regex.exec(warName)) {
      returnMsg = 'Error: War names may not contain emoji.';
    } else if (msg.mentions.members.size > 0) {
      returnMsg = 'Error: War names may not mention users.';
    } else if (isNaN(start)) {
      returnMsg = 'Error: Time to start must be a number. Example: `' +
          config.cmd_prefix +
          'war 10 1`.';
    } else if (isNaN(duration)) {
      returnMsg = 'Error: War duration must be a number. Example: `' +
          config.cmd_prefix +
          'war 10 1`.';
    } else if (start > 30) {
      returnMsg =
          'Error: Wars cannot start more than 30 minutes in the future.';
    } else if (duration > 60) {
      returnMsg = 'Error: Wars cannot last for more than an hour.';
    } else if (start <= 0) {
      returnMsg = 'Error: Wars cannot start in the past.';
    } else if (duration < 1) {
      returnMsg = 'Error: Wars must run for at least a minute.';
    } else if (warName.length > 150) {
      returnMsg = 'Error: War names must be 150 characters or less.';
    } else {
      try {
        const creatorID = msg.author.id;
        const challengeID = this.timerID;
        const startTime = new Date().getTime();
        challengelist.challengeList[challengeID] = new War(
            challengeID,
            creatorID,
            warName,
            startTime,
            start,
            duration,
            msg.channel.id,
            crossServerHide,
            [msg.channel.id],
            {}
        );
        await conn
            .collection('timer')
            .update(
                {data: this.timerID},
                {data: this.timerID + 1},
                {upsert: true}
            );
        this.timerID = this.timerID + 1;
        if (joinFlag) {
          returnMsg += await this.joinChallenge(msg, challengeID);
        }
      } catch (e) {
        returnMsg = 'Error: War creation failed.';
        logger.error('Error %s: %s.', e, e.stack);
      }
    }
    return returnMsg;
  }
  /**
   * Creates a new chain war.
   * @param {Object} msg - The message that ran this function.
   * @param {String} suffix - Information after the bot command.
   * @return {String} - The message to send to the user.
   */
  async startChainWar(msg, suffix) {
    let returnMsg = '';
    let joinFlag = false;
    let crossServerHide = this.crossServerStatus[msg.guild.id];
    const user = await conn.collection('userDB').findOne(
        {_id: msg.author.id}
    );
    if (user != null) {
      if (user.autoStatus == 'off') {
        crossServerHide = true;
      }
    }
    const args = suffix.split(' ');
    if (args[0] == 'join') {
      args.shift();
      joinFlag = true;
    }
    if (args[0] == 'hide') {
      args.shift();
      crossServerHide = true;
    }
    const chainWarCount = args.shift();
    const duration = args.shift();
    let timeBetween = args.shift();
    let warName = args.join(' ');
    if (timeBetween === undefined) {
      timeBetween = 1;
    }
    if (warName == '') {
      warName = msg.author.username + '\'s war';
    }
    if (profanity.check(warName).length > 0) {
      returnMsg = 'Error: War names may not contain profanity.';
    } else if (this.regex.exec(warName)) {
      returnMsg = 'Error: War names may not contain emoji.';
    } else if (msg.mentions.members.size > 0) {
      returnMsg = 'Error: War names may not mention users.';
    } else if (isNaN(chainWarCount)) {
      returnMsg = 'Error: War count must be a number. Example: `' +
          config.cmd_prefix +
          'chainwar 2 10 1`.';
    } else if (isNaN(timeBetween)) {
      returnMsg = 'Error: Time between wars must be a number. Example: `' +
          config.cmd_prefix +
          'chainwar 2 10 1`.';
    } else if (timeBetween > 30) {
      returnMsg = 'Error: There cannot be more than 30 minutes' +
          ' between wars in a chain.';
    } else if (isNaN(duration)) {
      returnMsg = 'Error: War duration must be a number. Example: `' +
          config.cmd_prefix +
          'chainwar 2 10 1`.';
    } else if (chainWarCount < 2 || chainWarCount > 10) {
      returnMsg = 'Error: Chain wars must be between two and ten wars long.';
    } else if (duration * chainWarCount > 120) {
      returnMsg =
          'Error: Chain wars cannot run for more than two hours in total.';
    } else if (timeBetween <= 0) {
      returnMsg = 'Error: Chain wars cannot overlap.';
    } else if (duration < 1) {
      returnMsg = 'Error: Wars must run for at least a minute.';
    } else if (warName.length > 150) {
      returnMsg = 'Error: War names must be 150 characters or less.';
    } else {
      try {
        const creatorID = msg.author.id;
        const challengeID = this.timerID;
        const startTime = new Date().getTime();
        challengelist.challengeList[challengeID] = new ChainWar(
            challengeID,
            creatorID,
            warName,
            startTime,
            1,
            chainWarCount,
            timeBetween,
            duration,
            msg.channel.id,
            crossServerHide,
            [msg.channel.id],
            {}
        );
        await conn
            .collection('timer')
            .update(
                {data: this.timerID},
                {data: this.timerID + 1},
                {upsert: true}
            );
        this.timerID = this.timerID + 1;
        if (joinFlag) {
          returnMsg += await this.joinChallenge(msg, challengeID);
        }
      } catch (e) {
        returnMsg = 'Error: Chain war creation failed.';
        logger.error('Error %s: %s.', e, e.stack);
      }
    }
    return returnMsg;
  }
  /**
   * Terminates a challenge early.
   * @param {Object} msg - The message that ran this function.
   * @param {String} suffix - Information after the bot command.
   * @return {Object} - Channels to send message to, and message to send.
   */
  async stopChallenge(msg, suffix) {
    let returnMsg = '';
    let channelList = [msg.channel.id];
    const challengeID = suffix;
    if (isNaN(challengeID) || challengeID < 1) {
      returnMsg =
          'Error: Challenge ID must be an integer. Example: `' +
          config.cmd_prefix +
          'cancel 10793`.';
    } else if (challengeID in challengelist.challengeList) {
      const stopName = challengelist.challengeList[challengeID].displayName;
      if (
        !(
          challengelist.challengeList[challengeID].hidden &&
          challengelist.challengeList[challengeID].channelID != msg.channel.id
        )
      ) {
        if (challengelist.challengeList[challengeID].creator == msg.author.id) {
          await conn.collection('challengeDB').remove(
              {_id: Number(challengeID)}
          );
          channelList = challengelist.challengeList[challengeID].hookedChannels;
          returnMsg = stopName + ' has been ended by the creator.';
          delete challengelist.challengeList[challengeID];
        } else {
          returnMsg = 'Error: Only the creator of ' +
              stopName +
              ' can end this challenge.';
        }
      } else {
        returnMsg = msg.author +
            ', you do not have permission to end this challenge.';
      }
    } else {
      returnMsg = 'Error: Challenge ' + challengeID + ' does not exist!';
    }
    return {channelList: channelList, returnMsg: returnMsg};
  }
  /**
   * Lists all running challenges.
   * @param {Object} client - The Discord client.
   * @param {Object} msg - The message that ran this function.
   * @return {String} - The message to send to the user.
   */
  listChallenges(client, msg) {
    let nonHiddenTotal = 0;
    let timerInfo = '';
    for (const i in challengelist.challengeList) {
      if (challengelist.challengeList.hasOwnProperty(i)) {
        const parentChannel = client.channels.get(
            challengelist.challengeList[i].channelID
        );
        const parentGuild = parentChannel.guild;
        // check whether a challenge is hidden
        if (
          !(
            challengelist.challengeList[i].hidden &&
            parentGuild.id != msg.guild.id
          )
        ) {
          nonHiddenTotal += 1;
          // find originating server name
          const parentGuildName = parentGuild.name;
          let timeout = '';
          switch (challengelist.challengeList[i].state) {
            case 0:
              if (challengelist.challengeList[i].cStart % 60 < 10) {
                timeout =
                  '0' + (challengelist.challengeList[i].cStart % 60).toString();
              } else {
                timeout = challengelist.challengeList[i].cStart % 60;
              }
              timerInfo +=
                i + ': ' + challengelist.challengeList[i].displayName + ' (';
              if (challengelist.challengeList[i].type == 'sprint') {
                timerInfo += challengelist.challengeList[i].goal + ' words, ';
              }
              timerInfo +=
                challengelist.challengeList[i].duration +
                ' minutes, starts in ' +
                Math.floor(challengelist.challengeList[i].cStart / 60) +
                ':' +
                timeout +
                '), ' +
                parentGuildName +
                '\n';
              break;
            case 1:
              if (challengelist.challengeList[i].cDur % 60 < 10) {
                timeout =
                  '0' + (challengelist.challengeList[i].cDur % 60).toString();
              } else {
                timeout = challengelist.challengeList[i].cDur % 60;
              }
              timerInfo +=
                i + ': ' + challengelist.challengeList[i].displayName + ' (';
              if (challengelist.challengeList[i].type == 'sprint') {
                timerInfo += challengelist.challengeList[i].goal + ' words, ';
              }
              timerInfo +=
                challengelist.challengeList[i].duration +
                ' minutes, ' +
                Math.floor(challengelist.challengeList[i].cDur / 60) +
                ':' +
                timeout +
                ' remaining), ' +
                parentGuildName +
                '\n';
              break;
            case 2:
            case 3:
              timerInfo +=
                i + ': ' + challengelist.challengeList[i].displayName + ' (';
              if (challengelist.challengeList[i].type == 'sprint') {
                timerInfo += challengelist.challengeList[i].goal + ' words, ';
              }
              timerInfo +=
                challengelist.challengeList[i].duration +
                ' minutes, ended), ' +
                parentGuildName +
                '\n';
              break;
            default:
              break;
          }
        }
      }
    }
    let listMsg = '';
    if (nonHiddenTotal == 0) {
      listMsg +=
        'There are no challenges running.' + ' Why don\'t you start one?';
    } else if (nonHiddenTotal == 1) {
      listMsg += 'There is ' + nonHiddenTotal + ' challenge running:\n';
    } else {
      listMsg += 'There are ' + nonHiddenTotal + ' challenges running:\n';
    }
    if (nonHiddenTotal > 0) {
      listMsg += timerInfo;
    }
    return listMsg;
  }
  /**
   * Calls time for a sprint.
   * @param {Object} msg - The message that ran this function.
   * @param {String} suffix - Information after the bot command.
   * @return {Object} - Message to send to user, raptor determination value.
   */
  async callTime(msg, suffix) {
    let returnMsg = '';
    const args = suffix.split(' ');
    const challengeID = args.shift();
    let raptorCheck = true;
    if (challengeID in challengelist.challengeList) {
      if (challengelist.challengeList[challengeID].type == 'sprint') {
        if (challengelist.challengeList[challengeID].state < 2) {
          const doneStamp = new Date().getTime();
          const timeTaken = (
            doneStamp -
            challengelist.challengeList[challengeID].startStamp
          ) / 60000;
          challengelist.challengeList[challengeID].joinedUsers[
              msg.author.id
          ] = {
            timestampCalled: doneStamp,
            timeTaken: timeTaken,
            channelID: msg.channel.id,
          };
          const pushID = msg.channel.id;
          const searchIndex = challengelist.challengeList[
              challengeID
          ].hookedChannels.indexOf(pushID);
          if (searchIndex == -1) {
            challengelist.challengeList[challengeID].hookedChannels.push(
                pushID
            );
          }
          try {
            await conn.collection('challengeDB').update(
                {_id: parseInt(challengeID)},
                {
                  $set: {
                    joinedUsers:
                  challengelist.challengeList[challengeID].joinedUsers,
                  },
                },
                {upsert: true}
            );
          } catch (e) {
            logger.error('Error: ' + e);
          }
          returnMsg = msg.author +
              ', you completed the sprint in ' +
              timeTaken.toFixed(2) +
              ' minutes.';
        } else {
          raptorCheck = false;
          returnMsg = 'Error: This sprint has timed out.';
        }
      } else {
        raptorCheck = false;
        returnMsg = 'Error: You can only call time on a sprint.';
      }
    } else {
      raptorCheck = false;
      returnMsg = 'Error: This challenge does not exist.';
    }
    return {returnMsg: returnMsg, raptorCheck: raptorCheck};
  }
  /**
   * Adds a total to a challenge.
   * @param {Object} msg - The message that ran this function.
   * @param {String} suffix - Information after the bot command.
   * @return {Object} - Message to send to user, raptor determination value.
   */
  async addTotal(msg, suffix) {
    let returnMsg = '';
    const args = suffix.split(' ');
    const challengeID = args.shift();
    const wordsWritten = args.shift();
    let writtenType = args.shift();
    let raptorCheck = true;
    if (
      writtenType == 'line' ||
      writtenType == 'page' ||
      writtenType == 'word' ||
      writtenType == 'minute'
    ) {
      writtenType += 's';
    }
    if (
      !(
        writtenType == 'lines' ||
        writtenType == 'pages' ||
        writtenType == 'words' ||
        writtenType == 'minutes' ||
        writtenType === undefined
      )
    ) {
      raptorCheck = false;
      returnMsg = 'Error: You must work in words, lines, or pages.';
    } else {
      if (writtenType === undefined) {
        writtenType = 'words';
      }
      if (challengeID in challengelist.challengeList) {
        if (challengelist.challengeList[challengeID].type != 'sprint') {
          if (challengelist.challengeList[challengeID].state >= 2) {
            if (
              !(
                challengelist.challengeList[challengeID].hidden &&
                client.channels.get(
                    challengelist.challengeList[challengeID].channelID
                ).guild.id != msg.guild.id
              )
            ) {
              if (Number.isInteger(Number(wordsWritten))) {
                for (const user in challengelist.challengeList[challengeID]
                    .joinedUsers) {
                  if (user == msg.author.id) {
                    if (
                      !(
                        challengelist.challengeList[challengeID]
                            .joinedUsers[user].countData === undefined
                      )
                    ) {
                      raptorCheck = false;
                    }
                  }
                }
                if (Number(wordsWritten) < 1) {
                  raptorCheck = false;
                }
                challengelist.challengeList[challengeID].joinedUsers[
                    msg.author.id
                ] = {
                  countData: wordsWritten,
                  countType: writtenType,
                  channelID: msg.channel.id,
                };
                const pushID = msg.channel.id;
                const searchIndex = challengelist.challengeList[
                    challengeID
                ].hookedChannels.indexOf(pushID);
                if (searchIndex == -1) {
                  challengelist.challengeList[challengeID].hookedChannels.push(
                      pushID
                  );
                }
                try {
                  await conn.collection('challengeDB').update(
                      {_id: parseInt(challengeID)},
                      {
                        $set: {
                          joinedUsers:
                          challengelist.challengeList[challengeID].joinedUsers,
                        },
                      },
                      {upsert: true}
                  );
                } catch (e) {
                  logger.error('Error: ' + e);
                }
                returnMsg = msg.author +
                    ', your total of **' +
                    wordsWritten +
                    '** ' +
                    writtenType +
                    ' has been added to the summary.';
              } else {
                raptorCheck = false;
                returnMsg = msg.author +
                    ', I need a whole number to include in the summary!';
              }
            } else {
              raptorCheck = false;
              returnMsg = msg.author +
                  ', you do not have permission to join this challenge.';
            }
          } else {
            raptorCheck = false;
            returnMsg = 'Error: This challenge has not ended yet!';
          }
        } else {
          raptorCheck = false;
          returnMsg = 'Error: You cannot post a total for sprints.';
        }
      } else {
        raptorCheck = false;
        returnMsg = 'Error: This challenge does not exist!';
      }
    }
    return {returnMsg: returnMsg, raptorCheck: raptorCheck};
  }
  /**
   * Toggles cross-server display for a server's challenges.
   * @param {Object} msg - The message that ran this function.
   * @param {String} suffix - Information after the bot command.
   * @return {String} - The message to send to the user.
   */
  async xsDisplay(msg, suffix) {
    let returnMsg = '';
    if (suffix == '') {
      const user = await conn.collection('userDB').findOne(
          {_id: msg.author.id}
      );
      let xsType = 'on';
      if (user.xStatus == 'off') {
        xsType = 'off';
      }
      returnMsg = msg.author +
          ', you currently have cross-server display' +
          ' for your challenges **' +
          xsType +
          '**.';
    } else {
      const args = suffix.split(' ');
      if (args[0] == 'server') {
        if (args[1] === undefined) {
          let xsType = 'on';
          if (this.crossServerStatus[msg.guild.id] == true) {
            xsType = 'off';
          }
          returnMsg = msg.guild.name +
              ' currently has cross-server challenges turned **' +
              xsType +
              '**.';
        } else if (msg.member.permissions.has('ADMINISTRATOR')) {
          if (args[1] == 'on' || args[1] == 'off') {
            let xsType = 'on';
            if (args[1] == 'off') {
              xsType = 'off';
              this.crossServerStatus[msg.guild.id] = true;
            } else {
              xsType = 'on';
              this.crossServerStatus[msg.guild.id] = false;
            }
            await conn
                .collection('configDB')
                .update(
                    {_id: msg.guild.id},
                    {$set: {xStatus: this.crossServerStatus[msg.guild.id]}},
                    {upsert: true}
                );
            returnMsg = msg.author +
                ', you have turned cross-server challenges **' +
                xsType +
                '**.';
          } else {
            returnMsg = msg.author +
                ', use **on|off** to toggle cross-server challenges.';
          }
        } else {
          returnMsg = 'Error: Only server administrators are permitted' +
              ' to configure challenges.';
        }
      } else {
        if (suffix == 'on' || suffix == 'off') {
          let xsType = 'on';
          if (suffix == 'off') {
            xsType = 'off';
          } else {
            xsType = 'on';
          }
          await conn
              .collection('userDB')
              .update(
                  {_id: msg.author.id},
                  {$set: {xStatus: xsType}},
                  {upsert: true}
              );
          returnMsg = msg.author +
              ', you have turned cross-server display for your challenges **' +
              xsType +
              '**.';
        } else {
          returnMsg = msg.author +
              ', use **on|off** to toggle cross-server challenges.';
        }
      }
    }
    return returnMsg;
  }
  /**
   * Toggles automatic summaries after challenges for a server.
   * @param {Object} msg - The message that ran this function.
   * @param {String} suffix - Information after the bot command.
   * @return {String} - The message to send to the user.
   */
  async autoSum(msg, suffix) {
    let returnMsg = '';
    if (suffix == '') {
      const user = await conn.collection('userDB').findOne(
          {_id: msg.author.id}
      );
      let autoType = 'visible';
      if (user.autoStatus == 'off') {
        autoType = 'hidden';
      }
      returnMsg = msg.author +
          ', you currently have automatic' +
          ' summaries for your challenges **' +
          autoType +
          '**.';
    } else {
      const args = suffix.split(' ');
      if (args[0] == 'server') {
        if (args[1] === undefined) {
          let autoType = 'visible';
          if (this.autoSumStatus[msg.guild.id] == true) {
            autoType = 'hidden';
          }
          returnMsg = msg.guild.name +
              ' currently has automatic summaries **' +
              autoType +
              '**.';
        } else if (msg.member.permissions.has('ADMINISTRATOR')) {
          if (args[1] == 'show' || args[1] == 'hide') {
            let autoType = 'on';
            if (args[1] == 'hide') {
              autoType = 'off';
              this.autoSumStatus[msg.guild.id] = true;
            } else {
              autoType = 'on';
              this.autoSumStatus[msg.guild.id] = false;
            }
            await conn
                .collection('configDB')
                .update(
                    {_id: msg.guild.id},
                    {$set: {autoStatus: this.autoSumStatus[msg.guild.id]}},
                    {upsert: true}
                );
            returnMsg = msg.author +
                ', you have turned automatic summaries **' +
                autoType +
                '**.';
          } else {
            returnMsg = msg.author +
                ', use **show|hide** to toggle automatic summaries.';
          }
        } else {
          returnMsg = 'Error: Only server administrators are permitted' +
              ' to configure automatic summaries.';
        }
      } else {
        if (suffix == 'show' || suffix == 'hide') {
          let autoType = 'on';
          if (suffix == 'hide') {
            autoType = 'off';
          } else {
            autoType = 'on';
          }
          await conn
              .collection('userDB')
              .update(
                  {_id: msg.author.id},
                  {$set: {autoStatus: autoType}},
                  {upsert: true}
              );
          returnMsg = msg.author +
              ', you have turned automatic summaries for your challenges **' +
              autoType +
              '**.';
        } else {
          returnMsg = msg.author +
              ', use **show|hide** to toggle automatic summaries.';
        }
      }
    }
    return returnMsg;
  }
}

module.exports = new Challenges();
