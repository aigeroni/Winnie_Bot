const ChainWar = require('./challenges/chainwar');
const Goal = require('./goals/goal');
const Sprint = require('./challenges/sprint');
const War = require('./challenges/war');
const challengelist = require('./challenges/challengelist.js');
const challenges = require('./challenges/challenges.js');
const goallist = require('./goals/goallist.js');
const goals = require('./goals/goals.js');
const tools = require('./tools/tools.js');
const config = require('./config.json');
const Discord = require('discord.js');
const logger = require('./logger.js');
const gameloop = require('node-gameloop');
const timezoneJS = require('timezone-js');
const mongoose = require('mongoose');

const conn = mongoose.connection;

global.client = new Discord.Client;
timezoneJS.timezone.zoneFileBasePath = 'node_modules/timezone-js/tz';
timezoneJS.timezone.init();

const tickTimer = gameloop.setGameLoop(async function(delta) {
  for (var item in challengelist.challengeList) {
    if (challengelist.challengeList[item].type == 'chain war') {
      if (challengelist.challengeList[item].state == 2) {
        challengelist.challengeList[item].state = 3;
        if (challengelist.challengeList[item].current < challengelist
            .challengeList[item].total) {
          const startTime = new Date().getTime();
          challengelist.challengeList[challenges.timerID] = new
          ChainWar(challenges.timerID, challengelist.challengeList
              [item].creator, challengelist.challengeList[item]
              .warName, startTime, challengelist.challengeList[item]
              .current+1, challengelist.challengeList[item].total,
          challengelist.challengeList[item].countdown,
          challengelist.challengeList[item].duration,
          challengelist.challengeList[item].channelID,
          challengelist.challengeList[item].hidden, {});
          conn.collection('timer').update(
              {data: challenges.timerID},
              {data: (challenges.timerID+1)},
              {upsert: true}
          );
          challenges.timerID = challenges.timerID + 1;
        }
      }
    }
    challengelist.challengeList[item].update();
  }
  for (var item in goallist.goalList) {
    const raptorRoll = goallist.goalList[item].update();
    if (raptorRoll != false) {
      tools.raptor(raptorRoll[0].guild.id, raptorRoll[0],
          client.users.get(item), raptorRoll[1]);
    }
  }
}, 1000);

client.on('ready', () => {
  logger.info('Winnie_Bot is online');
  // Connect to the database
  mongoose.connect(config.storage_url, {useNewUrlParser: true, autoIndex:
        false}, function(e, db) {
    if (e) throw e;
    logger.info('Database created!');
    conn.collection('timer').find(
        {}, function(e, t) {
          t.forEach(function(tx) {
            challenges.timerID = tx.data;
          });
        }
    );
    conn.collection('challengeDB').find(
        {}, function(e, challengeinput) {
          challengeinput.forEach(function(challenge) {
            logger.info(challenge.hidden);
            if (challenge.type == 'sprint') {
              challengelist.challengeList[challenge._id] = new Sprint(
                  challenge._id, challenge.creator,
                  challenge.name, challenge.startTime,
                  challenge.countdown, challenge.goal,
                  challenge.duration, challenge.channel,
                  challenge.hidden, challenge.joinedUsers);
            } else if (challenge.type == 'war') {
              challengelist.challengeList[challenge._id] = new War(
                  challenge._id, challenge.creator, challenge.name,
                  challenge.startTime, challenge.countdown,
                  challenge.duration, challenge.channel,
                  challenge.hidden, challenge.joinedUsers);
            } else if (challenge.type == 'chain war') {
              challengelist.challengeList[challenge._id] =
                        new ChainWar(challenge._id, challenge.creator,
                            challenge.name, challenge.startTime, challenge.current,
                            challenge.total, challenge.countdown,
                            challenge.duration, challenge.channel,
                            challenge.hidden, challenge.joinedUsers);
            }
          });
        }
    );
    conn.collection('goalDB').find(
        {}, function(e, goals) {
          goals.forEach(function(goal) {
            goallist.goalList[goal.authorID] = new Goal
            (goal.authorID, goal.goal, goal.goalType, goal.written,
                goal.startTime, goal.terminationTime,
                goal.channelID);
          });
        }
    );
    conn.collection('raptorDB').find(
        {}, function(e, guilds) {
          guilds.forEach(function(guild) {
            tools.raptorCount[guild.server] = guild.count;
          });
        }
    );
    conn.collection('raptorUserDB').find(
        {}, function(e, authors) {
          authors.forEach(function(author) {
            if (!(author.server in tools.userRaptors)) {
              tools.userRaptors[author.server] = {};
            }
            tools.userRaptors[author.server][author.user]
                        = author.count;
          });
        }
    );
    conn.collection('configDB').find(
        {}, function(e, guilds) {
          guilds.forEach(function(guild) {
            challenges.crossServerStatus[guild.server] = guild.xStatus;
            challenges.autoSumStatus[guild.server] = guild.autoStatus;
          });
        }
    );
  });
});

