const chalClass = require("./challenges/challenge.js");
const challenges = require("./challenges/challenges.js");
const chalStart = require("./challenges/run.js");
const chalSum = require("./challenges/summary.js");
const goalClass = require("./goals/goal.js");
const goalTZ = require("./goals/timezone.js");
const goalData = require("./goals/data.js");
const goalTrack = require("./goals/track.js");
const toolRaptor = require("./tools/raptors.js");
const toolRoll = require("./tools/roll.js");
const toolWrite = require("./tools/write.js");
const chalConfig = require("./challenges/config/config.js");

// const constants = require ("./constants.js");
const functions = require("./tools/data.js");
const config = require("./config.json");
const Discord = require("discord.js");
const logger = require("./logger.js");
const gameloop = require("node-gameloop");
const timezoneJS = require("timezone-js");
const mongoose = require("mongoose");

global.client = new Discord.Client;
global.conn = mongoose.connection;
timezoneJS.timezone.zoneFileBasePath = "node_modules/timezone-js/tz";
timezoneJS.timezone.init();

const tickTimer = gameloop.setGameLoop(async function(delta) {
    for (var item in challenges.challengeList){
        if (challenges.challengeList[item].type == "chain war") {
            if (challenges.challengeList[item].state == 2) {
                challenges.challengeList[item].state = 3;
                if (challenges.challengeList[item].current < challenges
                .challengeList[item].total) {
                    var startTime = new Date().getTime();
                    challenges.challengeList[challenges.timerID] = new chalClass
                        .ChainWar(challenges.timerID, challenges.challengeList
                        [item].creator, challenges.challengeList[item].warName,
                        startTime, challenges.challengeList[item].current+1,
                        challenges.challengeList[item].total, challenges
                        .challengeList[item].countdown, challenges.challengeList
                        [item].duration, challenges.challengeList[item]
                        .channelID);
                    conn.collection("timer").update(
                        {data: challenges.timerID},
                        {data: (challenges.timerID+1)},
                        {upsert: true}
                    )
                    challenges.timerID = challenges.timerID + 1
                }
            }
        }
        challenges.challengeList[item].update();
    }
    for (var item in functions.goalList){
        functions.goalList[item].update();
    }
}, 1000);

