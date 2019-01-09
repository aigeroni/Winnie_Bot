const profanity = require('profanity-util', {substring: 'lite'});
const emojiRegex = require('emoji-regex/es2015/index.js');
const ChainWar = require('./chainwar');
const Sprint = require('./sprint');
const War = require('./war');
const clist = require('./clist.js');
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
   * @param {String} prefix - The bot's prefix.
   * @param {String} suffix - Information after the bot command.
   * @return {String} - The message to send to the user.
   */
  async joinChallenge(msg, prefix, suffix) {
    let returnMsg = '';
    const chalID = suffix;
    const returnInfo = checkIDError(chalID, 'join');
    if (returnInfo) {
      returnMsg = returnInfo;
    } else if (msg.author.id in clist.running[chalID].joined) {
      returnMsg = msg.author +
        ', you already have notifications enabled for this challenge.';
    } else {
      clist.running[chalID].joined[msg.author.id] =
        buildUserData(msg, clist.running[chalID].type, undefined, undefined);
      if (clist.running[chalID].hookedChannels.indexOf(msg.channel.id) == -1) {
        clist.running[chalID].hookedChannels.push(msg.channel.id);
      }
      returnMsg = msg.author + ', you have joined ' +
        clist.running[chalID].displayName;
      const dbData = '$set: {hookedChannels: clist.running[chalID]' +
        '.hookedChannels, joined: clist.running[chalID].joined,}';
      await dbUpdate(parseInt(chalID), dbData);
    }
    return returnMsg;
  }
  /**
   * Remove a user from the list of joined users for a challenge.
   * @param {Object} msg - The message that ran this function.
   * @param {String} prefix - The bot's prefix.
   * @param {String} suffix - Information after the bot command.
   * @return {String} - The message to send to the user.
   */
  async leaveChallenge(msg, prefix, suffix) {
    let returnMsg = '';
    const chalID = suffix;
    const returnInfo = checkIDError(chalID, 'join');
    if (returnInfo) {
      returnMsg = returnInfo;
    } else if (!(msg.author.id in clist.running[chalID].joined)) {
      returnMsg = msg.author + ', you have not yet joined this challenge.';
    } else {
      delete clist.running[chalID].joined[msg.author.id];
      let hookDrop = true;
      if (clist.running[chalID].channelID == msg.channel.id) {
        hookDrop = false;
      }
      for (const item in clist.running[chalID].joined) {
        if (clist.running[chalID].joined[item].channelID == msg.channel.id) {
          hookDrop = false;
        }
      }
      if (hookDrop == true && clist.running[chalID].hookedChannels.indexOf(
          msg.channel.id) != -1) {
        clist.running[chalID].hookedChannels.splice(index, 1);
      }
      returnMsg = msg.author + ', you have left ' +
        clist.running[chalID].displayName;
      const dbData = '$set: {joined: clist.running[chalID].joined,}';
      await dbUpdate(parseInt(chalID), dbData);
    }
    return returnMsg;
  }
  /**
   * Creates a new sprint.
   * @param {Object} msg - The message that ran this function.
   * @param {String} prefix - The bot's prefix.
   * @param {String} suffix - Information after the bot command.
   * @return {String} - The message to send to the user.
   */
  async startSprint(msg, prefix, suffix) {
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
      returnMsg = '**Error:** Sprint names may not contain profanity.';
    } else if (this.regex.exec(sprintName)) {
      returnMsg = '**Error:** Sprint names may not contain emoji.';
    } else if (msg.mentions.members.size > 0) {
      returnMsg = '**Error:** Sprint names may not mention users.';
    } else if (!Number.isInteger(Number(words))) {
      returnMsg = '**Error:** Word goal must be a whole number. Example: `' +
          prefix +
          'sprint 200 10 1`.';
    } else if (isNaN(timeout)) {
      returnMsg = '**Error:** Sprint duration must be a number. Example: `' +
          prefix +
          'sprint 200 10 1`.';
    } else if (isNaN(start)) {
      returnMsg = '**Error:** Time to start must be a number. Example: `' +
          prefix +
          'sprint 200 10 1`.';
    } else if (start > 30) {
      returnMsg =
          '**Error:** Sprints cannot start more than 30 minutes in the future.';
    } else if (timeout > 60) {
      returnMsg = '**Error:** Sprints cannot last for more than an hour.';
    } else if (words < 1) {
      returnMsg = '**Error:** Word goal cannot be negative.';
    } else if (start <= 0) {
      returnMsg = '**Error:** Sprints cannot start in the past.';
    } else if (timeout < 1) {
      returnMsg = '**Error:** Sprints must run for at least a minute.';
    } else if (sprintName.length > 150) {
      returnMsg = '**Error:** Sprint names must be 150 characters or less.';
    } else {
      try {
        const creatorID = msg.author.id;
        const challengeID = this.timerID;
        const startTime = new Date().getTime();
        clist.running[challengeID] = new Sprint(
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
        this.incrementID();
        if (joinFlag) {
          returnMsg += await this.joinChallenge(msg, prefix, challengeID);
        }
      } catch (e) {
        returnMsg = '**Error:** Sprint creation failed.';
        logger.error('Error %s: %s.', e, e.stack);
      }
    }
    return returnMsg;
  }
  /**
   * Creates a new war.
   * @param {Object} msg - The message that ran this function.
   * @param {String} prefix - The bot's prefix.
   * @param {String} suffix - Information after the bot command.
   * @return {String} - The message to send to the user.
   */
  async startWar(msg, prefix, suffix) {
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
      returnMsg = '**Error:** War names may not contain profanity.';
    } else if (this.regex.exec(warName)) {
      returnMsg = '**Error:** War names may not contain emoji.';
    } else if (msg.mentions.members.size > 0) {
      returnMsg = '**Error:** War names may not mention users.';
    } else if (isNaN(start)) {
      returnMsg = '**Error:** Time to start must be a number. Example: `' +
          prefix +
          'war 10 1`.';
    } else if (isNaN(duration)) {
      returnMsg = '**Error:** War duration must be a number. Example: `' +
          prefix +
          'war 10 1`.';
    } else if (start > 30) {
      returnMsg =
          '**Error:** Wars cannot start more than 30 minutes in the future.';
    } else if (duration > 60) {
      returnMsg = '**Error:** Wars cannot last for more than an hour.';
    } else if (start <= 0) {
      returnMsg = '**Error:** Wars cannot start in the past.';
    } else if (duration < 1) {
      returnMsg = '**Error:** Wars must run for at least a minute.';
    } else if (warName.length > 150) {
      returnMsg = '**Error:** War names must be 150 characters or less.';
    } else {
      try {
        const creatorID = msg.author.id;
        const challengeID = this.timerID;
        const startTime = new Date().getTime();
        clist.running[challengeID] = new War(
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
        this.incrementID();
        if (joinFlag) {
          returnMsg += await this.joinChallenge(msg, prefix, challengeID);
        }
      } catch (e) {
        returnMsg = '**Error:** War creation failed.';
        logger.error('Error %s: %s.', e, e.stack);
      }
    }
    return returnMsg;
  }
  /**
   * Creates a new chain war.
   * @param {Object} msg - The message that ran this function.
   * @param {String} prefix - The bot's prefix.
   * @param {String} suffix - Information after the bot command.
   * @return {String} - The message to send to the user.
   */
  async startChainWar(msg, prefix, suffix) {
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
    let timeBetween = args.shift().split('|');
    while (timeBetween.length < chainWarCount) {
      timeBetween.push(timeBetween[timeBetween.length-1]);
    }
    let warName = args.join(' ');
    if (timeBetween === undefined) {
      timeBetween = [1];
    }
    if (warName == '') {
      warName = msg.author.username + '\'s war';
    }
    if (profanity.check(warName).length > 0) {
      returnMsg = '**Error:** War names may not contain profanity.';
    } else if (this.regex.exec(warName)) {
      returnMsg = '**Error:** War names may not contain emoji.';
    } else if (msg.mentions.members.size > 0) {
      returnMsg = '**Error:** War names may not mention users.';
    } else if (isNaN(chainWarCount)) {
      returnMsg = '**Error:** War count must be a number. Example: `' +
          prefix +
          'chainwar 2 10 1`.';
    } else if (timeBetween.some(isNaN)) {
      returnMsg = '**Error:** Time between wars must be a number. Example: `' +
          prefix +
          'chainwar 2 10 1`.';
    } else if (timeBetween.some(function(currentValue) {
      return currentValue > 30;
    })) {
      returnMsg = '**Error:** There cannot be more than 30 minutes' +
          ' between wars in a chain.';
    } else if (isNaN(duration)) {
      returnMsg = '**Error:** War duration must be a number. Example: `' +
          prefix +
          'chainwar 2 10 1`.';
    } else if (chainWarCount < 2 || chainWarCount > 10) {
      returnMsg = '**Error:** Chains must be between two and ten wars long.';
    } else if (duration * chainWarCount > 120) {
      returnMsg =
          '**Error:** Chain wars cannot run for more than two hours in total.';
    } else if (timeBetween <= 0) {
      returnMsg = '**Error:** Chain wars cannot overlap.';
    } else if (duration < 1) {
      returnMsg = '**Error:** Wars must run for at least a minute.';
    } else if (warName.length > 150) {
      returnMsg = '**Error:** War names must be 150 characters or less.';
    } else {
      try {
        const creatorID = msg.author.id;
        const challengeID = this.timerID;
        const startTime = new Date().getTime();
        clist.running[challengeID] = new ChainWar(
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
            {},
            {}
        );
        await this.incrementID();
        if (joinFlag) {
          returnMsg += await this.joinChallenge(msg, prefix, challengeID);
        }
      } catch (e) {
        returnMsg = '**Error:** Chain war creation failed.';
        logger.error('Error %s: %s.', e, e.stack);
      }
    }
    return returnMsg;
  }
  /**
   * Terminates a challenge early.
   * @param {Object} msg - The message that ran this function.
   * @param {String} prefix - The bot's prefix.
   * @param {String} suffix - Information after the bot command.
   * @return {Object} - Channels to send message to, and message to send.
   */
  async stopChallenge(msg, prefix, suffix) {
    let returnMsg = '';
    const challengeID = suffix;
    let channelList = [msg.channel.id];
    const returnInfo = checkIDError(challengeID, 'join');
    if (returnInfo) {
      returnMsg = returnInfo;
    } else if (clist.running[challengeID].creator == msg.author.id) {
      await conn.collection('challengeDB').remove(
          {_id: Number(challengeID)}
      );
      channelList = clist.running[challengeID].hookedChannels;
      returnMsg =
        clist.running[challengeID] + ' has been ended by the creator.';
      delete clist.running[challengeID];
    } else {
      returnMsg = '**Error:** Only the creator of ' +
        clist.running[challengeID] +
        ' can end this challenge.';
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
    for (const i in clist.running) {
      if (clist.running.hasOwnProperty(i)) {
        const parentChannel = client.channels.get(
            clist.running[i].channelID
        );
        const parentGuild = parentChannel.guild;
        // check whether a challenge is hidden
        if (
          !(
            clist.running[i].hidden &&
            parentGuild.id != msg.guild.id
          )
        ) {
          nonHiddenTotal += 1;
          // find originating server name
          const parentGuildName = parentGuild.name;
          let timeout = '';
          switch (clist.running[i].state) {
            case 0:
              if (clist.running[i].cStart % 60 < 10) {
                timeout =
                  '0' + (clist.running[i].cStart % 60).toString();
              } else {
                timeout = clist.running[i].cStart % 60;
              }
              timerInfo +=
                i + ': ' + clist.running[i].displayName + ' (';
              if (clist.running[i].type == 'sprint') {
                timerInfo += clist.running[i].goal + ' words, ';
              }
              timerInfo +=
                clist.running[i].duration +
                ' minutes, starts in ' +
                Math.floor(clist.running[i].cStart / 60) +
                ':' +
                timeout +
                '), ' +
                parentGuildName +
                '\n';
              break;
            case 1:
              if (clist.running[i].cDur % 60 < 10) {
                timeout =
                  '0' + (clist.running[i].cDur % 60).toString();
              } else {
                timeout = clist.running[i].cDur % 60;
              }
              timerInfo +=
                i + ': ' + clist.running[i].displayName + ' (';
              if (clist.running[i].type == 'sprint') {
                timerInfo += clist.running[i].goal + ' words, ';
              }
              timerInfo +=
                clist.running[i].duration +
                ' minutes, ' +
                Math.floor(clist.running[i].cDur / 60) +
                ':' +
                timeout +
                ' remaining), ' +
                parentGuildName +
                '\n';
              break;
            case 2:
            case 3:
              timerInfo +=
                i + ': ' + clist.running[i].displayName + ' (';
              if (clist.running[i].type == 'sprint') {
                timerInfo += clist.running[i].goal + ' words, ';
              }
              timerInfo +=
                clist.running[i].duration +
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
    const chalID = args.shift();
    let raptorCheck = true;
    if (!(chalID in clist.running)) {
      raptorCheck = false;
      returnMsg = '**Error:** This challenge does not exist.';
    } else if (!(clist.running[chalID].type == 'sprint')) {
      raptorCheck = false;
      returnMsg = '**Error:** You can only call time on a sprint.';
    } else {
      const doneStamp = new Date().getTime();
      const timeTaken = (doneStamp - clist.running[chalID].startStamp) / 60000;
      clist.running[chalID].joined[msg.author.id] =
        buildUserData(msg, 'sprint', doneStamp, timeTaken);
      if (clist.running[chalID].hookedChannels.indexOf(msg.channel.id) == -1) {
        clist.running[chalID].hookedChannels.push(msg.channel.id);
      }
      const dbData = '$set: {joined: clist.running[chalID].joined,}';
      await dbUpdate(parseInt(chalID), dbData);
      returnMsg = msg.author + ', you completed the sprint in ' +
        timeTaken.toFixed(2) + ' minutes.';
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
    if (writtenType === undefined) {
      writtenType = 'words';
    }
    if (writtenType.charAt(writtenType.length-1) != 's') {
      writtenType += 's';
    }
    if (!(
      writtenType == 'lines' || writtenType == 'pages' ||
      writtenType == 'words' || writtenType == 'minutes'
    )) {
      raptorCheck = false;
      returnMsg = '**Error:** You must work in words, lines, or pages.';
    } else {
      if (challengeID in clist.running) {
        if (clist.running[challengeID].type != 'sprint') {
          if (clist.running[challengeID].state >= 2) {
            if (
              !(
                clist.running[challengeID].hidden &&
                client.channels.get(
                    clist.running[challengeID].channelID
                ).guild.id != msg.guild.id
              )
            ) {
              if (Number.isInteger(Number(wordsWritten))) {
                for (const user in clist.running[challengeID]
                    .joined) {
                  if (user == msg.author.id) {
                    if (
                      !(
                        clist.running[challengeID]
                            .joined[user].countData === undefined
                      )
                    ) {
                      raptorCheck = false;
                    }
                  }
                }
                if (Number(wordsWritten) < 1) {
                  raptorCheck = false;
                }
                clist.running[challengeID].joined[
                    msg.author.id
                ] = {
                  countData: wordsWritten,
                  countType: writtenType,
                  channelID: msg.channel.id,
                };
                const pushID = msg.channel.id;
                const searchIndex = clist.running[
                    challengeID
                ].hookedChannels.indexOf(pushID);
                if (searchIndex == -1) {
                  clist.running[challengeID].hookedChannels.push(
                      pushID
                  );
                }
                try {
                  await conn.collection('challengeDB').update(
                      {_id: parseInt(challengeID)},
                      {
                        $set: {
                          joined:
                          clist.running[challengeID].joined,
                        },
                      },
                      {upsert: true}
                  );
                } catch (e) {
                  logger.error('**Error:** ' + e);
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
            returnMsg = '**Error:** This challenge has not ended yet!';
          }
        } else {
          raptorCheck = false;
          returnMsg = '**Error:** You cannot post a total for sprints.';
        }
      } else {
        raptorCheck = false;
        returnMsg = '**Error:** This challenge does not exist!';
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
          returnMsg = '**Error:** Only server administrators are permitted' +
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
          returnMsg = '**Error:** Only server administrators are permitted' +
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
  /**
   * Increment the challenge ID.
   * @return {Promise} - Promise object.
   */
  async incrementID() {
    await conn
        .collection('timer')
        .update(
            {data: this.timerID},
            {data: this.timerID + 1},
            {upsert: true}
        );
    this.timerID = this.timerID + 1;
  }
  /**
   * Checks for a valid challenge ID.
   * @param {String} challengeID - The ID to test for validity.
   * @param {String} command - The command that resulted in this error.
   * @return {String} - Error message.
   */
  checkIDError(challengeID, command) {
    let returnData = '';
    if (isNaN(challengeID) || challengeID < 1) {
      returnData = '**Error:** Challenge ID must be an integer. Example: `' +
        prefix + command + '10793`.';
    } else if (!(challengeID in clist.running)) {
      returnData = '**Error:** Challenge ' + challengeID + ' does not exist!';
    } else if (clist.running[challengeID].hidden && client.channels.get(
        clist.running[challengeID].channelID).guild.id != msg.guild.id) {
      returnData = msg.author + ', you do not have permission to ' +
        command + ' this challenge.';
    } else {
      returnData = false;
    }
    return returnData;
  }
  /**
   * Builds user data for the challenge database.
   * @param {String} type - The type of the challenge.
   * @param {String} data1 - The first datapoint.
   * @param {String} data2 - The second datapoint.
   * @return {Promise} - Promise object.
   */
  buildUserData(msg, type, data1, data2) {
    let data = {};
    if (type == 'sprint') {
      data = {
        timestampCalled: data1,
        timeTaken: data2,
        channelID: msg.channel.id,
      };
    } else {
      data = {
        countData: data1,
        countType: data2,
        channelID: msg.channel.id,
      };
    }
    return data;
  }
  /**
   * Updates the challenge database
   * @param {String} id - The ID of the challenge to update.
   * @param {String} info - The data to update with.
   * @return {Object} - User data.
   */
  async dbUpdate(id, info) {
    await conn.collection('challengeDB').update(
        {_id: parseInt(chalID)},
        {
          info,
        },
        {upsert: true}
    );
  }
}

module.exports = new Challenges();
