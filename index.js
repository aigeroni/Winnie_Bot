const ChainWar = require('./challenges/chainwar');
const Goal = require('./goals/goal');
const Sprint = require('./challenges/sprint');
const War = require('./challenges/war');
const start = require('./challenges/start.js');
const clist = require('./challenges/clist.js');
const challenges = require('./challenges/challenges.js');
const goallist = require('./goals/goallist.js');
const goals = require('./goals/goals.js');
const tools = require('./tools/tools.js');
const dice = require('./tools/dice.js');
const help = require('./help.js');
const config = require('./config.json');
const Discord = require('discord.js');
const logger = require('./logger.js');
const gameloop = require('node-gameloop');
const timezoneJS = require('timezone-js');
const mongoose = require('mongoose');

const conn = mongoose.connection;

global.client = new Discord.Client();
timezoneJS.timezone.zoneFileBasePath = 'node_modules/timezone-js/tz';
timezoneJS.timezone.init();

const tickTimer = gameloop.setGameLoop(async function(delta) {
  logger.info('Timer running: ' + delta);
  // check challenges
  for (const item in clist.running) {
    if (clist.running.hasOwnProperty(item)) {
      if (clist.running[item].type == 'chain war' &&
        clist.running[item].state == 2) {
        clist.running[item].state = 3;
        if (
          clist.running[item].current <
          clist.running[item].total
        ) {
          clist.running[start.timerID] = new ChainWar(
              start.timerID,
              clist.running[item].creator,
              clist.running[item].warName,
              new Date().getTime(),
              clist.running[item].current + 1,
              clist.running[item].total,
              clist.running[item].countdownList,
              clist.running[item].duration,
              clist.running[item].channelID,
              clist.running[item].hidden,
              clist.running[item].hookedChannels.slice(),
              JSON.parse(JSON.stringify(
                  clist.running[item].joined)),
              clist.running[item].chainTotal,
              clist.running[item].serverTotal
          );
          start.incrementID();
        }
      }
      clist.running[item].update();
    }
  }
  // check goals
  for (const item in goallist.goalList) {
    if (goallist.goalList.hasOwnProperty(item)) {
      const raptorRoll = goallist.goalList[item].update();
      if (raptorRoll) {
        await tools.raptor(
            raptorRoll[0].guild.id,
            raptorRoll[0],
            client.users.get(item),
            raptorRoll[1]
        );
      }
    }
  }
  // post wordcount goal announcements
  date = new timezoneJS.Date();
  if (date.month == 10) {
    if (date.hours == 0 && date.minutes == 0 && date.seconds == 0) {
      const wordGoal = ((50000/30) * (date.date)).toFixed(0);
      for (item in clist.announceChannel) {
        if (clist.announceChannel.hasOwnProperty(item)) {
          const channel = client.channels.get(clist.announceChannel[item]);
          channel.send(
              '**Day ' +
              date.date +
              ':** Today\'s word goal is **' +
              wordGoal +
              '** words.');
        }
      }
    }
  }
}, 1000);

client.on('ready', () => {
  logger.info('Winnie_Bot is online');
  // Connect to the database
  mongoose.connect(
      config.storage_url,
      {
        useNewUrlParser: true,
        autoIndex: false,
      },
      async function(e, db) {
        if (e) throw e;
        logger.info('Database created!');
        conn.collection('timer').find({}, function(e, t) {
          t.forEach(function(tx) {
            start.timerID = tx.data;
          });
        });
        // import challenges
        conn.collection('challengeDB').find({}, function(e, challengeinput) {
          challengeinput.forEach(function(challenge) {
            if (challenge.type == 'sprint') {
              clist.running[challenge._id] = new Sprint(
                  challenge._id,
                  challenge.creator,
                  challenge.name,
                  challenge.startTime,
                  challenge.countdown,
                  challenge.goal,
                  challenge.duration,
                  challenge.channel,
                  challenge.hidden,
                  challenge.hookedChannels,
                  challenge.joined
              );
            } else if (challenge.type == 'war') {
              clist.running[challenge._id] = new War(
                  challenge._id,
                  challenge.creator,
                  challenge.name,
                  challenge.startTime,
                  challenge.countdown,
                  challenge.duration,
                  challenge.channel,
                  challenge.hidden,
                  challenge.hookedChannels,
                  challenge.joined
              );
            } else if (challenge.type == 'chain war') {
              clist.running[challenge._id] = new ChainWar(
                  challenge._id,
                  challenge.creator,
                  challenge.name,
                  challenge.startTime,
                  challenge.current,
                  challenge.total,
                  challenge.countdown,
                  challenge.duration,
                  challenge.channel,
                  challenge.hidden,
                  challenge.hookedChannels,
                  challenge.joined,
                  challenge.chainTotal,
                  challenge.serverTotal
              );
            }
          });
        });
        // import goals
        conn.collection('goalDB').find({}, function(e, goals) {
          goals.forEach(function(goal) {
            goallist.goalList[goal.authorID] = new Goal(
                goal.authorID,
                goal.goal,
                goal.goalType,
                goal.written,
                goal.startTime,
                goal.terminationTime,
                goal.channelID
            );
          });
        });
        // import configuration
        conn.collection('configDB').find({}, function(e, guilds) {
          guilds.forEach(function(guild) {
            if (guild.prefix) {
              config.cmd_prefix[guild._id] = guild.prefix;
            }
            if (guild.announce) {
              clist.announceChannel[guild._id] = guild.announce;
            }
          });
        });
      }
  );
  client.user.setActivity('twitter.com/Winnie_Discord');
});