client.on("ready", () => {
    logger.info("Winnie_Bot is online");
    // Connect to the database
    mongoose.connect(config.storage_url, { useNewUrlParser: true, autoIndex:
        false }, function (e, db) {
        if(e) throw e;
        logger.info("Database created!");
        conn.collection("timer").find(
            {}, function(e, t) {
                t.forEach(function(tx) {
                    challenges.timerID = tx.data;
                });
            }
        )
        conn.collection("challengeDB").find(
            {}, function(e, challenges) {
                challenges.forEach(function(challenge) {
                    if(challenge.type == "sprint") {
                        challenges.challengeList[challenge._id] = new chalClass
                        .Sprint(challenge._id, challenge.creator,
                        challenge.name, challenge.startTime,
                        challenge.countdown, challenge.goal,
                        challenge.duration, challenge.channel, "sprint",
                        challenge.hidden);
                    } else if(challenge.type == "war") {
                        challenges.challengeList[challenge._id] = new chalClass
                        .War(challenge._id, challenge.creator, challenge.name,
                        challenge.startTime, challenge.countdown,
                        challenge.duration, challenge.channel, "war",
                        challenge.hidden);
                    } else if(challenge.type == "chain war") {
                        challenges.challengeList[challenge._id] = new chalClass
                        .ChainWar(challenge._id, challenge.creator,
                        challenge.name, challenge.startTime, challenge.current,
                        challenge.total, challenge.countdown,
                        challenge.duration, challenge.channel, "chain war",
                        challenge.hidden);
                    }
                });
            }
        );
        conn.collection("goalDB").find(
            {}, function(e, goals) {
                goals.forEach(function(goal) {
                    goalData.goalList[goal.authorID] = new goalClass.Goal
                        (goal.authorID, goal.goal, goal.goalType, goal.written,
                        goal.startTime, goal.terminationTime,
                        goal.channelID);
                });
            }
        );
        conn.collection("raptorDB").find(
            {}, function(e, guilds) {
                guilds.forEach(function(guild) {
                    functions.raptorCount[guild.server] = guild.count;
                });
            }
        );
        conn.collection("raptorUserDB").find(
            {}, function(e, authors) {
                authors.forEach(function(author) {
                    if (!(author.server in functions.userRaptors)) {
                        functions.userRaptors[author.server] = {};
                    }
                    functions.userRaptors[author.server][author.user]
                        = author.count;
                });
            }
        );
        conn.collection("configDB").find(
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
    "sprint": {
        name: "sprint",
        description: "Starts a sprint of <words> words which times out in"
            + " <duration> minutes in [time to start] minutes,"
            + " with optional [name] (can only be set"
            + " if time to start is also set)",
        usage: "words duration [time to start [name]]",
        process: function(client,msg,suffix) {
            chalStart.startSprint(msg, suffix);
        }
    },
    "war": {
        name: "war",
        description: "Starts a word war of <duration> minutes in"
            + " [time to start] minutes, with optional [name] (can only be set"
            + " if time to start is also set)",
        usage: "duration [time to start [name]]",
        process: function(client,msg,suffix) {
            chalStart.startWar(msg, suffix);
        }
    },
    "chainwar": {
        name: "chainwar",
        description: "Starts a chain of <number of wars>, each of <duration>"
            + " minutes, with [time between wars] minutes between wars,"
            + " and optional [name] (can only be set"
            + " if time to start is also set)",
        usage: "number of wars duration [time between wars [name]]",
        process: function(client,msg,suffix) {
            chalStart.startChainWar(msg, suffix);
        }
    },
    "join": {
        name: "join",
        description: "Joins war/sprint with ID number <id>",
        usage: "id",
        process: function(client,msg,suffix) {
            challenges.joinChallenge(msg, suffix);
        }
    },
    "leave": {
        name: "leave",
        description: "Leaves war/sprint with ID number <id>",
        usage: "id",
        process: function(client,msg,suffix) {
            challenges.leaveChallenge(msg, suffix);
        }
    },
    "cancel": {
        name: "cancel",
        description: "Ends war/sprint with ID number <id>."
            + " Can only be performed by creator.",
        usage: "id",
        process: function(client,msg,suffix) {
            chalStart.stopChallenge(msg, suffix);
        }
    },
    "exterminate": {
        name: "exterminate",
        description: "Ends war/sprint with ID number <id>."
            + " Can only be performed by creator.",
        usage: "id",
        process: function(client,msg,suffix) {
            chalStart.stopChallenge(msg, suffix);
        }
    },
    "total": {
        name: "total",
        description: "Adds your <total> for completed war/sprint with ID number"
            + " <id>, optional [lines|pages|minutes]",
        usage: "id total [lines|pages|minutes]",
        process: function(client,msg,suffix) {
            var raptorRoll = chalSum.addTotal(msg, suffix);
            logger.info(raptorRoll);
            if (raptorRoll) {
                functions.raptor(msg.guild.id, msg.channel, msg.author,
                    challenges.WAR_RAPTOR_CHANCE);
            }
        }
    },
    "summary": {
        name: "summary",
        description: "Shows the summary for completed war/sprint with ID number"
            + " <id>",
        usage: "id",
        process: function(client,msg,suffix) {
            chalSum.generateSummary(msg.channel, suffix);
        }
    },
    "list": {
        name: "list",
        description: "Lists all running wars/sprints",
        usage: "",
        process: function(client,msg,suffix) {
            chalSum.listChallenges(client, msg);
        }
    },
    "timezone": {
        name: "timezone",
        description: "Sets your <IANA timezone identifier>",
        usage: "IANA timezone identifier",
        type: "goals",
        process: function(client,msg,suffix) {
            goalTZ.setTimezone(msg, suffix);
        }
    },
    "set": {
        name: "set",
        description: "Sets a daily goal <goal>, with optional"
            + " [lines|pages|minutes]",
        usage: "goal [lines|pages|minutes]",
        type: "goals",
        process: function(client,msg,suffix) {
            goalTrack.setGoal(msg, suffix);
        }
    },
    "goal": {
        name: "goal",
        description: "Sets a daily goal <goal>, with optional"
            + " [lines|pages|minutes]",
        usage: "goal [lines|pages|minutes]",
        type: "goals",
        process: function(client,msg,suffix) {
            goalTrack.setGoal(msg, suffix);
        }
    },
    "update": {
        name: "update",
        description: "Updates your daily goal with your <progress> since your"
            + " last update",
        usage: "progress",
        type: "goals",
        process: function(client,msg,suffix) {
            goalTrack.updateGoal(msg, suffix, false);
        }
    },
    "add": {
        name: "add",
        description: "Updates your daily goal with your <progress> since your"
            + " last update",
        usage: "progress",
        type: "goals",
        process: function(client,msg,suffix) {
            goalTrack.updateGoal(msg, suffix, false);
        }
    },
    "overwrite": {
        name: "overwrite",
        description: "Updates your daily goal with your <progress> today",
        usage: "progress",
        type: "goals",
        process: function(client,msg,suffix) {
            goalTrack.updateGoal(msg, suffix, true);
        }
    },
    "progress": {
        name: "progress",
        description: "Updates your daily goal with your <progress> today",
        usage: "progress",
        type: "goals",
        process: function(client,msg,suffix) {
            goalTrack.updateGoal(msg, suffix, true);
        }
    },
    "reset": {
        name: "reset",
        description: "Resets your daily goal",
        type: "goals",
        process: function(client,msg,suffix) {
            goalTrack.resetGoal(msg);
        }
    },
    "goalinfo": {
        name: "goalinfo",
        description: "Displays progress towards your daily goal",
        type: "goals",
        process: function(client,msg,suffix) {
            goalTrack.viewGoal(msg);
        }
    },
    "target": {
        name: "target",
        description: "Generates an <easy|average|hard> target for"
            + " <minutes> minutes",
        usage: "easy|average|hard minutes",
        type: "tools",
        process: function(client,msg,suffix) {
            toolWrite.calcTarget(msg,suffix);
        }
    },
    "prompt": {
        name: "prompt",
        description: "Provides a writing prompt",
        type: "tools",
        process: function(client,msg,suffix) {
            toolWrite.getPrompt(msg);
        }
    },
    "roll": {
        name: "roll",
        description: "Rolls any combination of the given options,"
            + " separated by the + operator",
        usage: "x, x y, xdy",
        type: "tools",
        process: function(client,msg,suffix) {
            toolRoll.rollDice(msg,suffix);
        }
    },
    "choose": {
        name: "choose",
        description: "Selects an item from a list <list> of items,"
            + " separated by commas",
        usage: "list",
        type: "tools",
        process: function(client,msg,suffix) {
            toolWrite.chooseItem(msg,suffix);
        }
    },
    "raptors": {
        name: "raptors",
        description: "Displays raptor statistics.",
        type: "tools",
        process: function(client,msg,suffix) {
            toolRaptor.raptorStats(client,msg);
        }
    },
    "display": {
        name: "display",
        description: "Allows server admins to toggle cross-server display for "
            + "challenges.",
        usage: "on|off",
        type: "config",
        process: function(client,msg,suffix) {
            chalConfig.xsDisplay(msg,suffix);
        }
    },
    "autosum": {
        name: "autosum",
        description: "Allows server admins to toggle automatic display of"
            + " challenge summaries.",
        usage: "show|hide",
        type: "config",
        process: function(client,msg,suffix) {
            chalConfig.autoSum(msg,suffix);
        }
    }
}

client.on("message", (msg) => {
    if(msg.isMentioned(client.user)){
        msg.channel.send("My name is Winnie, and I run challenges, track goals,"
            + " and provide other useful commands for writing.  I use the "
            + config.cmd_prefix + " prefix. Use " + config.cmd_prefix + "help"
            + " for command information.");
    }
    if(msg.author.id != client.user.id && (msg.content.startsWith(config
        .cmd_prefix))){
        logger.info(msg.author + " entered command " + msg.content);
        var cmdData = msg.content.split(" ")[0]
            .substring(config.cmd_prefix.length).toLowerCase();
        var suffix = msg.content.substring(cmdData.length
            + config.cmd_prefix.length + 1)
        var cmd = cmdList[cmdData];
        if(cmdData === "help"){
            if(suffix){
                var cmd = cmdList[suffix];
                var helpMsg = "";
                try {
                    helpMsg += "Data for " + cmd.name;
                    var cmdUse = cmd.usage;
                    if(cmdUse){
                        helpMsg += " " + cmdUse;
                    }
                    var cmdDesc = cmd.description;
                    if(cmdDesc){
                        helpMsg += ": " + cmdDesc;
                    }
                    helpMsg += "\n"
                    msg.channel.send(helpMsg);
                } catch(e) {
                    msg.channel.send("That command does not exist.");
                }
            } else {
                msg.author.send("**Winnie_Bot Commands:**").then(function(){
                var helpMsg = "";
                for(var i in cmdList) {
                    helpMsg += "**" + config.cmd_prefix;
                    var cmdName = cmdList[i].name;
                    if(cmdName){
                        helpMsg += cmdName;
                    }
                    var cmdUse = cmdList[i].usage;
                    if(cmdUse){
                        helpMsg += " " + cmdUse;
                    }
                    var cmdDesc = cmdList[i].description;
                    if(cmdDesc){
                        helpMsg += ":** " + cmdDesc;
                    }
                    helpMsg += "\n";
                }
                msg.channel.send(msg.author + ", I sent you a DM.");
                msg.author.send(helpMsg);
            });
            }
        }
        else if(cmd) {
            try{
                cmd.process(client,msg,suffix);
            } catch(e){
                msg.channel.send("Unknown error.  See log file for details.");
                logger.error("Error %s: %s.", e, e.stack);
            }
        }
    }
});

process.on("uncaughtException", function(e) {
    logger.error("Error %s: %s.\nWinnie_Bot will now attempt to reconnect.",
        e, e.stack);
    try {
        client.login(config.token);
        fileSystemCheck();
    } catch (e) {
        logger.error("Reconnection failed.\nWinnie_Bot will now terminate.");
        process.exit(1);
    }
});

client.on("error", console.error);

client.login(config.token);
