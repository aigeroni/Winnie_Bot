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
   */
  joinChallenge(msg, suffix) {
    const challengeID = suffix;
    if (isNaN(challengeID)) {
      msg.channel.send(
          'Error: Challenge ID must be an integer. Example: `' +
          config.cmd_prefix +
          'join 10793`.'
      );
    } else if (challengeID < 1) {
      msg.channel.send(
          'Error: Challenge ID must be an integer. Example: `' +
          config.cmd_prefix +
          'join 10793`.'
      );
    } else if (challengeID in challengelist.challengeList) {
      if (
        challengelist.challengeList[challengeID].hidden &&
        client.channels.get(challengelist.challengeList[challengeID].channelID)
            .guild.id != msg.guild.id
      ) {
        msg.channel.send(
            msg.author +
            ', you do not have permission to join' +
            ' this challenge.'
        );
      } else {
        if (
          msg.author.id in challengelist.challengeList[challengeID].joinedUsers
        ) {
          msg.channel.send(
              msg.author +
              ', you already have notifications' +
              ' enabled for this challenge.'
          );
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
          msg.channel.send(
              msg.author +
              ', you have joined ' +
              challengelist.challengeList[challengeID].displayName
          );
          try {
            conn.collection('challengeDB').update(
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
        }
      }
    } else {
      msg.channel.send('Error: Challenge ' + challengeID + ' does not exist!');
    }
  }
  /**
   * Remove a user from the list of joined users for a challenge.
   * @param {Object} msg - The message that ran this function.
   * @param {String} suffix - Information after the bot command.
   */
  leaveChallenge(msg, suffix) {
    const challengeID = suffix;
    if (isNaN(challengeID)) {
      msg.channel.send(
          'Error: Challenge ID must be an integer. Example: `' +
          config.cmd_prefix +
          'leave 10793`.'
      );
    } else if (challengeID < 1) {
      msg.channel.send(
          'Error: Challenge ID must be an integer. Example: `' +
          config.cmd_prefix +
          'leave 10793`.'
      );
    } else if (challengeID in challengelist.challengeList) {
      if (
        msg.author.id in challengelist.challengeList[challengeID].joinedUsers
      ) {
        delete challengelist.challengeList[challengeID].joinedUsers[
            msg.author.id
        ];
        msg.channel.send(
            msg.author +
            ', you have left ' +
            challengelist.challengeList[challengeID].displayName
        );
        conn.collection('challengeDB').update(
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
        msg.channel.send(
            msg.author + ', you have not yet joined this' + ' challenge.'
        );
      }
    } else {
      msg.channel.send('Error: Challenge ' + challengeID + ' does not exist!');
    }
  }
  /**
   * Creates a new sprint.
   * @param {Object} msg - The message that ran this function.
   * @param {String} suffix - Information after the bot command.
   */
  startSprint(msg, suffix) {
    let joinFlag = false;
    let crossServerHide = this.crossServerStatus[msg.guild.id];
    conn
        .collection('userDB')
        .findOne(
            {_id: msg.author.id}, function(e, user) {
              if (user.autoStatus == 'off') {
                crossServerHide = true;
              }
            }
        );
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
      msg.channel.send('Error: Sprint names may not contain profanity.');
    } else if (this.regex.exec(sprintName)) {
      msg.channel.send('Error: Sprint names may not contain emoji.');
    } else if (msg.mentions.members.size > 0) {
      msg.channel.send('Error: Sprint names may not mention users.');
    } else if (!Number.isInteger(Number(words))) {
      msg.channel.send(
          'Error: Word goal must be a whole number. Example: `' +
          config.cmd_prefix +
          'sprint 200 10 1`.'
      );
    } else if (isNaN(timeout)) {
      msg.channel.send(
          'Error: Sprint duration must be a number. Example: `' +
          config.cmd_prefix +
          'sprint 200 10 1`.'
      );
    } else if (isNaN(start)) {
      msg.channel.send(
          'Error: Time to start must be a number. Example: `' +
          config.cmd_prefix +
          'sprint 200 10 1`.'
      );
    } else if (start > 30) {
      msg.channel.send(
          'Error: Sprints cannot start more than 30 minutes in the future.'
      );
    } else if (timeout > 60) {
      msg.channel.send('Error: Sprints cannot last for more than an hour.');
    } else if (words < 1) {
      msg.channel.send('Error: Word goal cannot be negative.');
    } else if (start <= 0) {
      msg.channel.send('Error: Sprints cannot start in the past.');
    } else if (timeout < 1) {
      msg.channel.send('Error: Sprints must run for at least a minute.');
    } else if (sprintName.length > 150) {
      msg.channel.send('Error: Sprint names must be 150 characters or less.');
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
            {}
        );
        conn
            .collection('timer')
            .update(
                {data: this.timerID},
                {data: this.timerID + 1},
                {upsert: true}
            );
        this.timerID = this.timerID + 1;
        if (joinFlag) {
          this.joinChallenge(msg, challengeID);
        }
      } catch (e) {
        msg.channel.send('Error: Sprint creation failed.');
        logger.error('Error %s: %s.', e, e.stack);
      }
    }
  }
  /**
   * Creates a new war.
   * @param {Object} msg - The message that ran this function.
   * @param {String} suffix - Information after the bot command.
   */
  startWar(msg, suffix) {
    let joinFlag = false;
    let crossServerHide = this.crossServerStatus[msg.guild.id];
    conn
        .collection('userDB')
        .findOne(
            {_id: msg.author.id}, function(e, user) {
              if (user.autoStatus == 'off') {
                crossServerHide = true;
              }
            }
        );
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
      msg.channel.send('Error: War names may not contain profanity.');
    } else if (this.regex.exec(warName)) {
      msg.channel.send('Error: War names may not contain emoji.');
    } else if (msg.mentions.members.size > 0) {
      msg.channel.send('Error: War names may not mention users.');
    } else if (isNaN(start)) {
      msg.channel.send(
          'Error: Time to start must be a number. Example: `' +
          config.cmd_prefix +
          'war 10 1`.'
      );
    } else if (isNaN(duration)) {
      msg.channel.send(
          'Error: War duration must be a number. Example: `' +
          config.cmd_prefix +
          'war 10 1`.'
      );
    } else if (start > 30) {
      msg.channel.send(
          'Error: Wars cannot start more than 30 minutes in the future.'
      );
    } else if (duration > 60) {
      msg.channel.send('Error: Wars cannot last for more than an hour.');
    } else if (start <= 0) {
      msg.channel.send('Error: Wars cannot start in the past.');
    } else if (duration < 1) {
      msg.channel.send('Error: Wars must run for at least a minute.');
    } else if (warName.length > 150) {
      msg.channel.send('Error: War names must be 150 characters or less.');
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
            {}
        );
        conn
            .collection('timer')
            .update(
                {data: this.timerID},
                {data: this.timerID + 1},
                {upsert: true}
            );
        this.timerID = this.timerID + 1;
        if (joinFlag) {
          this.joinChallenge(msg, challengeID);
        }
      } catch (e) {
        msg.channel.send('Error: War creation failed.');
        logger.error('Error %s: %s.', e, e.stack);
      }
    }
  }
  /**
   * Creates a new chain war.
   * @param {Object} msg - The message that ran this function.
   * @param {String} suffix - Information after the bot command.
   */
  startChainWar(msg, suffix) {
    let joinFlag = false;
    let crossServerHide = this.crossServerStatus[msg.guild.id];
    conn
        .collection('userDB')
        .findOne(
            {_id: msg.author.id}, function(e, user) {
              if (user.autoStatus == 'off') {
                crossServerHide = true;
              }
            }
        );
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
      msg.channel.send('Error: War names may not contain profanity.');
    } else if (this.regex.exec(warName)) {
      msg.channel.send('Error: War names may not contain emoji.');
    } else if (msg.mentions.members.size > 0) {
      msg.channel.send('Error: War names may not mention users.');
    } else if (isNaN(chainWarCount)) {
      msg.channel.send(
          'Error: War count must be a number. Example: `' +
          config.cmd_prefix +
          'chainwar 2 10 1`.'
      );
    } else if (isNaN(timeBetween)) {
      msg.channel.send(
          'Error: Time between wars must be a number. Example: `' +
          config.cmd_prefix +
          'chainwar 2 10 1`.'
      );
    } else if (timeBetween > 30) {
      msg.channel.send(
          'Error: There cannot be more than 30 minutes between wars in a chain.'
      );
    } else if (isNaN(duration)) {
      msg.channel.send(
          'Error: War duration must be a number. Example: `' +
          config.cmd_prefix +
          'chainwar 2 10 1`.'
      );
    } else if (chainWarCount < 2 || chainWarCount > 10) {
      msg.channel.send(
          'Error: Chain wars must be between two and ten wars long.'
      );
    } else if (duration * chainWarCount > 120) {
      msg.channel.send(
          'Error: Chain wars cannot run for more than two hours in total.'
      );
    } else if (timeBetween <= 0) {
      msg.channel.send('Error: Chain wars cannot overlap.');
    } else if (duration < 1) {
      msg.channel.send('Error: Wars must run for at least a minute.');
    } else if (warName.length > 150) {
      msg.channel.send('Error: War names must be 150 characters or less.');
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
            {}
        );
        conn
            .collection('timer')
            .update(
                {data: this.timerID},
                {data: this.timerID + 1},
                {upsert: true}
            );
        this.timerID = this.timerID + 1;
        if (joinFlag) {
          this.joinChallenge(msg, challengeID);
        }
      } catch (e) {
        msg.channel.send('Error: Chain war creation failed.');
        logger.error('Error %s: %s.', e, e.stack);
      }
    }
  }
  /**
   * Terminates a challenge early.
   * @param {Object} msg - The message that ran this function.
   * @param {String} suffix - Information after the bot command.
   */
  stopChallenge(msg, suffix) {
    const challengeID = suffix;
    if (isNaN(challengeID) || challengeID < 1) {
      msg.channel.send(
          'Error: Challenge ID must be an integer. Example: `' +
          config.cmd_prefix +
          'cancel 10793`.'
      );
    } else if (challengeID in challengelist.challengeList) {
      const stopName = challengelist.challengeList[challengeID].displayName;
      if (
        !(
          challengelist.challengeList[challengeID].hidden &&
          challengelist.challengeList[challengeID].channelID != msg.channel.id
        )
      ) {
        if (challengelist.challengeList[challengeID].creator == msg.author.id) {
          conn.collection('challengeDB').remove({_id: Number(challengeID)});
          for (
            let i = 0;
            i < challengelist.challengeList[challengeID].hookedChannels.length;
            i++
          ) {
            client.channels
                .get(challengelist.challengeList[challengeID].hookedChannels[i])
                .send(stopName + ' has been ended by the creator.');
          }
          delete challengelist.challengeList[challengeID];
        } else {
          msg.channel.send(
              'Error: Only the creator of ' +
              stopName +
              ' can end this challenge.'
          );
        }
      } else {
        msg.channel.send(
            msg.author +
            ', you do not have permission to end' +
            ' this challenge.'
        );
      }
    } else {
      msg.channel.send('Error: Challenge ' + challengeID + ' does not exist!');
    }
  }
  /**
   * Lists all running challenges.
   * @param {Object} client - The Discord client.
   * @param {Object} msg - The message that ran this function.
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
    msg.channel.send(listMsg);
  }
  /**
   * Calls time for a sprint.
   * @param {Object} msg - The message that ran this function.
   * @param {String} suffix - Information after the bot command.
   * @return {Boolean} - determines whether to roll for a raptor.
   */
  callTime(msg, suffix) {
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
            conn.collection('challengeDB').update(
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
          msg.channel.send(
              msg.author +
              ', you completed the sprint in ' +
              timeTaken.toFixed(2) +
              ' minutes.');
        } else {
          raptorCheck = false;
          msg.channel.send('Error: This sprint has timed out.');
        }
      } else {
        raptorCheck = false;
        msg.channel.send('Error: You can only call time on a sprint.');
      }
    } else {
      raptorCheck = false;
      msg.channel.send('Error: This challenge does not exist.');
    }
    return raptorCheck;
  }
  /**
   * Adds a total to a challenge.
   * @param {Object} msg - The message that ran this function.
   * @param {String} suffix - Information after the bot command.
   * @return {Boolean} - determines whether to roll for a raptor.
   */
  addTotal(msg, suffix) {
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
      msg.channel.send(
          'Error: You must work in words, lines, or pages.'
      );
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
                  conn.collection('challengeDB').update(
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
                msg.channel.send('Total added to summary.');
              } else {
                raptorCheck = false;
                msg.channel.send(
                    msg.author +
                    ', I need a whole number to include' +
                    ' in the summary!'
                );
              }
            } else {
              raptorCheck = false;
              msg.channel.send(
                  msg.author +
                  ', you do not have permission to join' +
                  ' this challenge.'
              );
            }
          } else {
            raptorCheck = false;
            msg.channel.send('Error: This challenge has not ended yet!');
          }
        } else {
          raptorCheck = false;
          msg.channel.send('Error: You cannot post a total for sprints.');
        }
      } else {
        raptorCheck = false;
        msg.channel.send('Error: This challenge does not exist!');
      }
    }
    return raptorCheck;
  }
  /**
   * Toggles cross-server display for a server's challenges.
   * @param {Object} msg - The message that ran this function.
   * @param {String} suffix - Information after the bot command.
   */
  xsDisplay(msg, suffix) {
    if (suffix == '') {
      conn
          .collection('userDB')
          .findOne(
              {_id: msg.author.id}, function(e, user) {
                let xsType = 'on';
                if (user.xStatus == 'off') {
                  xsType = 'off';
                }
                msg.channel.send(
                    msg.author +
                    ', you currently have cross-server display' +
                    ' for your challenges **' +
                    xsType +
                    '**.'
                );
              }
          );
    } else {
      const args = suffix.split(' ');
      if (args[0] == 'server') {
        if (args[1] === undefined) {
          let xsType = 'on';
          if (this.crossServerStatus[msg.guild.id] == true) {
            xsType = 'off';
          }
          msg.channel.send(
              msg.guild.name +
              ' currently has cross-server challenges turned **' +
              xsType +
              '**.'
          );
        } else if (msg.member.permissions.has('ADMINISTRATOR')) {
          if (args[1] == 'on' || args[1] == 'off') {
            let xsType = 'on';
            if (suffix == 'off') {
              xsType = 'off';
              this.crossServerStatus[msg.guild.id] = true;
            } else {
              xsType = 'on';
              this.crossServerStatus[msg.guild.id] = false;
            }
            conn
                .collection('configDB')
                .update(
                    {server: msg.guild.id},
                    {$set: {xStatus: this.crossServerStatus[msg.guild.id]}},
                    {upsert: true}
                );
            msg.channel.send(
                msg.author +
                ', you have turned cross-server' +
                ' challenges **' +
                xsType +
                '**.'
            );
          } else {
            msg.channel.send(
                msg.author +
                ', use **on|off** to toggle' +
                ' cross-server challenges.'
            );
          }
        } else {
          msg.channel.send(
              'Error: Only server administrators are permitted to configure' +
              ' challenges.'
          );
        }
      } else {
        if (suffix == 'on' || suffix == 'off') {
          let xsType = 'on';
          if (suffix == 'off') {
            xsType = 'off';
          } else {
            xsType = 'on';
          }
          conn
              .collection('userDB')
              .update(
                  {_id: msg.author.id},
                  {$set: {xStatus: xsType}},
                  {upsert: true}
              );
          msg.channel.send(
              msg.author +
              ', you have turned' +
              ' cross-server display for your challenges **' +
              xsType +
              '**.'
          );
        } else {
          msg.channel.send(
              msg.author +
              ', use **on|off** to toggle' +
              ' cross-server challenges.'
          );
        }
      }
    }
  }
  /**
   * Toggles automatic summaries after challenges for a server.
   * @param {Object} msg - The message that ran this function.
   * @param {String} suffix - Information after the bot command.
   */
  autoSum(msg, suffix) {
    if (suffix == '') {
      conn
          .collection('userDB')
          .findOne(
              {_id: msg.author.id}, function(e, user) {
                let autoType = 'visible';
                if (user.autoStatus == 'off') {
                  autoType = 'hidden';
                }
                msg.channel.send(
                    msg.author +
                    ', you currently have automatic' +
                    ' summaries for your challenges **' +
                    autoType +
                    '**.'
                );
              }
          );
    } else {
      const args = suffix.split(' ');
      if (args[0] == 'server') {
        if (args[1] === undefined) {
          let autoType = 'visible';
          if (this.autoSumStatus[msg.guild.id] == true) {
            autoType = 'hidden';
          }
          msg.channel.send(
              msg.guild.name +
              ' currently has automatic' +
              ' summaries **' +
              autoType +
              '**.'
          );
        } else if (msg.member.permissions.has('ADMINISTRATOR')) {
          if (args[1] == 'show' || args[1] == 'hide') {
            let autoType = 'on';
            if (suffix == 'hide') {
              autoType = 'off';
              this.autoSumStatus[msg.guild.id] = true;
            } else {
              autoType = 'on';
              this.autoSumStatus[msg.guild.id] = false;
            }
            conn
                .collection('configDB')
                .update(
                    {server: msg.guild.id},
                    {$set: {autoStatus: this.autoSumStatus[msg.guild.id]}},
                    {upsert: true}
                );
            msg.channel.send(
                msg.author +
                ', you have turned' +
                ' automatic summaries **' +
                autoType +
                '**.'
            );
          } else {
            msg.channel.send(
                msg.author +
                ', use **show|hide** to' +
                ' toggle automatic summaries.'
            );
          }
        } else {
          msg.channel.send(
              'Error: Only server administrators are permitted' +
              ' to configure automatic summaries.'
          );
        }
      } else {
        if (suffix == 'show' || suffix == 'hide') {
          let autoType = 'on';
          if (suffix == 'hide') {
            autoType = 'off';
          } else {
            autoType = 'on';
          }
          conn
              .collection('userDB')
              .update(
                  {_id: msg.author.id},
                  {$set: {autoStatus: autoType}},
                  {upsert: true}
              );
          msg.channel.send(
              msg.author +
              ', you have turned' +
              ' automatic summaries for your challenges **' +
              autoType +
              '**.'
          );
        } else {
          msg.channel.send(
              msg.author +
              ', use **show|hide** to' +
              ' toggle automatic summaries.'
          );
        }
      }
    }
  }
}

module.exports = new Challenges();