const cmdList = {
  sprint: {
    name: 'sprint',
    example: 'sprint 200 10 1 This is a sprint',
    description:
      'Starts a sprint of <words> words which times out in <duration> minutes' +
      ' in [time to start] minutes, with optional [name].  Use `' +
      '%prefix' +
      'sprint join` to join the sprint on creation, and `' +
      '%prefix' +
      'sprint hide` to hide the sprint from other servers.',
    usage: '[join] [hide] <words> <duration> [time to start [name]]',
    type: 'challenges',
    process: async function(client, msg, prefix, suffix) {
      const returnMsg = await start.startSprint(msg, prefix, suffix);
      if (returnMsg != '') {
        msg.channel.send(returnMsg);
      }
      return returnMsg;
    },
  },
  war: {
    name: 'war',
    example: 'war 10 1 This is a war',
    description:
      'Starts a word war of <duration> minutes in [time to start] minutes,' +
      ' with optional [name].  Use `' +
      '%prefix' +
      'war join` to join the war on creation, and `' +
      '%prefix' +
      'war hide` to hide the war from other servers.',
    usage: '[join] [hide] <duration> [time to start [name]]',
    type: 'challenges',
    process: async function(client, msg, prefix, suffix) {
      const returnMsg = await start.startWar(msg, prefix, suffix);
      if (returnMsg != '') {
        msg.channel.send(returnMsg);
      }
      return returnMsg;
    },
  },
  chainwar: {
    name: 'chainwar',
    example: 'chainwar 2 10 1 This is a chain war',
    description:
      'Starts a chain of <number of wars>, each of <duration> minutes, with' +
      ' [time between wars] minutes between wars, and optional [name].  Use `' +
      '%prefix' +
      'chainwar join` to join the chain on creation, and `' +
      '%prefix' +
      'chainwar hide` to hide the chain from other servers.',
    usage: '[join] [hide] <number of wars> <duration>' +
      ' [time between wars [name]]',
    type: 'challenges',
    process: async function(client, msg, prefix, suffix) {
      const returnMsg = await start.startChainWar(msg, prefix, suffix);
      if (returnMsg != '') {
        msg.channel.send(returnMsg);
      }
      return returnMsg;
    },
  },
  join: {
    name: 'join',
    example: 'join 10793',
    description: 'Joins war/sprint <id>',
    usage: '<id>',
    type: 'challenges',
    process: async function(client, msg, prefix, suffix) {
      const msgToSend = await challenges.joinChallenge(msg, prefix, suffix);
      msg.channel.send(msgToSend);
      return msgToSend;
    },
  },
  leave: {
    name: 'leave',
    example: 'leave 10793',
    description: 'Leaves war/sprint <id>',
    usage: '<id>',
    type: 'challenges',
    process: async function(client, msg, prefix, suffix) {
      const msgToSend = await challenges.leaveChallenge(msg, prefix, suffix);
      msg.channel.send(msgToSend);
      return msgToSend;
    },
  },
  cancel: {
    name: 'cancel',
    example: 'cancel 10793',
    description:
      'Ends war/sprint <id>. Can only be performed by creator.',
    usage: '<id>',
    aliases: 'exterminate',
    type: 'challenges',
    process: async function(client, msg, prefix, suffix) {
      const returnData = await challenges.stopChallenge(msg, prefix, suffix);
      for (let i = 0; i < returnData.channelList.length; i++) {
        client.channels
            .get(returnData.channelList[i])
            .send(returnData.returnMsg);
      }
      return returnData.returnMsg;
    },
  },
  exterminate: {
    name: 'exterminate',
    example: 'exterminate 10793',
    description:
      'Ends war/sprint <id>. Can only be performed by creator.',
    usage: '<id>',
    alias: true,
    type: 'challenges',
    process: async function(client, msg, prefix, suffix) {
      const returnData = await challenges.stopChallenge(msg, prefix, suffix);
      for (let i = 0; i < returnData.channelList.length; i++) {
        client.channels
            .get(returnData.channelList[i])
            .send(returnData.returnMsg);
      }
      return returnData.returnMsg;
    },
  },
  time: {
    name: 'time',
    example: 'time 10793',
    description:
      'Notifies Winnie that you have reached the word goal for sprint <id>',
    usage: '<id>',
    type: 'challenges',
    process: async function(client, msg, prefix, suffix) {
      const returnData = await challenges.callTime(msg, prefix, suffix);
      let msgToSend = returnData.returnMsg;
      if (returnData.raptorCheck &&
        msg.author.id in goallist.goalList &&
        goallist.goalList[msg.author.id].goalType == 'words'
      ) {
        const args = suffix.split(' ');
        const challengeID = args.shift();
        const updateWords = clist.running[challengeID].goal;
        msgToSend += '\n' +
            await goals.updateGoal(msg, prefix, updateWords, false);
        tools.raptor(
            msg.guild.id,
            msg.channel,
            msg.author,
            tools.WAR_RAPTOR_CHANCE
        );
      }
      msg.channel.send(msgToSend);
      return msgToSend;
    },
  },
  total: {
    name: 'total',
    example: 'total 10793 45 lines',
    description:
      'Adds your <total> for completed war <id>, optional' +
      ' [lines|pages|minutes]',
    usage: '<id> <total> [lines|pages|minutes]',
    type: 'challenges',
    process: async function(client, msg, prefix, suffix) {
      const returnData = await challenges.addTotal(msg, prefix, suffix);
      let msgToSend = returnData.returnMsg;
      if (returnData.raptorCheck &&
        msg.author.id in goallist.goalList
      ) {
        slice = suffix.split(' ');
        totalNumber = slice[1];
        totalType = slice[2];
        if (totalType === undefined) {
          totalType = 'words';
        }
        if (totalType.charAt(totalType.length-1) != 's') {
          totalType += 's';
        }
        if (totalType == goallist.goalList[msg.author.id].goalType) {
          msgToSend += '\n' +
              await goals.updateGoal(msg, prefix, totalNumber, false);
        }
        tools.raptor(
            msg.guild.id,
            msg.channel,
            msg.author,
            tools.WAR_RAPTOR_CHANCE
        );
      }
      msg.channel.send(msgToSend);
      return msgToSend;
    },
  },
  summary: {
    name: 'summary',
    example: 'summary 10793',
    description:
      'Displays the summary for completed war/sprint <id>',
    usage: '<id>',
    type: 'challenges',
    process: function(client, msg, prefix, suffix) {
      const msgToSend = clist.generateSummary(msg.channel.id, suffix);
      msg.channel.send(msgToSend);
      return msgToSend;
    },
  },
  list: {
    name: 'list',
    description: 'Lists all running challenges',
    usage: '',
    type: 'challenges',
    process: function(client, msg, prefix, suffix) {
      const msgToSend = clist.listChallenges(client, msg);
      msg.channel.send(msgToSend);
      return msgToSend;
    },
  },
  timezone: {
    name: 'timezone',
    example: 'timezone Australia/Melbourne',
    description: 'Sets your <IANA timezone identifier>',
    usage: '<IANA timezone identifier>',
    type: 'goals',
    process: async function(client, msg, prefix, suffix) {
      const msgToSend = await goals.setTimezone(msg, prefix, suffix);
      msg.channel.send(msgToSend);
      return msgToSend;
    },
  },
  set: {
    name: 'set',
    example: 'set 1667',
    description:
      'Sets a daily goal <goal>, with optional [lines|pages|minutes]',
    usage: '<goal> [lines|pages|minutes]',
    aliases: 'goal',
    type: 'goals',
    process: async function(client, msg, prefix, suffix) {
      const msgToSend = await goals.setGoal(msg, prefix, suffix);
      msg.channel.send(msgToSend);
      return msgToSend;
    },
  },
  goal: {
    name: 'goal',
    example: 'goal 1667',
    description:
      'Sets a daily goal <goal>, with optional [lines|pages|minutes]',
    usage: '<goal> [lines|pages|minutes]',
    alias: true,
    type: 'goals',
    process: async function(client, msg, prefix, suffix) {
      const msgToSend = await goals.setGoal(msg, prefix, suffix);
      msg.channel.send(msgToSend);
      return msgToSend;
    },
  },
  update: {
    name: 'update',
    example: 'update 256',
    description:
      'Updates your daily goal with your <progress> since your last update',
    usage: '<progress>',
    aliases: 'add',
    type: 'goals',
    process: function(client, msg, prefix, suffix) {
      const msgToSend = goals.updateGoal(msg, prefix, suffix, false);
      msg.channel.send(msgToSend);
      return msgToSend;
    },
  },
  add: {
    name: 'add',
    example: 'add 256',
    description:
      'Updates your daily goal with your <progress> since your last update',
    usage: '<progress>',
    alias: true,
    type: 'goals',
    process: function(client, msg, prefix, suffix) {
      const msgToSend = goals.updateGoal(msg, prefix, suffix, false);
      msg.channel.send(msgToSend);
      return msgToSend;
    },
  },
  overwrite: {
    name: 'overwrite',
    example: 'overwrite 508',
    description: 'Updates your daily goal with your <progress> today',
    usage: '<progress>',
    aliases: 'progress',
    type: 'goals',
    process: function(client, msg, prefix, suffix) {
      const msgToSend = goals.updateGoal(msg, prefix, suffix, true);
      msg.channel.send(msgToSend);
      return msgToSend;
    },
  },
  progress: {
    name: 'progress',
    example: 'progress 508',
    description: 'Updates your daily goal with your <progress> today',
    usage: '<progress>',
    alias: true,
    type: 'goals',
    process: function(client, msg, prefix, suffix) {
      const msgToSend = goals.updateGoal(msg, prefix, suffix, true);
      msg.channel.send(msgToSend);
      return msgToSend;
    },
  },
  reset: {
    name: 'reset',
    example: 'reset 40 lines',
    description:
      'Resets your daily goal to [goal], with optional [lines|pages|minutes].' +
      '  If no new goal is specified, removes your daily goal.',
    usage: '[goal] [lines|pages|minutes]',
    type: 'goals',
    process: async function(client, msg, prefix, suffix) {
      const msgToSend = await goals.resetGoal(msg, prefix, suffix);
      msg.channel.send(msgToSend);
      return msgToSend;
    },
  },
  goalinfo: {
    name: 'goalinfo',
    description: 'Displays progress towards your daily goal',
    type: 'goals',
    process: function(client, msg, prefix, suffix) {
      const msgToSend = goals.viewGoal(msg, prefix);
      msg.channel.send(msgToSend);
      return msgToSend;
    },
  },
  target: {
    name: 'target',
    example: 'target medium 15',
    description:
      'Generates an <easy|medium|hard|insane> target for <minutes> minutes',
    usage: '<easy|medium|hard|insane> <minutes>',
    type: 'tools',
    process: function(client, msg, prefix, suffix) {
      const msgToSend = tools.calcTarget(msg, prefix, suffix);
      msg.channel.send(msgToSend);
      return msgToSend;
    },
  },
  prompt: {
    name: 'prompt',
    description: 'Provides a writing prompt',
    type: 'tools',
    process: function(client, msg, prefix, suffix) {
      const msgToSend = tools.getPrompt(msg);
      msg.channel.send(msgToSend);
      return msgToSend;
    },
  },
  roll: {
    name: 'roll',
    example: 'roll 2d6 + 5',
    description:
      'Rolls any combination of the given options, separated by the + operator',
    usage: '<x, x y, xdy>',
    type: 'tools',
    process: function(client, msg, prefix, suffix) {
      const msgToSend = dice.rollDice(prefix, suffix);
      msg.channel.send(msgToSend);
      return msgToSend;
    },
  },
  choose: {
    name: 'choose',
    example: 'choose red, white, black',
    description:
      'Selects an item from a list <list> of items, separated by commas',
    usage: '<list>',
    type: 'tools',
    process: function(client, msg, prefix, suffix) {
      const msgToSend = tools.chooseItem(msg, suffix);
      msg.channel.send(msgToSend);
      return msgToSend;
    },
  },
  site: {
    name: 'site',
    example: 'site your-username-here',
    description:
      'Sets your <NaNo site username>.' +
      ' This is the last section of your profile page URL: ' +
      '`https://nanowrimo.org/participants/your-username-here`',
    usage: '<NaNo site username>',
    type: 'tools',
    process: async function(client, msg, prefix, suffix) {
      const msgToSend = await tools.siteName(msg, suffix);
      msg.channel.send(msgToSend);
      return msgToSend;
    },
  },
  raptors: {
    name: 'raptors',
    description: 'Displays raptor statistics.',
    type: 'tools',
    process: async function(client, msg, prefix, suffix) {
      const msgToSend = await tools.raptorStats(client, msg);
      msg.channel.send(msgToSend);
      return msgToSend;
    },
  },
  stats: {
    name: 'stats',
    description:
      'Displays user statistics.',
    type: 'tools',
    process: async function(client, msg, prefix, suffix) {
      const msgToSend = await tools.userInfo(client, msg);
      msg.channel.send(msgToSend);
      return msgToSend;
    },
  },
  display: {
    name: 'display',
    description:
      'Toggles cross-server display of challenges created by you. ' +
      'The [server] flag allows server admins to toggle for the whole server.',
    usage: '[server] <on|off>',
    type: 'config',
    process: async function(client, msg, prefix, suffix) {
      const msgToSend = await clist.updateFlags(msg, suffix, 'xStatus');
      msg.channel.send(msgToSend);
      return msgToSend;
    },
  },
  autosum: {
    name: 'autosum',
    description:
      'Toggles automatic display of summaries for' +
      ' challenges created by you. ' +
      'The [server] flag allows server admins to toggle for the whole server.',
    usage: '[server] <show|hide>',
    type: 'config',
    process: async function(client, msg, prefix, suffix) {
      const msgToSend = await clist.updateFlags(msg, suffix, 'autoStatus');
      msg.channel.send(msgToSend);
      return msgToSend;
    },
  },
  prefix: {
    name: 'prefix',
    example: 'prefix ~',
    description:
      'Allows server admins to change Winnie\'s prefix.',
    usage: '<prefix>',
    type: 'config',
    process: async function(client, msg, prefix, suffix) {
      const msgToSend = await clist.statusForServer(msg, 'prefix', suffix);
      msg.channel.send(msgToSend);
      return msgToSend;
    },
  },
  announce: {
    name: 'announce',
    example: 'announce #announcements',
    description:
      'Allows server admins to select a channel for daily word count' +
      ' announcements.',
    usage: '<channel>',
    type: 'config',
    process: async function(client, msg, prefix, suffix) {
      logger.info(suffix);
      const msgToSend = await clist.statusForServer(msg, 'announce', suffix);
      msg.channel.send(msgToSend);
      return msgToSend;
    },
  },
};

