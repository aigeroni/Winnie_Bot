const classes = require('./classes.js');
const constants = require ('./constants.js');
const functions = require('./functions.js');

const Discord = require('discord.js');
const config = require('./config.json');
const logger = require('./logger.js');
const gameloop = require('node-gameloop');
const timezoneJS = require('timezone-js');
const mongoose = require('mongoose');

global.client = new Discord.Client;
global.conn = mongoose.connection;
timezoneJS.timezone.zoneFileBasePath = 'node_modules/timezone-js/tz';
timezoneJS.timezone.init();
var regionRegex = /^(Africa|America|Antarctica|Asia|Atlantic|Australia|Europe|Indian|Pacific|Etc)/;

const tickTimer = gameloop.setGameLoop(async function(delta) {
    for (var item in functions.challengeList){
        if (functions.challengeList[item].type == 'chain war') {
            if (functions.challengeList[item].state == 2
                && functions.challengeList[item].current < functions
                .challengeList[item].total) {
                functions.challengeList[item].state = 3;
                var startTime = new Date().getTime();
                functions.challengeList[functions.timerID] = new classes
                    .ChainWar(functions.timerID, functions.challengeList[item]
                    .creator, functions.challengeList[item].warName, startTime,
                    functions.challengeList[item].current+1, functions
                    .challengeList[item].total, functions.challengeList[item]
                    .countdown, functions.challengeList[item].duration,
                    functions.challengeList[item].channelID);
                conn.collection('timer').update(
                    {data: functions.timerID},
                    {data: (functions.timerID+1)},
                    {upsert: true}
                )
                functions.timerID = functions.timerID + 1;
            }
        }
        functions.challengeList[item].update();
    }
    for (var item in functions.goalList){
        functions.goalList[item].update();
    }
}, 1000);