var cmdList = {
  'sprint': {
    name: 'sprint',
    description: 'Starts a sprint of <words> words which times out in'
            + ' <duration> minutes in [time to start] minutes,'
            + ' with optional [name] (can only be set'
            + ' if time to start is also set)',
    usage: 'words duration [time to start [name]]',
    process: function(client, msg, suffix) {
      challenges.startSprint(msg, suffix);
    },
  },
  'war': {
    name: 'war',
    description: 'Starts a word war of <duration> minutes in'
            + ' [time to start] minutes, with optional [name] (can only be set'
            + ' if time to start is also set)',
    usage: 'duration [time to start [name]]',
    process: function(client, msg, suffix) {
      challenges.startWar(msg, suffix);
    },
  },
  'chainwar': {
    name: 'chainwar',
    description: 'Starts a chain of <number of wars>, each of <duration>'
            + ' minutes, with [time between wars] minutes between wars,'
            + ' and optional [name] (can only be set'
            + ' if time to start is also set)',
    usage: 'number of wars duration [time between wars [name]]',
    process: function(client, msg, suffix) {
      challenges.startChainWar(msg, suffix);
    },
  },
  'join': {
    name: 'join',
    description: 'Joins war/sprint with ID number <id>',
    usage: 'id',
    process: function(client, msg, suffix) {
      challenges.joinChallenge(msg, suffix);
    },
  },
  'leave': {
    name: 'leave',
    description: 'Leaves war/sprint with ID number <id>',
    usage: 'id',
    process: function(client, msg, suffix) {
      challenges.leaveChallenge(msg, suffix);
    },
  },
  'cancel': {
    name: 'cancel',
    description: 'Ends war/sprint with ID number <id>.'
            + ' Can only be performed by creator.',
    usage: 'id',
    process: function(client, msg, suffix) {
      challenges.stopChallenge(msg, suffix);
    },
  },
  'exterminate': {
    name: 'exterminate',
    description: 'Ends war/sprint with ID number <id>.'
            + ' Can only be performed by creator.',
    usage: 'id',
    process: function(client, msg, suffix) {
      challenges.stopChallenge(msg, suffix);
    },
  },
  'total': {
    name: 'total',
    description: 'Adds your <total> for completed war/sprint with ID number'
            + ' <id>, optional [lines|pages|minutes]',
    usage: 'id total [lines|pages|minutes]',
    process: function(client, msg, suffix) {
      const raptorRoll = challenges.addTotal(msg, suffix);
      if (raptorRoll) {
        tools.raptor(msg.guild.id, msg.channel, msg.author,
            challenges.WAR_RAPTOR_CHANCE);
      }
    },
  },
  'summary': {
    name: 'summary',
    description: 'Shows the summary for completed war/sprint with ID number'
            + ' <id>',
    usage: 'id',
    process: function(client, msg, suffix) {
      challengelist.generateSummary(msg.channel, suffix);
    },
  },
  'list': {
    name: 'list',
    description: 'Lists all running wars/sprints',
    usage: '',
    process: function(client, msg, suffix) {
      challenges.listChallenges(client, msg);
    },
  },
  'timezone': {
    name: 'timezone',
    description: 'Sets your <IANA timezone identifier>',
    usage: 'IANA timezone identifier',
    type: 'goals',
    process: function(client, msg, suffix) {
      goals.setTimezone(msg, suffix);
    },
  },
  'set': {
    name: 'set',
    description: 'Sets a daily goal <goal>, with optional'
            + ' [lines|pages|minutes]',
    usage: 'goal [lines|pages|minutes]',
    type: 'goals',
    process: function(client, msg, suffix) {
      goals.setGoal(msg, suffix);
    },
  },
  'goal': {
    name: 'goal',
    description: 'Sets a daily goal <goal>, with optional'
            + ' [lines|pages|minutes]',
    usage: 'goal [lines|pages|minutes]',
    type: 'goals',
    process: function(client, msg, suffix) {
      goals.setGoal(msg, suffix);
    },
  },
  'update': {
    name: 'update',
    description: 'Updates your daily goal with your <progress> since your'
            + ' last update',
    usage: 'progress',
    type: 'goals',
    process: function(client, msg, suffix) {
      goals.updateGoal(msg, suffix, false);
    },
  },
  'add': {
    name: 'add',
    description: 'Updates your daily goal with your <progress> since your'
            + ' last update',
    usage: 'progress',
    type: 'goals',
    process: function(client, msg, suffix) {
      goals.updateGoal(msg, suffix, false);
    },
  },
  'overwrite': {
    name: 'overwrite',
    description: 'Updates your daily goal with your <progress> today',
    usage: 'progress',
    type: 'goals',
    process: function(client, msg, suffix) {
      goals.updateGoal(msg, suffix, true);
    },
  },
  'progress': {
    name: 'progress',
    description: 'Updates your daily goal with your <progress> today',
    usage: 'progress',
    type: 'goals',
    process: function(client, msg, suffix) {
      goals.updateGoal(msg, suffix, true);
    },
  },
  'reset': {
    name: 'reset',
    description: 'Resets your daily goal',
    type: 'goals',
    process: function(client, msg, suffix) {
      goals.resetGoal(msg);
    },
  },
  'goalinfo': {
    name: 'goalinfo',
    description: 'Displays progress towards your daily goal',
    type: 'goals',
    process: function(client, msg, suffix) {
      goals.viewGoal(msg);
    },
  },
  'target': {
    name: 'target',
    description: 'Generates an <easy|average|hard> target for'
            + ' <minutes> minutes',
    usage: 'easy|average|hard minutes',
    type: 'tools',
    process: function(client, msg, suffix) {
      tools.calcTarget(msg, suffix);
    },
  },
  'prompt': {
    name: 'prompt',
    description: 'Provides a writing prompt',
    type: 'tools',
    process: function(client, msg, suffix) {
      tools.getPrompt(msg);
    },
  },
  'roll': {
    name: 'roll',
    description: 'Rolls any combination of the given options,'
            + ' separated by the + operator',
    usage: 'x, x y, xdy',
    type: 'tools',
    process: function(client, msg, suffix) {
      tools.rollDice(msg, suffix);
    },
  },
  'choose': {
    name: 'choose',
    description: 'Selects an item from a list <list> of items,'
            + ' separated by commas',
    usage: 'list',
    type: 'tools',
    process: function(client, msg, suffix) {
      tools.chooseItem(msg, suffix);
    },
  },
  'raptors': {
    name: 'raptors',
    description: 'Displays raptor statistics.',
    type: 'tools',
    process: function(client, msg, suffix) {
      tools.raptorStats(client, msg);
    },
  },
  'display': {
    name: 'display',
    description: 'Allows server admins to toggle cross-server display for '
            + 'challenges.',
    usage: 'on|off',
    type: 'config',
    process: function(client, msg, suffix) {
      challenges.xsDisplay(msg, suffix);
    },
  },
  'autosum': {
    name: 'autosum',
    description: 'Allows server admins to toggle automatic display of'
            + ' challenge summaries.',
    usage: 'show|hide',
    type: 'config',
    process: function(client, msg, suffix) {
      challenges.autoSum(msg, suffix);
    },
  },
};

