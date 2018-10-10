const chalClass = require("./challenges/challenge.js");
const chalData = require("./challenges/data.js");
const chalStart = require("./challenges/run.js");
const chalPings = require("./challenges/pings.js");
const chalSum = require("./challenges/summary.js");
const goalClass = require("./goals/goal.js");
const goalTZ = require("./goals/timezone.js");
const goalData = require("./goals/data.js");
const goalTrack = require("./goals/track.js");

const constants = require ("./constants.js");
const functions = require("./functions.js");
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
    for (var item in chalData.challengeList){
        if (chalData.challengeList[item].type == "chain war") {
            if (chalData.challengeList[item].state == 2) {
                chalData.challengeList[item].state = 3;
                if (chalData.challengeList[item].current < chalData
                .challengeList[item].total) {
                    var startTime = new Date().getTime();
                    chalData.challengeList[chalData.timerID] = new chalClass
                        .ChainWar(chalData.timerID, chalData.challengeList
                        [item].creator, chalData.challengeList[item].warName,
                        startTime, chalData.challengeList[item].current+1,
                        chalData.challengeList[item].total, chalData
                        .challengeList[item].countdown, chalData.challengeList
                        [item].duration, chalData.challengeList[item]
                        .channelID);
                    conn.collection("timer").update(
                        {data: chalData.timerID},
                        {data: (chalData.timerID+1)},
                        {upsert: true}
                    )
                    chalData.timerID = chalData.timerID + 1
                }
            }
        }
        chalData.challengeList[item].update();
    }
    for (var item in functions.goalList){
        functions.goalList[item].update();
    }
}, 1000);