client.on('message', async (msg) => {
  // get prefix
  let prefix = config.cmd_prefix['default'];
  if (config.cmd_prefix[msg.guild.id]) {
    prefix = config.cmd_prefix[msg.guild.id];
  }
  // run command
  if (msg.isMentioned(client.user)) {
    msg.channel.send(
        'My name is Winnie, and I run challenges, track goals,' +
        ' and provide other useful commands for writing.  I use the `' +
        prefix +
        '` prefix. Use `' +
        prefix +
        'help` for command information.'
    );
  }
  if (
    msg.author.id != client.user.id &&
    msg.content.startsWith(prefix)
  ) {
    let sentMsg = 'Command Not Parsed';
    const userEnteredText = msg.content.replace(/\s\s+/g, ' ');
    const cmdData = userEnteredText
        .split(' ')[0]
        .substring(prefix.length)
        .toLowerCase();
    const suffix = userEnteredText.substring(
        cmdData.length + prefix.length + 1
    );
    const cmd = cmdList[cmdData];
    if (cmdData === 'help') {
      sentMsg = (help.buildHelpMsg(cmdList, prefix, suffix));
      if (sentMsg.constructor === Array) {
        msg.channel.send(msg.author + ', I sent you a DM.');
        for (i = 0; i < sentMsg.length; i++) {
          msg.author.send(sentMsg[i]);
        }
      } else {
        msg.channel.send(sentMsg);
      }
    } else if (cmd) {
      try {
        sentMsg = await cmd.process(client, msg, prefix, suffix);
      } catch (e) {
        msg.channel.send('**Unknown Error:** I\'m sorry, I\'m afraid I' +
          ' can\'t do that.  See log file for details.');
        logger.info('Error %s: %s.', e, e.stack);
      }
    }
    logger.info(
        'User: ' + msg.author +
        ' Command: ' + msg.content+
        ' Response: ' + sentMsg
    );
  }
});

process.on('uncaughtException', function(e) {
  logger.error(
      'Error %s: %s.\nWinnie_Bot will now attempt to reconnect.',
      e,
      e.stack
  );
  try {
    client.login(config.token);
    fileSystemCheck();
  } catch (e) {
    logger.error('Reconnection failed.\nWinnie_Bot will now terminate.');
    gameloop.clearGameLoop(tickTimer);
    process.exit(1);
  }
});

client.on('error', console.error);

client.login(config.token);