client.on('ready', () => {
    logger.info('Winnie_Bot is online');
    // Connect to the database
    mongoose.connect(config.storageUrl, { useNewUrlParser: true }, 
        function (e, db) {
        if(e) throw e;
        logger.info("Database created!");
        conn.collection('timer').find(
            {}, function(e, t) {
                t.forEach(function(tx) {
                    functions.timerID = tx.data;
                });
            }
        )
        conn.collection('challengeDB').find(
            {}, function(e, challenges) {
                challenges.forEach(function(challenge) {
                    if(challenge.type == "sprint") {
                        functions.challengeList[challenge._id] = new classes
                        .Sprint(challenge._id, challenge.creator,
                        challenge.name, challenge.startTime,
                        challenge.countdown, challenge.goal,
                        challenge.duration, challenge.channel, "sprint");
                    } else if(challenge.type == "war") {
                        functions.challengeList[challenge._id] = new classes
                        .War(challenge._id, challenge.creator, challenge.name,
                        challenge.startTime, challenge.countdown,
                        challenge.duration, challenge.channel, "war");
                    } else if(challenge.type == "chain war") {
                        functions.challengeList[challenge._id] = new classes
                        .ChainWar(challenge._id, challenge.creator,
                        challenge.name, challenge.startTime, challenge.current,
                        challenge.total, challenge.countdown,
                        challenge.duration, challenge.channel, "chain war");
                }
                });
            }
        );
        conn.collection('goalDB').find(
            {}, function(e, goals) {
                goals.forEach(function(goal) {
                    functions.goalList[goal.authorID] = new classes.Goal
                        (goal.authorID, goal.goal, goal.goalType, goal.written,
                        goal.startTime, goal.terminationTime,
                        goal.channelID);
                });
            }
        );
        conn.collection('raptorDB').find(
            {}, function(e, guilds) {
                guilds.forEach(function(guild) {
                    functions.raptorCount[guild.server] = guild.count;
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
            + " with optional [name]",
        usage: "<words> <duration> [<time to start> [<name>]]",
        process: function(client,msg,suffix) {
            var args = suffix.split(" ");
            var words = args.shift();
            var timeout = args.shift();
            var start = args.shift();
            var sprintName = args.join(' ');
            if (start === undefined){
                start = 1;
            }
            if (!Number.isInteger(Number(words))){
                msg.channel.send("Word goal must be a whole number.");
            } else if(isNaN(timeout)){
                msg.channel.send("Sprint duration must be a number.");
            } else if(isNaN(start)){
                msg.channel.send("Time to start must be a number.");
            } else if (timeout > 60) {
                msg.channel.send("Sprints cannot last for more than an hour.");
            } else if (words < 1) {
                msg.channel.send("Word goal cannot be negative.");
            } else if (start < 0) {
                msg.channel.send("Sprints cannot start in the past.");
            } else if (timeout < 1) {
                msg.channel.send("Sprints must run for at least a minute.");
            } else {
                try{
                    var creatorID = msg.author.id;
                    if(sprintName == '') {
                        sprintName = msg.author.username + "'s sprint";
                    }
                    var startTime = new Date().getTime();
                    functions.challengeList[functions.timerID] =
                        new classes.Sprint(functions.timerID, creatorID,
                        sprintName, startTime, start, words, timeout,
                        msg.channel.id);
                    conn.collection('timer').update(
                        {data: functions.timerID},
                        {data: (functions.timerID+1)},
                        {upsert: true}
                    )
                    functions.timerID = functions.timerID + 1;
                } catch(e) {
                    msg.channel.send("Error: Sprint creation failed.");
                    logger.error('Error %s: %s.', e, e.stack);
                }
            }
        }
    },
	"war": {
        name: "war",
        description: "Starts a word war of <duration> minutes in"
            + " [time to start] minutes, with optional [name]",
        usage: "<duration> [<time to start> [<name>]]",
	    process: function(client,msg,suffix) {
            var args = suffix.split(" ");
            var duration = args.shift();
            var start = args.shift();
            var warName = args.join(' ');
            if (start === undefined) {
                start = 1;
            }
            if(isNaN(start)) {
                msg.channel.send("Time to start must be a number.");
            } else if(isNaN(duration)) {
                msg.channel.send("War duration must be a number.");
            } else if (duration > 60) {
                msg.channel.send("Wars cannot last for more than an hour.");
            } else if (start < 0) {
                msg.channel.send("Wars cannot start in the past.");
            } else if (duration < 1) {
                msg.channel.send("Wars must run for at least a minute.");
            } else {
                try{
                    var creatorID = msg.author.id;
                    if(warName == '') {
                        warName = msg.author.username + "'s war";
                    }
                    var startTime = new Date().getTime();
                    functions.challengeList[functions.timerID] =
                        new classes.War(functions.timerID, creatorID, warName,
                        startTime, start, duration, msg.channel.id);
                    conn.collection('timer').update(
                        {data: functions.timerID},
                        {data: (functions.timerID+1)},
                        {upsert: true}
                    )
                    functions.timerID = functions.timerID + 1;
                } catch(e) {
                    msg.channel.send("Error: War creation failed.");
                    logger.error('Error %s: %s.', e, e.stack);
                }
            }
	    }
    },
    "chainwar": {
        name: "chainwar",
        description: "Starts a chain of <number of wars>, each of <duration>"
            + " minutes, with [time between wars] minutes between wars,"
            + " and optional [name]",
        usage: "<number of wars> <duration> [<time between wars> [<name>]]",
	    process: function(client,msg,suffix) {
            var args = suffix.split(" ");
            var chainWarCount = args.shift();
            var duration = args.shift();
            var timeBetween = args.shift();
            var warName = args.join(' ');
            if (timeBetween === undefined) {
                start = 1;
            }
            if(isNaN(chainWarCount)) {
                msg.channel.send("War count must be a number.");
            } else if(isNaN(timeBetween)) {
                msg.channel.send("Time between wars must be a number.");
            } else if(isNaN(duration)) {
                msg.channel.send("War duration must be a number.");
            } else if (!(2 < chainWarCount < 10)) {
                msg.channel.send("Chain wars must be between two and ten wars"
                    + " long.");
            } else if (duration * chainWarCount > 120) {
                msg.channel.send("Chain wars cannot last for more than two"
                + " hours of writing time.");
            } else if (timeBetween < 0) {
                msg.channel.send("Chain wars cannot overlap.");
            } else if (duration < 1) {
                msg.channel.send("Wars must run for at least a minute.");
            } else {
                try{
                    var creatorID = msg.author.id;
                    if(warName == '') {
                        warName = msg.author.username + "'s war";
                    }
                    var startTime = new Date().getTime();
                    functions.challengeList[functions.timerID] =
                        new classes.ChainWar(functions.timerID, creatorID,
                        warName, startTime, 1, chainWarCount, timeBetween,
                        duration, msg.channel.id);
                    conn.collection('timer').update(
                        {data: functions.timerID},
                        {data: (functions.timerID+1)},
                        {upsert: true}
                    )
                    functions.timerID = functions.timerID + 1;
                } catch(e) {
                    msg.channel.send("Error: Chain war creation failed.");
                    logger.error('Error %s: %s.', e, e.stack);
                }
            }
	    }
    },
    "join": {
        name: "join",
        description: "Joins war/sprint with ID <id>",
        usage: "<id>",
	    process: function(client,msg,suffix) {
            var challengeID = suffix;
            if (isNaN(challengeID)) {
                msg.channel.send("Challenge ID must be an integer.");
            } else if (challengeID < 1) {
                msg.channel.send("Challenge ID must be an integer.");
            } else if (challengeID in functions.challengeList) {
                if(msg.author.id in functions.challengeList[challengeID]
                    .joinedUsers) {
                    msg.channel.send(msg.author + ", you already have"
                    + " notifications enabled for this challenge.");
                } else {
                    functions.challengeList[challengeID].joinedUsers
                        [msg.author.id] = {"userData": msg.author,
                        "countData": undefined, "countType": undefined};
                    try {
                        if (!(msg.channel.id in functions.challengeList[challengeID]
                            .hookedChannels)) {
                            functions.challengeList[challengeID].hookedChannels
                                .push(msg.channel.id);
                        }
                    } catch(e) {
                        msg.channel.send("Error: " + e);
                    }
                    msg.channel.send(msg.author + ", you have joined "
                        + functions.challengeList[challengeID].displayName);
                        conn.collection('challengeDB').update(
                            {_id: challengeID},
                            {joinedUsers: functions.challengeList[challengeID]
                                .joinedUsers},
                            {upsert: false}
                        )
                }
            } else {
                msg.channel.send("Challenge " + challengeID
                    + " does not exist!");
            }
	    }
    },
    "leave": {
        name: "leave",
        description: "Leaves war/sprint with ID <id>",
        usage: "<id>",
	    process: function(client,msg,suffix) {
            var challengeID = suffix;
            if (isNaN(challengeID)) {
                msg.channel.send("Challenge ID must be an integer.");
            } else if (challengeID < 1) {
                msg.channel.send("Challenge ID must be an integer.");
            } else if (challengeID in functions.challengeList) {
                if(msg.author.id in functions.challengeList[challengeID]
                    .joinedUsers) {
                    delete functions.challengeList[challengeID]
                        .joinedUsers[msg.author.id];
                    msg.channel.send(msg.author + ", you have left "
                        + functions.challengeList[challengeID].displayName);
                    conn.collection('challengeDB').update(
                        {_id: challengeID},
                        {joinedUsers: functions.challengeList[challengeID]
                            .joinedUsers},
                        {upsert: false}
                    )
                } else {
                    msg.channel.send(msg.author
                        + ", you have not yet joined this challenge.");
                }
            } else {
                msg.channel.send("Challenge " + challengeID
                    + " does not exist!");
            }
	    }
    },
    "exterminate": {
        name: "exterminate",
        description: "Ends war/sprint with ID <id>."
            + " Can only be performed by creator.",
        usage: "<id>",
	    process: function(client,msg,suffix) {
            var challengeID = suffix;
            if (isNaN(challengeID) || challengeID < 1) {
                msg.channel.send("Challenge ID must be an integer.");
            } else if (challengeID in functions.challengeList) {
                var exName = functions.challengeList[challengeID].displayName;
                if(functions.challengeList[challengeID].creator == msg.author.id) {
                    conn.collection('challengeDB').remove(
                        {_id: Number(challengeID)}
                    );
                    delete functions.challengeList[challengeID];
                    msg.channel.send(exName + " has been successfully"
                        + " exterminated.");
                    
                } else {
                    msg.channel.send("Only the creator of " + exName
                        + " can end this challenge.");
                }
            } else {
                msg.channel.send("Challenge " + challengeID
                    + " does not exist!");
            }
	    }
    },
    "total": {
        name: "total",
        description: "Adds your <total> for completed challenge <id>,"
            + " optional [pages|lines]",
        usage: "<id> <total> [pages|lines]",
        process: function(client,msg,suffix) {
            var args = suffix.split(" ");
            var challengeID = args.shift();
            var wordsWritten = args.shift();
            var writtenType = args.shift();
            if (!(writtenType == 'lines' || writtenType == 'pages'
                || writtenType == 'words' || writtenType === undefined)) {
                msg.channel.send("Invalid input.  You must work in words,"
                    + " lines, or pages.");
            } else {
                if (writtenType === undefined) {
                    writtenType = 'words';
                }
                if (challengeID in functions.challengeList) {
                    if (functions.challengeList[challengeID].state >= 2) {
                        if(Number.isInteger(Number(wordsWritten))){
                            var joinCheck = false;
                            for(user in functions.challengeList[challengeID]
                                .joinedUsers) {
                                if(functions.challengeList[challengeID].joinedUsers[user]
                                    .userData.id == msg.author.id) {
                                    if(!(functions.challengeList[challengeID]
                                        .joinedUsers[user]
                                        .countData === undefined)) {
                                        joinCheck = true;
                                    }
                                    functions.challengeList[challengeID].joinedUsers[user]
                                        .countData = wordsWritten;
                                    functions.challengeList[challengeID].joinedUsers[user]
                                        .countType = writtenType;
                                }
                            }
                            if (!joinCheck) {
                                functions.raptor(msg.guild.id, msg.channel, msg.author,
                                    constants.WAR_RAPTOR_CHANCE);
                                functions.challengeList[challengeID].joinedUsers
                                    [msg.author.id] = {"userData": msg.author,
                                    "countData": wordsWritten,
                                    "countType": writtenType};
                            }
                            msg.channel.send("Total added to summary.");
                        } else {
                            msg.channel.send(msg.author + ", I need a whole"
                                + " number to include in the summary!");
                        }
                    } else {
                        msg.channel.send("This challenge has not ended yet!");
                    }
                } else {
                    msg.channel.send("This challenge does not exist!");
                }
            }
        }
    },
    "summary": {
        name: "summary",
        description: "Shows the summary for completed challenge <id>",
        usage: "<id>",
        process: function(client,msg,suffix) {
            functions.generateSummary(msg.channel, suffix);
        }
    },
    "list": {
        name: "list",
        description: "Lists all running sprints/wars",
        usage: "",
        process: function(client,msg,suffix) {
            if(Object.keys(functions.challengeList).length == 0) {
                msg.channel.send("There are no challenges running."
                    + " Why don't you start one?");
            } else {
                if(Object.keys(functions.challengeList).length == 1) {
                    var timerInfo = "There is " + Object.keys(functions
                        .challengeList).length + " challenge running:\n";
                } else {
                    var timerInfo = "There are " + Object.keys(functions
                        .challengeList).length + " challenges running:\n";
                }
                for(var i in functions.challengeList) {
                    //find originating server name
                    var parentChannel = client.channels.get(functions
                        .challengeList[i].channelID);
                    var parentGuild = parentChannel.guild;
                    var parentGuildName = parentGuild.name;
                    switch(functions.challengeList[i].state){
                        case 0:
                            var timeout = "";
                            if ((functions.challengeList[i].cStart % 60) < 10) {
                                timeout = "0" + (functions.challengeList[i]
                                    .cStart % 60).toString();
                            } else {
                                timeout = functions.challengeList[i].cStart
                                    % 60;
                            }
                            timerInfo += i + ": " + functions.challengeList[i]
                                .displayName + " (";
                            if (functions.challengeList[i].type == "sprint") {
                                timerInfo += functions.challengeList[i].goal
                                + " words, ";
                            }
                            timerInfo += functions.challengeList[i].duration
                                + " minutes, starts in "
                                + Math.floor(functions.challengeList[i].cStart
                                / 60) + ":" + timeout + "), " + parentGuildName
                                + "\n";
                            break;
                        case 1:
                            var timeout = "";
                            if ((functions.challengeList[i].cDur % 60) < 10) {
                                timeout = "0" + (functions.challengeList[i]
                                    .cDur % 60).toString();
                            } else {
                                timeout = functions.challengeList[i].cDur % 60;
                            }
                            timerInfo += i + ": " + functions.challengeList[i]
                                .displayName +  " (";
                            if (functions.challengeList[i].type == "sprint") {
                                timerInfo += functions.challengeList[i].goal
                                + " words, ";
                            }
                            timerInfo += functions.challengeList[i].duration
                                + " minutes, "
                                + Math.floor(functions.challengeList[i].cDur
                                / 60) + ":" + timeout + " remaining), "
                                + parentGuildName + "\n";
                            break;
                        case 2:
                        case 3:
                            timerInfo += i + ": " + functions.challengeList[i]
                                .displayName +  " (";
                            if (functions.challengeList[i].type == "sprint") {
                                timerInfo += functions.challengeList[i].goal
                                + " words, ";
                            }
                            timerInfo += functions.challengeList[i].duration
                            + " minutes, ended), " + parentGuildName + "\n";
                            break;
                        default:
                            break;
                    }
                }
                msg.channel.send(timerInfo);
            }
        }
    },
    "timezone": {
        name: "timezone",
        description: "Sets your <IANA timezone identifier>",
        usage: "<IANA timezone identifier>",
        type: "goals",
		process: async function(client,msg,suffix) {
            var timezone = suffix;
            var dateCheck = new timezoneJS.Date();
            try{
                //check to see if timezone is in IANA library
                dateCheck.setTimezone(timezone)
                //create new role if needed, find role ID
                if (msg.guild.roles.find("name", timezone) === null){
                    await msg.guild.createRole({name: timezone});
                }
                var tzRole = msg.guild.roles.find("name", timezone);
                //get timezone
                currentRoleList = msg.member.roles.filter(function (a) {
                    return regionRegex.test(a.name);
                });
                msg.member.removeRoles(currentRoleList);
                //add user to role, confirm
                msg.member.addRole(tzRole);
                msg.channel.send(msg.author + ", you have set your timezone to"
                    + " **" + timezone + "**.");
            } catch(e) {
                if (e.code == 'ENOENT') {
                    await msg.channel.send('Fatal error. Please contact your'
                        + ' server admin.');
                    await logger.error('Fatal error %s: %s.  Winnie_Bot cannot'
                        + ' locate required files.\nWinnie_Bot will now'
                        + ' terminate.')
                    process.exit(1);
                } else {
                    msg.channel.send("Winnie_Bot accepts IANA timezone"
                    + " identifiers only.")
                }
            }
	    }
    },
    "set": {
        name: "set",
        description: "Sets a daily goal <goal>, with optional"
            + " [lines|pages|minutes]",
        usage: "<goal> [lines|pages|minutes]",
        type: "goals",
		process: function(client,msg,suffix) {
            var args = suffix.split(" ");
            var goal = args.shift();
            var goalType = args.shift();
            if (goal === undefined) {
                msg.channel.send("I need a goal to set!")
            } else if(!Number.isInteger(Number(goal))){
                msg.channel.send("Your goal must be a whole"
                    + " number.")
            } else if((msg.author.id in functions.goalList)) {
                msg.channel.send(msg.author + ", you have already set a goal"
                    + " today. Use !update to record your progress.");
            } else {
                if (!(goalType == 'lines' || goalType == 'pages' ||
                    goalType == 'minutes' || goalType == 'words' ||
                    goalType === undefined)) {
                    msg.channel.send("Goal type must be lines, pages, or"
                        + " minutes.");
                } else {
                    if (goalType === undefined) {
                        goalType = 'words';

                    }
                    try {
                        //get timezone
                        var tzRole = msg.member.roles.filter(function (a) {
                            return regionRegex.test(a.name);
                        });
                        var userTZ = tzRole.first().name;
                        logger.info(userTZ);
                        //get current time
                        var startTime = new timezoneJS.Date();
                        startTime.setTimezone(userTZ);
                        //calculate next midnight based on timezone
                        var endTime = new timezoneJS.Date();
                        endTime.setTimezone(userTZ);
                        endTime.setHours(24,0,0,0);
                        functions.goalList[msg.author.id] = new classes.Goal(msg.author.id,
                            goal, goalType, 0, startTime.getTime(),
                            endTime.getTime(), msg.channel.id);
                        msg.channel.send(msg.author + ", your goal for today is **"
                            + goal + "** " + goalType + ".");
                    } catch(e) {
                        msg.channel.send(msg.author + ", you need to set your"
                            + " timezone before setting a daily goal."
                            + " Use the !timezone command to do so.");
                    }
                }
            }
	    }
    },
    "update": {
        name: "update",
        description: "Updates your daily goal with the number of <things>"
            + " you have completed since your last update",
        usage: "<things>",
        type: "goals",
		process: function(client,msg,suffix) {
            var goal = suffix;
            if(!Number.isInteger(Number(goal))){
                msg.channel.send("Invalid input. Your goal must be a whole"
                    + " number.")
            } else if(!(msg.author.id in functions.goalList)) {
                msg.channel.send(msg.author + ", you have not yet set a goal"
                    + " for today. Use !set to do so.");
            } else {
                functions.goalList[msg.author.id].addWords(goal, 0);
                msg.channel.send(msg.author + ", you have written **"
                    + functions.goalList[msg.author.id].written + "** "
                    + functions.goalList[msg.author.id].goalType + " of your **"
                    + functions.goalList[msg.author.id].goal + "**-"
                    + functions.goalList[msg.author.id].goalType.slice(0, -1) + " goal.");
            }
	    }
    },
    "progress": {
        name: "progress",
        description: "Updates your daily goal with the total number of <things>"
            + " you have completed today",
        usage: "<things>",
        type: "goals",
		process: function(client,msg,suffix) {
	    	var goal = suffix;
            if(!Number.isInteger(Number(goal))){
                msg.channel.send("Invalid input. Your goal must be a whole"
                    + " number.")
            } else if(!(msg.author.id in functions.goalList)) {
                msg.channel.send(msg.author + ", you have not yet set a goal"
                    + " for today. Use !set to do so.");
            } else {
                functions.goalList[msg.author.id].addWords(goal, 1);
                msg.channel.send(msg.author + ", you have written **"
                    + functions.goalList[msg.author.id].written + "** "
                    + functions.goalList[msg.author.id].goalType + " of your **"
                    + functions.goalList[msg.author.id].goal + "**-"
                    + functions.goalList[msg.author.id].goalType.slice(0, -1) + " goal.");
            }
	    }
    },
    "reset": {
        name: "reset",
        description: "Resets your daily goal",
        type: "goals",
		process: function(client,msg,suffix) {
            if(!(msg.author.id in functions.goalList)) {
                msg.channel.send(msg.author + ", you have not yet set a goal"
                    + " for today. Use !set to do so.");
            } else {
                conn.collection('goalDB').remove(
                    {authorID: msg.author.id}
                );
                delete functions.goalList[msg.author.id];

                msg.channel.send(msg.author + ", you have successfully reset"
                    + " your daily goal.");
            }
	    }
    },
    "goalinfo": {
        name: "goalinfo",
        description: "Displays progress towards your daily goal",
        type: "goals",
		process: function(client,msg,suffix) {
            if(!(msg.author.id in functions.goalList)) {
                msg.channel.send(msg.author + ", you have not yet set a goal"
                    + " for today. Use !set to do so.");
            } else {
                msg.channel.send(msg.author + ", you have written **"
                    + functions.goalList[msg.author.id].written + "** "
                    + functions.goalList[msg.author.id].goalType + " of your **"
                    + functions.goalList[msg.author.id].goal + "**-"
                    + functions.goalList[msg.author.id].goalType.slice(0, -1) + " goal.");
            }
		}
    },
    "target": {
        name: "target",
        description: "Generates an <easy/average/hard> target for"
            + " <time> minutes",
        usage: "<easy/average/hard> <time>",
        type: "other",
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
        type: "other",
		process: function(client,msg,suffix) {
            var choiceID = (Math.floor(Math.random() * constants
                .PROMPT_LIST.length))
            msg.channel.send(msg.author + ", your prompt is: **"
                + constants.PROMPT_LIST[choiceID].trim() + "**");
		}
    },
    "roll": {
        name: "roll",
        description: "Rolls a die",
        usage: "<x> [y], <x>d<y>",
        type: "other",
		process: function(client,msg,suffix) {
            var faces = suffix.split(" ");
            if (faces.length == 1) {
                if(Number.isInteger(Number(faces[0]))) {
                    msg.channel.send("You rolled " + (Math.floor
                        (Math.random() * faces[0]) + 1));
                } else {
                    if(true) {
                        var diceType = faces[0].split("d");
                        if (diceType.length == 2) {
                            if(Number.isInteger(Number(diceType[0]))
                                && Number.isInteger(Number(diceType[1]))) {
                                if(diceType[0] > 20) {
                                    msg.channel.send("ERROR. TOO BIG.");
                                } else {
                                    var diceSum = 0;
                                    var diceString = "";
                                    for (i = 0; i < Number(diceType[0]); i++){
                                        var roll = (Math.floor(Math.random()
                                            * diceType[1]) + 1)
                                        diceString += roll;
                                        if (i != Number(diceType[0])-1)
                                        {
                                            diceString += ", ";
                                        }
                                        diceSum += roll;
                                    }
                                    msg.channel.send(diceString);
                                    msg.channel.send("Total = " + diceSum);
                                }
                            } else {
                                msg.channel.send("Invalid input. Face count"
                                    + " must be a whole number.");
                            }
                        } else {
                            msg.channel.send("Invalid input. Face count must"
                                + " be a whole number.");
                        }
                    } else {
                        msg.channel.send("Invalid input. Face count must be a"
                            + " whole number.");
                    }  
                }
            } else if (faces.length == 2) {
                if(Number.isInteger(Number(faces[0])) && Number.isInteger(
                    Number(faces[1]))){
                    if(Number(faces[0]) < Number(faces[1])){
                        msg.channel.send("You rolled " + (Math.floor(
                            Math.random() * (1 + Number(faces[1])
                            - Number(faces[0])) + Number(faces[0]))));
                    }
                    else {
                        msg.channel.send("Invalid input. First number must be"
                            + " less than second number.");
                    }
                    
                } else {
                    msg.channel.send("Invalid input. Face count must be a whole"
                        + " number.");
                }
            } else {
                msg.channel.send("Invalid input. Face count must be a whole"
                    + " number.");
            }
		}
    },
    "choose": {
        name: "choose",
        description: "Selects an item from a list <list> of items,"
            + " separated by commas",
        usage: "<list>",
        type: "other",
		process: function(client,msg,suffix) {
            var items = suffix.split(",");
            var choiceID = (Math.floor(Math.random() * items.length))
            msg.channel.send(msg.author + ", from " + suffix + ", I selected **"
                + items[choiceID].trim() + "**");
		}
    },
    "raptors": {
        name: "raptors",
        description: "Displays raptor statistics.",
        type: "other",
		process: function(client,msg,suffix) {
				var raptorMsg = "__**Raptor Statistics:**__\n";
				for (server in functions.raptorCount) {
					raptorMsg += "\n__*" + client.guilds.get(server) + ":*__ "
						+ functions.raptorCount[server];
				}
            msg.channel.send(raptorMsg);
		}
    }
}

client.on('message', (msg) => {
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
                    if(suffix == "challenges"){

                    } else if(suffix == "goals"){

                    } else if(suffix == "other"){

                    } else {
                        msg.channel.send("That command does not exist.");
                    }
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
                logger.error('Error %s: %s.', e, e.stack);
			}
		} else {
            msg.channel.send(cmdData + " is not a valid command."
             + " Type !help for a list of commands.");
		}
	} else {
		return
    }
});

process.on('uncaughtException', function(e) {
    logger.error('Error %s: %s.\nWinnie_Bot will now attempt'
        + ' to reconnect.', e, e.stack);
    try {
        client.login(config.token);
        fileSystemCheck();
    } catch (e) {
        logger.error('Reconnection failed.\nWinnie_Bot will now terminate.');
        process.exit(1);
    }
  })

client.login(config.token);