client.on("ready", () => {
    logger.info("Winnie_Bot is online");
    // Connect to the database
    mongoose.connect(config.storageUrl, { useNewUrlParser: true, autoIndex:
        false }, function (e, db) {
        if(e) throw e;
        logger.info("Database created!");
        conn.collection("timer").find(
            {}, function(e, t) {
                t.forEach(function(tx) {
                    chalData.timerID = tx.data;
                });
            }
        )
        conn.collection("challengeDB").find(
            {}, function(e, challenges) {
                challenges.forEach(function(challenge) {
                    if(challenge.type == "sprint") {
                        chalData.challengeList[challenge._id] = new chalClass
                        .Sprint(challenge._id, challenge.creator,
                        challenge.name, challenge.startTime,
                        challenge.countdown, challenge.goal,
                        challenge.duration, challenge.channel, "sprint",
                        challenge.hidden);
                    } else if(challenge.type == "war") {
                        chalData.challengeList[challenge._id] = new chalClass
                        .War(challenge._id, challenge.creator, challenge.name,
                        challenge.startTime, challenge.countdown,
                        challenge.duration, challenge.channel, "war",
                        challenge.hidden);
                    } else if(challenge.type == "chain war") {
                        chalData.challengeList[challenge._id] = new chalClass
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
                    chalData.crossServerStatus[guild.server] = guild.xStatus;
                    chalData.autoSumStatus[guild.server] = guild.autoStatus;
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
            chalPings.joinChallenge(msg, suffix);
        }
    },
    "leave": {
        name: "leave",
        description: "Leaves war/sprint with ID number <id>",
        usage: "id",
        process: function(client,msg,suffix) {
            chalPings.leaveChallenge(msg, suffix);
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
                    chalData.WAR_RAPTOR_CHANCE);
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
    "update": {
        name: "update",
        description: "Updates your daily goal with your <progress> since your"
            + " last update",
        usage: "update",
        type: "goals",
        process: function(client,msg,suffix) {
            goalTrack.updateGoal(msg, suffix, false);
        }
    },
    "add": {
        name: "add",
        description: "Updates your daily goal with your <progress> since your"
            + " last update",
        usage: "add",
        type: "goals",
        process: function(client,msg,suffix) {
            goalTrack.updateGoal(msg, suffix, false);
        }
    },
    "overwrite": {
        name: "overwrite",
        description: "Updates your daily goal with your <progress> today",
        usage: "overwrite",
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
            var args = suffix.split(" ");
            var difficulty = args.shift();
            var time = args.shift();
            var base = null;
            if(!Number.isInteger(Number(time))){
                msg.channel.send("Invalid input. Duration must be a"
                    + " whole number.")
            } else {
                switch(difficulty) {
                    case "easy":
                        base = 12;
                        break;
                    case "average":
                        base = 24;
                        break;
                    case "hard":
                        base = 36;
                        break;
                    default:
                        base = null;
                        break;
                }
                if (base === null) {
                    msg.channel.send("Invalid input. You need to select an"
                        + " easy, average, or hard goal.");
                } else {
                    var goalPerMinute = ((Math.ceil(Math.random() * 12)
                        + base));
                    var goalTotal = (goalPerMinute * time);
                    msg.channel.send(msg.author + ", your goal is **"
                        + goalTotal + "**.");
                }
            }
        }
    },
    "prompt": {
        name: "prompt",
        description: "Provides a writing prompt",
        type: "tools",
        process: function(client,msg,suffix) {
            var choiceID = (Math.floor(Math.random() * constants
                .PROMPT_LIST.length))
            msg.channel.send(msg.author + ", your prompt is: **"
                + constants.PROMPT_LIST[choiceID].trim() + "**");
        }
    },
    "roll": {
        name: "roll",
        description: "Rolls any combination of the given options,"
            + " separated by the + operator",
        usage: "x, x y, xdy",
        type: "tools",
        process: function(client,msg,suffix) {
            var diceString = "";
            var diceSum = 0;
            var faces = suffix.split("+");
            for (var i = 0; i < faces.length; i++) {
                if(Number.isInteger(Number(faces[i]))) { // Single number
                    if (faces.length == 1) { // Treat as a 1dx roll
                        var roll = (Math.floor(Math.random() * Number(faces[i]))
                            + 1)
                        diceString += roll;
                        diceSum += roll;
                    } else { // Add to the other rolls
                        diceString += "(" + Number(faces[i]) + ")";
                        diceSum += Number(faces[i]);
                    }
                } else if (faces[i].split("d").length == 2) { // RPG-style roll
                    rpgRoll = faces[i].split("d");
                    if (rpgRoll[0] == "") {
                        rpgRoll[0] = 1;
                    }
                    if (!Number.isInteger(Number(rpgRoll[0])) ||
                        !Number.isInteger(Number(rpgRoll[1]))) {
                        diceString = "Error: Both values in an RPG-style roll"
                            + " must be integers.";
                        diceSum = 0;
                        break;
                    } else {
                        if(rpgRoll[0] > 20) {
                            diceString = "ERROR: TOO BIG.";
                            diceSum = 0;
                            break;
                        } else {
                            for (var j = 0; j < Number(rpgRoll[0]); j++){
                                var roll = (Math.floor(Math.random() *
                                    Number(rpgRoll[1])) + 1)
                                diceString += roll;
                                if (j < (Number(rpgRoll[0]) - 1)) {
                                    diceString += ", "
                                }
                                diceSum += roll;
                            }
                        }
                    }
                } else if(faces[i].split(" ").length == 2){ // Range roll
                    rangeRoll = faces[i].split(" ");
                    if (!Number.isInteger(Number(rangeRoll[0])) ||
                        !Number.isInteger(Number(rangeRoll[1]))) {
                        diceString = "Error: Both values in a range roll"
                            + " must be integers.";
                        diceSum = 0;
                        break;
                    } else {
                        if(Number(rangeRoll[0]) < Number(rangeRoll[1])){
                            var roll = (Math.floor(Math.random() * (1 + Number
                                (rangeRoll[1]) - Number(rangeRoll[0]))
                                + Number(rangeRoll[0])));
                            diceString += roll;
                            diceSum += roll;
                        } else {// First number is larger than second
                            diceString = "Error: The first number in a range"
                                + " roll must be smaller than the second.";
                            diceSum = 0;
                            break;
                        }
                    }
                } else {
                    diceString = "Error: " + faces[i] + " is not a valid roll.";
                    diceSum = 0;
                    break;
                }
                if (i < (faces.length - 1)) {
                    diceString += ", "
                }
            }
            msg.channel.send(diceString);
            if (diceSum > 0) {
                msg.channel.send("Total = " + diceSum);
            }
        }
    },
    "choose": {
        name: "choose",
        description: "Selects an item from a list <list> of items,"
            + " separated by commas",
        usage: "list",
        type: "tools",
        process: function(client,msg,suffix) {
            var items = suffix.split(",");
            var choiceID = (Math.floor(Math.random() * items.length));
            msg.channel.send(msg.author + ", from " + suffix + ", I selected **"
                + items[choiceID].trim() + "**");
        }
    },
    "raptors": {
        name: "raptors",
        description: "Displays raptor statistics.",
        type: "config",
        process: function(client,msg,suffix) {
            var raptorMsg = "__**Raptor Statistics:**__\n";
            var raptorOrd = functions.sortCollection(functions.raptorCount);
            for (var i = 0; i < 10; i++) {
                if (raptorOrd[i] === undefined) {
                    break;
                }
                raptorMsg += "\n" + (i+1) + ". *"
                    + client.guilds.get(raptorOrd[i]) + ":* "
                    + functions.raptorCount[raptorOrd[i]];
            }
            msg.channel.send(raptorMsg);
            var userOrd = functions.sortCollection(functions
                .userRaptors[msg.guild.id]);
            if (functions.raptorCount[msg.guild.id] > 0) {
                var userRaptorMsg = "**Raptors by Author:**";
                for (var i = 0; i < 10; i++) {
                    if (userOrd[i] === undefined) {
                        break;
                    }
                    userRaptorMsg += "\n" + (i+1) + ". *"
                        + client.users.get(userOrd[i]).username + ":* "
                        + functions.userRaptors[msg.guild.id][userOrd[i]];
                }
                msg.channel.send(userRaptorMsg);
            }
        }
    },
    "display": {
        name: "display",
        description: "Allows server admins to toggle cross-server display for "
            + "challenges.",
        usage: "on|off",
        type: "config",
        process: function(client,msg,suffix) {
            if(suffix == "") {
                var xsType = "on";
                if (chalData.crossServerStatus[msg.guild.id] == true) {
                    xsType = "off";
                }
                msg.channel.send(msg.guild.name + " currently has cross-server"
                    + " challenges turned **" + xsType + "**.")
            } else {
                if(msg.member.permissions.has("ADMINISTRATOR")) {
                    if(suffix == "on" || suffix == "off") {
                        var xsType = "on";
                        if (suffix == "off") {
                            xsType = "off";
                            chalData.crossServerStatus[msg.guild.id] = true;
                        } else {
                            xsType = "on";
                            chalData.crossServerStatus[msg.guild.id] = false;
                        }
                        conn.collection("configDB").update(
                            {"server": msg.guild.id},
                            {$set: {"xStatus":
                                chalData.crossServerStatus[msg.guild.id]}},
                            {upsert: true}
                        )
                        msg.channel.send(msg.author + ", you have turned"
                            + " cross-server challenges **" + xsType + "**.");
                    } else {
                        msg.channel.send(msg.author + ", use **on|off** to"
                            + " toggle cross-server challenges.");
                    }
                } else {
                    msg.channel.send("Only server administrators are permitted"
                        + " to configure challenges.");
                }
            }
        }
    },
    "autosum": {
        name: "autosum",
        description: "Allows server admins to toggle automatic display of"
            + " challenge summaries.",
        usage: "show|hide",
        type: "config",
        process: function(client,msg,suffix) {
            if(suffix == "") {
                var autoType = "visible";
                if (chalData.autoSumStatus[msg.guild.id] == true) {
                    autoType = "hidden";
                }
                msg.channel.send(msg.guild.name + " currently has automatic"
                    + " summaries **" + autoType + "**.")
            } else {
                if(msg.member.permissions.has("ADMINISTRATOR")) {
                    if(suffix == "show" || suffix == "hide") {
                        var autoType = "on";
                        if (suffix == "hide") {
                            autoType = "off";
                            chalData.autoSumStatus[msg.guild.id] = true;
                        } else {
                            autoType = "on";
                            chalData.autoSumStatus[msg.guild.id] = false;
                        }
                        conn.collection("configDB").update(
                            {"server": msg.guild.id},
                            {$set: {"autoStatus":
                                chalData.autoSumStatus[msg.guild.id]}},
                            {upsert: true}
                        )
                        msg.channel.send(msg.author + ", you have turned"
                            + " automatic summaries **" + autoType + "**.");
                    } else {
                        msg.channel.send(msg.author + ", use **show|hide** to"
                            + " toggle automatic summaries.");
                    }
                } else {
                    msg.channel.send("Only server administrators are permitted"
                        + " to configure automatic summaries.");
                }
            }
        }
    }
}

client.on("message", (msg) => {
    if(msg.isMentioned(client.user)){
        msg.channel.send("I don't know what you want. Try !help for command"
            + " information.");
    }
    if(msg.author.id != client.user.id && (msg.content.startsWith(constants
        .CMD_PREFIX))){
        logger.info(msg.author + " entered command " + msg.content);
        var cmdData = msg.content.split(" ")[0]
            .substring(constants.CMD_PREFIX.length).toLowerCase();
        var suffix = msg.content.substring(cmdData.length
            + constants.CMD_PREFIX.length + 1)
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
                    helpMsg += "**" + constants.CMD_PREFIX;
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
    } else {
        return
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