client.on('message', (msg) => {
  if (msg.isMentioned(client.user)) {
    msg.channel.send('My name is Winnie, and I run challenges, track goals,'
            + ' and provide other useful commands for writing.  I use the '
            + config.cmd_prefix + ' prefix. Use ' + config.cmd_prefix + 'help'
            + ' for command information.');
  }
  if (msg.author.id != client.user.id && (msg.content.startsWith(config
      .cmd_prefix))) {
    logger.info(msg.author + ' entered command ' + msg.content);
    const cmdData = msg.content.split(' ')[0]
        .substring(config.cmd_prefix.length).toLowerCase();
    const suffix = msg.content.substring(cmdData.length
            + config.cmd_prefix.length + 1);
    var cmd = cmdList[cmdData];
    if (cmdData === 'help') {
      if (suffix) {
        var cmd = cmdList[suffix];
        let helpMsg = '';
        try {
          helpMsg += 'Data for ' + cmd.name;
          const cmdUse = cmd.usage;
          if (cmdUse) {
            helpMsg += ' ' + cmdUse;
          }
          const cmdDesc = cmd.description;
          if (cmdDesc) {
            helpMsg += ': ' + cmdDesc;
          }
          helpMsg += '\n';
          msg.channel.send(helpMsg);
        } catch (e) {
          msg.channel.send('That command does not exist.');
        }
      } else {
        msg.author.send('**Winnie_Bot Commands:**').then(function() {
          let helpMsg = '';
          for (const i in cmdList) {
            helpMsg += '**' + config.cmd_prefix;
            const cmdName = cmdList[i].name;
            if (cmdName) {
              helpMsg += cmdName;
            }
            const cmdUse = cmdList[i].usage;
            if (cmdUse) {
              helpMsg += ' ' + cmdUse;
            }
            const cmdDesc = cmdList[i].description;
            if (cmdDesc) {
              helpMsg += ':** ' + cmdDesc;
            }
            helpMsg += '\n';
          }
          msg.channel.send(msg.author + ', I sent you a DM.');
          msg.author.send(helpMsg);
        });
      }
    } else if (cmd) {
      try {
        cmd.process(client, msg, suffix);
      } catch (e) {
        msg.channel.send('Unknown error.  See log file for details.');
        logger.error('Error %s: %s.', e, e.stack);
      }
    }
  }
});

process.on('uncaughtException', function(e) {
  logger.error('Error %s: %s.\nWinnie_Bot will now attempt to reconnect.',
      e, e.stack);
  try {
    client.login(config.token);
    fileSystemCheck();
  } catch (e) {
    logger.error('Reconnection failed.\nWinnie_Bot will now terminate.');
    process.exit(1);
  }
});

client.on('error', console.error);

client.login(config.token);
