const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');
const logger = require('./logger.js');
const gameloop = require('node-gameloop');
const timezoneJS = require('timezone-js');
const mongoose = require('mongoose')
const CMD_PREFIX = '!';
const WAR_RAPTOR_CHANCE = 10;
const durationAfterChallenge = 600;
const promptList = ["One of your characters receives an anonymous gift.",
    "Your character invites someone they don’t like over for dinner.",
    "A character is scared that someone will find out about something they did.",
    "Your character goes to the other side of town for a day.",
    "Two characters get into a heated argument about work.",
    "A character suddenly has to travel a long distance.",
    "Your character makes a new friend in an unexpected place.",
    "Your characters get dressed up.",
    "One of your characters isn’t who they claim to be.",
    "Your character is presented with a meal they don’t like.",
    "The scenery suddenly changes.",
    "An inanimate object moves.",
    "Your character turns off the music.",
    "Two things are unexpectedly related.",
    "The lights go out.",
    "Choose an object you can see; write it into your story.",
    "Today’s headlines make an announcement that is important to your character.",
    "Your character tries something wild.",
    "A character tells a lie.",
    "The right thing is there for your character, but at the wrong time.",
    "Your character has a skill that has not been mentioned before.",
    "A character breaks a rule.",
    "A character is late.",
    "Someone is injured.",
    "Mars is bright tonight.",
    "Something doesn’t work as it’s supposed to.",
    "A character loses something, but then finds or gets it back.",
    "A character changes careers.",
    "Start and end a paragraph with the same sentence, but different meanings.",
    "A character goes for a walk and discovers something strange.",
    "A character gets into a fight.",
    "Something has gone horribly wrong.",
    "A character misses something important.",
    "A character leaves their comfort zone.",
    "A character loses someone.",
    "A character passes out.",
    "A character hallucinates.",
    "A character leaves home for the last time.",
    "Someone is searching for something.",
    "A character forgets something important.",
    "A character is angry at someone they feel is more powerful than them.",
    "It starts to rain.",
    "Someone unexpected arrives.",
    "A character notices someone watching them.",
    "A crowd has gathered.",
    "Something has a dual function.",
    "The only useful thing is in the corner."];

timezoneJS.timezone.zoneFileBasePath = 'node_modules/timezone-js/tz';
timezoneJS.timezone.init();

var conn = mongoose.connection;
var timerID = 1;
var challengeList = {};
var goalList = {};
var raptorCount = {};

const tickTimer = gameloop.setGameLoop(async function(delta) {
    for (var item in challengeList){
        challengeList[item].update();
    }
    for (var item in goalList){
        goalList[item].update();
    }
}, 1000);

client.on('ready', () => {
    logger.info('Winnie_Bot is online');
    // Connect to the database
    mongoose.connect(config.storageUrl, { useNewUrlParser: true }, function (e, db) {
        if(e) throw e;
        logger.info("Database created!");
        conn.collection('timer').find(
            {}, function(e, t) {
                t.forEach(function(tx) {
                    timerID = tx.data;
                });
            }
        )
        // conn.collection('challengeTest8').find(
        //     {}, function(e, challenges) {
        //         challenges.forEach(function(challenge) {
        //             if(challenge.type == "chainwar") {
        //                 var start = challenge.startTime + challenge
        //                 challengeList[challenge._id] = new ChainWar(challenge._id,
        //                 challenge.creator, challenge.name, challenge.startTime,
        //                 challenge.chainWarCount, challenge.duration,
        //                 challenge.timeBetweenWars, challenge.channel);
        //             } else if(challenge.type == "sprint") {
        //                 challengeList[challenge._id] = new Sprint(challenge._id,
        //                 challenge.creator, challenge.name, challenge.startTime,
        //                 currentCountdown, challenge.goal, currentDuration,
        //                 challenge.channel, currentState);
        //             } else if(challenge.type == "war") {
        //                 challengeList[challenge._id] = new War(challenge._id,
        //                 challenge.creator, challenge.name, challenge.startTime,
        //                 currentCountdown, currentDuration, challenge.channel,
        //                 currentState);
        //             }
        //         });
        //     }
        // );
        conn.collection('goalDB').find(
            {}, function(e, goals) {
                goals.forEach(function(goal) {
                    goalList[goal.authorID] = new Goal(goal.authorID,
                        goal.goal, goal.goalType, goal.written,
                        goal.startTime, goal.terminationTime,
                        goal.channelID);
                });
            }
        );
        conn.collection('raptorDB').find(
            {}, function(e, guilds) {
                guilds.forEach(function(guild) {
                    raptorCount[guild.server] = guild.count;
                });
            }
        );
    });
});

function raptor (server, channel, author, raptorChance) {
    if (!(server.id in raptorCount)) {
        raptorCount[server.id] = 0;
    }
    var raptorRoll = (Math.random() * 100);
	if (raptorRoll < raptorChance) {
        raptorCount[server.id] += 1;
        conn.collection('raptorDB').update(
            {},
            {"server": server.id, "count": raptorCount[server.id]},
            {upsert: true}
        )
		channel.send(author + ", you have hatched a raptor! Your server currently"
		+ " houses " + raptorCount[server.id] + " raptors.");
	}
}

class Sprint {
    constructor(objectID, creator, displayName, startTime, countdown, goal, timeout, channel) {
        this.objectID = objectID;
        this.creator = creator;
        this.displayName = displayName;
        this.startTime = startTime;
        this.countdown = countdown;
        this.goal = goal;
        this.duration = timeout;
        this.channelID = channel;
        this.channel = client.channels.get(this.channelID);
        this.joinedUsers = {};
        this.state = 0;

        this.cStart = this.countdown * 60;
        this.cDur = this.duration * 60;
        this.cPost = durationAfterChallenge;

        if(this.countdown == 1) {
            this.channel.send("Your sprint, " + this.displayName
                + " (ID " + this.objectID + "), starts in " + this.countdown
                + " minute.");
        } else {
            this.channel.send("Your sprint, " + this.displayName
                + " (ID " + this.objectID + "), starts in " + this.countdown
                + " minutes.");
        }

        var challengeData = {
            "_id": this.objectID,
            "creator": this.creator,
            "name": this.displayName,
            "startTime": this.startTime,
            "countdown": this.countdown,
            "goal": this.goal,
            "duration": this.duration,
            "channel": this.channelID,
            "joinedUsers": this.joinedUsers,
            "state": this.state,
            "type": "sprint"
        };
        var array = [challengeData];

        conn.collection('challengeTest8').insert(
            array, {}, function(e, docs) {}
        );

    }

    update() {
        switch(this.state){
            case 0:
                this.start();
                break;
            case 1:
                this.end();
                break;
            case 2:
                this.terminate();
                break;
            default:
                this.channel.send("Error: Invalid state reached.");
                delete challengeList[this.objectID];
                break;
        }
    }

    start() {
        if (this.cStart > 0) {
            this.cStart--;
        }
        if(this.cStart == 0) {
            var userList = "";
            for(var user in this.joinedUsers) {
                userList += " " + this.joinedUsers[user].userData;
            }
            this.channel.send(this.displayName + " starts now! Race to "
                + this.goal + " words!" + userList);
            this.state = 1
        } else if(this.cStart == 60) {
            this.channel.send(this.displayName + " starts in 1 minute.");
        } else if(this.cStart % 60 == 0) {
            this.channel.send(this.displayName + " starts in "
                + this.cStart / 60 + " minutes.");
        } else if(this.cStart < 60 && this.cStart % 15 == 0) {
            this.channel.send(this.displayName + " starts in "
                + this.cStart + " seconds.");
        }
    }
    end() {
        this.cDur--;
        if(this.cDur <= 0) {
            var userList = "";
            for(var user in this.joinedUsers) {
                userList += " " + this.joinedUsers[user].userData;
            }
            this.channel.send(this.displayName
                + " has timed out. Post your total to be "
                + "included in the summary." + userList);
            this.state = 2;
        } else if(this.cDur == 60) {
            this.channel.send("There is 1 minute remaining in "
                + this.displayName + ".");
        } else if(this.cDur % 300 == 0) {
            this.channel.send("There are " + this.cDur/60
                + " minutes remaining in " + this.displayName + ".");
        } else if(this.cDur < 60 && this.cDur % 15 == 0) {
            this.channel.send("There are " + this.cDur
                + " seconds remaining in " + this.displayName + ".");
        }
    }
    terminate() {
        this.cPost--;
        if(this.cPost == 0) {
            conn.collection('challengeTest8').remove(
                {_id: this.objectID}
            );
            delete challengeList[this.objectID];
        }
    }
}

class War{
    constructor(objectID, creator, displayName, startTime, countdown, duration, channel) {
        this.objectID = objectID;
        this.creator = creator;
        this.displayName = displayName;
        this.startTime = startTime;
        this.countdown = countdown;
        this.duration = duration;
        this.channelID = channel
        this.channel = client.channels.get(this.channelID);
        this.joinedUsers = {};
        this.state = 0;

        this.cStart = this.countdown * 60;
        this.cDur = this.duration * 60;
        this.cPost = durationAfterChallenge;

        if(this.countdown == 1) {
            this.channel.send("Your war, " + this.displayName
                + " (ID " + this.objectID + "), starts in "
                + this.countdown + " minute.");
        } else {
            this.channel.send("Your war, " + this.displayName
                + " (ID " + this.objectID + "), starts in "
                + this.countdown + " minutes.");
        }

        var challengeData = {
            "_id": this.objectID,
            "creator": this.creator,
            "name": this.displayName,
            "startTime": this.startTime,
            "countdown": this.countdown,
            "duration": this.duration,
            "channel": this.channelID,
            "joinedUsers": this.joinedUsers,
            "state": this.state,
            "type": "war"
        };
        var array = [challengeData];

        conn.collection('challengeTest8').insert(
            array, {}, function(e, docs) {}
        );
    }

    update() {
        switch(this.state){
            case 0:
                this.start();
                break;
            case 1:
                this.end();
                break;
            case 2:
                this.terminate();
                break;
            default:
                this.channel.send("Error: Invalid state reached.");
                conn.collection('challengeTest8').remove(
                    {_id: this.objectID}
                );
                delete challengeList[objectID];
                break;
        }
    }

    start() {
        logger.info('entered start');
        if (this.cStart > 0) {
            logger.info('entered if');
            this.cStart--;
        }
        if(this.cStart <= 0) {
            logger.info('entered handler');
            var userList = "";
            for(var user in this.joinedUsers) {
                userList += " " + this.joinedUsers[user].userData;
            }
            this.channel.send(this.displayName + " starts now!" + userList);
            this.state = 1
            logger.info(this.state);
        } else if(this.cStart == 60) {
            this.channel.send(this.displayName + " starts in 1 minute.");
        } else if(this.cStart % 60 == 0) {
            this.channel.send(this.displayName + " starts in "
                + this.cStart / 60 + " minutes.");
        } else if(this.cStart < 60 && this.cStart % 15 == 0) {
            this.channel.send(this.displayName + " starts in "
                + this.cStart + " seconds.");
        }
    }
    end() {
        this.cDur--;
        if(this.cDur == 0) {
            var userList = "";
            for(var user in this.joinedUsers) {
                userList += " " + this.joinedUsers[user].userData;
            }
            this.channel.send(this.displayName + " (ID "
                + this.objectID + ") has ended!"
                + " Post your total to be included in the summary."
                + userList);
            this.state = 2;
        } else if(this.cDur == 60) {
            this.channel.send("There is 1 minute remaining in "
                + this.displayName + ".");
        } else if(this.cDur % 300 == 0) {
            this.channel.send("There are " + this.cDur/60
                + " minutes remaining in " + this.displayName + ".");
        } else if(this.cDur < 60 && this.cDur % 15 == 0) {
            this.channel.send("There are " + this.cDur
                + " seconds remaining in " + this.displayName + ".");
        }
    }
    terminate() {
        this.cPost--;
        if(this.cPost <= 0) {
            conn.collection('challengeTest8').remove(
                {_id: this.objectID}
            );
            delete challengeList[this.objectID];
        }
    }
}

class ChainWar{
    constructor(objectID, creator, displayName, startTime, chainWarCount, duration,
        timeBetweenWars, channel) {
        this.objectID = objectID;
        this.creator = creator;
        this.displayName = displayName;
        this.startTime = startTime;
        this.chainWarCount = chainWarCount;
        this.duration = duration;
        this.timeBetweenWars = timeBetweenWars;
        this.channelID = channel;
        this.channel = client.channels.get(this.channelID);
        logger.info(this.channel);
        this.joinedUsers = {};
        this.state = 0;

        this.completedWarCount = 0;
        this.cStart = this.timeBetweenWars * 60;
        this.cDur = this.duration * 60;
        this.cPost = durationAfterChallenge;

        if(this.countdown == 1) {
            this.channel.send("Your war, " + this.displayName
                + " (ID " + this.objectID + "), starts in "
                + this.countdown + " minute.");
        } else {
            this.channel.send("Your war, " + this.displayName
                + " (ID " + this.objectID + "), starts in "
                + this.countdown + " minutes.");
        }

        var challengeData = {
            "_id": this.objectID,
            "creator": this.creator,
            "name": this.displayName,
            "startTime": this.startTime,
            "chainWarCount": this.chainWarCount,
            "timeBetweenWars": this.timeBetweenWars,
            "duration": this.duration,
            "channel": this.channel,
            "joinedUsers": this.joinedUsers,
            "state": this.state,
            "type": "chainwar"
        };
        var array = [challengeData];

        conn.collection('challengeTest8').insert(
            array, {}, function(e, docs) {}
        );
    }

    update() {
        switch(this.state){
            case 0:
                this.start();
                break;
            case 1:
                this.end();
                break;
            case 2:
                this.terminate();
                break;
            case 3:
                this.interval();
                break
            default:
                this.channel.send("Error: Invalid state reached.");
                conn.collection('challengeTest8').remove(
                    {_id: this.objectID}
                );
                delete challengeList[objectID];
                break;
        }
    }

    start() {
        if (this.cStart > 0) {
            this.cStart--;
        }
        if(this.cStart <= 0) {
            var userList = "";
            for(var user in this.joinedUsers) {
                userList += " " + this.joinedUsers[user].userData;
            }
            this.channel.send(this.displayName + " starts now!" + userList);
            this.state = 1;
        } else if(this.cStart == 60) {
            this.channel.send(this.displayName + " starts in 1 minute.");
        } else if(this.cStart % 60 == 0) {
            this.channel.send(this.displayName + " starts in "
                + this.cStart / 60 + " minutes.");
        } else if(this.cStart < 60 && this.cStart % 15 == 0) {
            this.channel.send(this.displayName + " starts in "
                + this.cStart + " seconds.");
        }
    }
    end() {
        this.cDur--;
        if(this.cDur == 0) {
            var userList = "";
            for(var user in this.joinedUsers) {
                userList += " " + this.joinedUsers[user].userData;
            }
            this.channel.send(this.displayName + " (ID "
                + this.objectID + ") has ended!"
                + " Post your total to be included in the summary."
                + userList);
            this.completedWarCount++;
            if(this.completedWarCount < this.chainWarCount) {
                this.cStart = this.timeBetweenWars * 60;
                this.state = 3;
            } else {
                this.state = 2;
            }
        } else if(this.cDur == 60) {
            this.channel.send("There is 1 minute remaining in "
                + this.displayName + ".");
        } else if(this.cDur % 300 == 0) {
            this.channel.send("There are " + this.cDur/60
                + " minutes remaining in " + this.displayName + ".");
        } else if(this.cDur < 60 && this.cDur % 15 == 0) {
            this.channel.send("There are " + this.cDur
                + " seconds remaining in " + this.displayName + ".");
        }
    }
    interval() {
        if (this.cStart > 0) {
            this.cStart--;
        }
        if(this.cStart <= 0) {
            var userList = "";
            for(var user in this.joinedUsers) {
                userList += " " + this.joinedUsers[user].userData;
            }
            this.channel.send(this.displayName + " starts now!" + userList);
            this.state = 1;
        } else if(this.cStart == 60) {
            this.channel.send(this.displayName + " starts in 1 minute.");
        } else if(this.cStart % 60 == 0) {
            this.channel.send(this.displayName + " starts in "
                + this.cStart / 60 + " minutes.");
        } else if(this.cStart < 60 && this.cStart % 15 == 0) {
            this.channel.send(this.displayName + " starts in "
                + this.cStart + " seconds.");
        }
    }
    terminate() {
        this.cPost--;
        if(this.cPost == 0) {
            conn.collection('challengeTest8').remove(
                {_id: this.objectID}
            );
            delete challengeList[this.objectID];
        }
    }

}

class Goal {
    constructor(authorID, goal, goalType, written, startTime, terminationTime, channelID) {
        this.authorID =  authorID;
        this.goal = goal;
        this.goalType = goalType;
        this.written = written;
        this.startTime = startTime;
        this.terminationTime = terminationTime;
        this.channelID = channelID;
        this.channel = client.channels.get(this.channelID);

        var goalData = {
            "authorID": this.authorID,
            "goal": this.goal,
            "goalType": this.goalType,
            "written": this.written,
            "startTime": this.startTime,
            "terminationTime": this.terminationTime,
            "channelID": this.channelID
        };

        conn.collection('goalDB').update(
            {authorID: this.authorID},
            goalData,
            {upsert: true}
        )
    }

    update() {
        if(new timezoneJS.Date() >= this.terminationTime) {
            var raptorPct = ((this.written / this.goal) * 100);
            raptor(this.channel.guild, this.channel, this.authorID, raptorPct);
            conn.collection('goalDB').remove(
                {authorID: this.authorID}
            );
            delete goalList[this.authorID];
            logger.info("Deleting goal of " +  client.users.get(this.authorID));
        }
    }

    addWords(wordNumber, type) {
        switch(type){
            case 0:
                this.written += parseInt(wordNumber);
                break;
            case 1:
                this.written = parseInt(wordNumber);
                break;
        }
        conn.collection('goalDB').update(
            {"authorID": this.authorID},
            {$set: {"written": this.written}},
            {upsert: false},
            function(err){}
        )
    }
}

var cmd_list = {
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
            var sprint_name = args.join(' ');
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
                    if(sprint_name == '') {
                        sprint_name = msg.author.username + "'s sprint";
                    }
                    challengeList[timerID] = new Sprint(timerID, creatorID,
                        sprint_name, start, words, timeout, msg.channel.id, 0);
                    conn.collection('timer').update(
                        {data: timerID},
                        {data: (timerID+1)},
                        {upsert: true}
                    )
                    timerID = timerID + 1;
                } catch(e) {
                    msg.channel.send("Error: Sprint creation failed.");
                    logger.info('Error %s: %s.', e, e.stack);
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
            var war_name = args.join(' ');
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
                    if(war_name == '') {
                        war_name = msg.author.username + "'s war";
                    }
                    var startTime = new Date().getTime();
                    challengeList[timerID] = new War(timerID, creatorID,
                        war_name, startTime, start, duration, msg.channel.id, 0);
                    conn.collection('timer').update(
                        {data: timerID},
                        {data: (timerID+1)},
                        {upsert: true}
                    )
                    timerID = timerID + 1;
                } catch(e) {
                    msg.channel.send("Error: War creation failed.");
                    logger.info('Error %s: %s.', e, e.stack);
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
            var war_name = args.join(' ');
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
                    if(war_name == '') {
                        war_name = msg.author.username + "'s war";
                    }
                    challengeList[timerID] = new ChainWar(timerID, creatorID,
                        war_name, chainWarCount, duration, timeBetween,
                        msg.channel.id, 0);
                    conn.collection('timer').update(
                        {data: timerID},
                        {data: (timerID+1)},
                        {upsert: true}
                    )
                    timerID = timerID + 1;
                } catch(e) {
                    msg.channel.send("Error: Chain war creation failed.");
                    logger.info('Error %s: %s.', e, e.stack);
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
            } else if (challengeID in challengeList) {
                if(msg.author.id in challengeList[challengeID].joinedUsers) {
                    msg.channel.send(msg.author + ", you already have "
                    + "notifications enabled for this challenge.");
                } else {
                    challengeList[challengeID].joinedUsers[msg.author.id]
                        = {"userData": msg.author, "countData": undefined,
                        "countType": undefined};
                    msg.channel.send(msg.author + ", you have joined "
                        + challengeList[challengeID].displayName);
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
            } else if (challengeID in challengeList) {
                if(msg.author.id in challengeList[challengeID].joinedUsers) {
                    delete challengeList[challengeID]
                        .joinedUsers[msg.author.id];
                    msg.channel.send(msg.author + ", you have left "
                        + challengeList[challengeID].displayName);
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
            logger.info(challengeID);
            if (isNaN(challengeID) || challengeID < 1) {
                msg.channel.send("Challenge ID must be an integer.");
            } else if (challengeID in challengeList) {
                var exName = challengeList[challengeID].displayName;
                if(challengeList[challengeID].creator == msg.author.id) {
                    logger.info(challengeID);
                    conn.collection('challengeTest8').remove(
                        {_id: Number(challengeID)}
                    );
                    delete challengeList[challengeID];
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
                || writtenType == 'minutes' || writtenType == 'words'
                || writtenType === undefined)) {
                msg.channel.send("Invalid input.  You must work in words,"
                    + " lines, pages, or minutes.");
            } else {
                if (writtenType === undefined) {
                    writtenType = 'words';
                }
                if (challengeID in challengeList) {
                    if (challengeList[challengeID].state == 2) {
                        if(Number.isInteger(Number(wordsWritten))){
                            var joinCheck = false;
                            for(user in challengeList[challengeID].joinedUsers) {
                                if(challengeList[challengeID].joinedUsers[user]
                                    .userData.id == msg.author.id) {
                                    if(!(challengeList[challengeID].joinedUsers[user]
                                        .countData === undefined)) {
                                        joinCheck = true;
                                    }
                                    challengeList[challengeID].joinedUsers[user]
                                        .countData = wordsWritten;
                                    challengeList[challengeID].joinedUsers[user]
                                        .countType = writtenType;
                                }
                            }
                            if (!joinCheck) {
                                raptor(msg.guild, msg.channel, msg.author, WAR_RAPTOR_CHANCE);
                                challengeList[challengeID].joinedUsers
                                    [msg.author.id] = {"userData": msg.author,
                                    "countData": wordsWritten,
                                    "countType": writtenType};
                            }
                            msg.channel.send("Total added to summary.");
                        } else {
                            msg.channel.send(msg.author + ", I need a whole number"
                                + " to include in the summary!");
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
            var challengeID = suffix;
            if (challengeID in challengeList) {
                if (challengeList[challengeID].state == 2) {
                    var userTotal = "";
                    var totalWords = 0;
                    var totalLines = 0;
                    var totalPages = 0;
                    for(var user in challengeList[challengeID].joinedUsers) {
                        if(Number.isInteger(Number(challengeList[challengeID]
                            .joinedUsers[user].countData)) && challengeList
                            [challengeID].joinedUsers[user].countType 
                            != undefined){
                            userTotal += "\n" + challengeList[challengeID].
                                joinedUsers[user].userData + ": **"
                                + challengeList[challengeID].joinedUsers[user]
                                .countData + "** " + challengeList[challengeID]
                                .joinedUsers[user].countType;
                            switch (challengeList[challengeID].
                                joinedUsers[user].countType) {
                                    case 'words':
                                        totalWords += parseInt(challengeList
                                            [challengeID].joinedUsers[user]
                                            .countData);
                                        break;
                                    case 'lines':
                                        totalLines += parseInt(challengeList
                                            [challengeID].joinedUsers[user]
                                            .countData);
                                        break; 
                                    case 'pages':
                                        totalPages += parseInt(challengeList
                                            [challengeID].joinedUsers[user]
                                            .countData);
                                        break;
                                    default:
                                        break;
                                }
                        }
                    }
                    totalWords += totalLines * 15;
                    totalWords += totalPages * 400;
                    var summaryData = "Statistics for " + challengeList
                        [challengeID].displayName + ":\n" + userTotal
                        + "\n\nTotal: **" + totalWords + "** words"
                    if (totalLines > 0 && totalPages > 0) {
                        summaryData += " (" + totalLines + " lines, "
                            + totalPages + " pages)";
                    } else if (totalLines > 0) {
                        summaryData += " (" + totalLines + " lines)";
                    } else if (totalPages > 0) {
                        summaryData += " (" + totalPages + " pages)";
                    }
                    msg.channel.send(summaryData);                    
                } else {
                    msg.channel.send("This challenge has not ended yet!");
                }
            } else {
                msg.channel.send("This challenge does not exist!");
            }
        }
    },
    "list": {
        name: "list",
        description: "Lists all running sprints/wars",
        usage: "",
        process: function(client,msg,suffix) {
            if(Object.keys(challengeList).length == 0) {
                msg.channel.send("There are no challenges running."
                    + " Why don't you start one?");
            } else {
                if(Object.keys(challengeList).length == 1) {
                    var timerInfo = "There is " + Object.keys(challengeList)
                        .length + " challenge running:\n";
                } else {
                    var timerInfo = "There are " + Object.keys(challengeList)
                        .length + " challenges running:\n";
                }
                for(var i in challengeList) {
                    switch(challengeList[i].state){
                        case 0:
                            var timeout = "";
                            if ((challengeList[i].cStart % 60) < 10) {
                                timeout = "0"
                                    + (challengeList[i].cStart % 60).toString();
                            } else {
                                timeout = challengeList[i].cStart % 60;
                            }
                            timerInfo += i + ": " + challengeList[i].displayName
                            timerInfo += " (" + challengeList[i].duration
                                + " minutes, starts in "
                                + Math.floor(challengeList[i].cStart / 60)
                                + ":" + timeout + ")\n";
                            break;
                        case 1:
                            var timeout = "";
                            if ((challengeList[i].cDur % 60) < 10) {
                                timeout = "0"
                                    + (challengeList[i].cDur % 60).toString();
                            } else {
                                timeout = challengeList[i].cDur % 60;
                            }
                            timerInfo += i + ": " + challengeList[i].displayName 
                            timerInfo += " (" + challengeList[i].duration
                                + " minutes, "
                                + Math.floor(challengeList[i].cDur / 60)
                                + ":" + timeout + " remaining)\n";
                            break;
                        case 2:
                            timerInfo += i + ": " + challengeList[i].displayName
                            timerInfo += " (" + challengeList[i].duration
                            + " minutes, ended)\n";
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
                regionRegex = /^(Africa|America|Antarctica|Asia|Atlantic|Australia|Europe|Indian|Pacific|Etc)/;
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
                    await msg.channel.send('Fatal error. Please contact your server'
                        + ' admin.');
                    await logger.error('Fatal error %s: %s.  Winnie_Bot cannot locate'
                        + ' required files.\nWinnie_Bot will now terminate.')
                    process.exit(1);
                } else {
                    msg.channel.send("Winnie_Bot accepts IANA timezone identifiers"
                    + " only.")
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
            } else if((msg.author.id in goalList)) {
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
                    //get timezone
                    var regionRegex = /^(Africa|America|Antarctica|Asia|Atlantic|Australia|Europe|Indian|Pacific|Etc)/;
                    var tzRole = msg.member.roles.filter(function (a) {
                        return regionRegex.test(a.name);
                    });
                    var userTZ = tzRole.name;
                    //get current time
                    var startTime = new timezoneJS.Date();
                    startTime.setTimezone(userTZ);
                    //calculate next midnight based on timezone
                    var endTime = startTime;
                    endTime.setHours(24,0,0,0);
                    goalList[msg.author.id] = new Goal(msg.author.id, goal,
                        goalType, 0, startTime.getTime(), endTime.getTime(), msg.channel.id);
                    msg.channel.send(msg.author + ", your goal for today is **"
                        + goal + "** " + goalType + ".");
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
                msg.channel.send("Invalid input. Your goal must be a whole number.")
            } else if(!(msg.author.id in goalList)) {
                msg.channel.send(msg.author + ", you have not yet set a goal for today. Use !set to do so.");
            } else {
                goalList[msg.author.id].addWords(goal, 0);
                msg.channel.send(msg.author + ", you have written **" + goalList[msg.author.id].written + "** " + goalList[msg.author.id].goalType + " of your **" + goalList[msg.author.id].goal + "**-" + goalList[msg.author.id].goalType.slice(0, -1) + " goal.");
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
                msg.channel.send("Invalid input. Your goal must be a whole number.")
            } else if(!(msg.author.id in goalList)) {
                msg.channel.send(msg.author + ", you have not yet set a goal for today. Use !set to do so.");
            } else {
                goalList[msg.author.id].addWords(goal, 1);
                msg.channel.send(msg.author + ", you have written **" + goalList[msg.author.id].written + "** " + goalList[msg.author.id].goalType + " of your **" + goalList[msg.author.id].goal + "**-" + goalList[msg.author.id].goalType.slice(0, -1) + " goal.");
            }
	    }
    },
    "reset": {
        name: "reset",
        description: "Resets your daily goal",
        type: "goals",
		process: function(client,msg,suffix) {
            if(!(msg.author.id in goalList)) {
                msg.channel.send(msg.author + ", you have not yet set a goal for today. Use !set to do so.");
            } else {
                conn.collection('goalDB').remove(
                    {authorID: msg.author.id}
                );
                delete goalList[msg.author.id];

                msg.channel.send(msg.author + ", you have successfully reset your daily goal.");
            }
	    }
    },
    "goalinfo": {
        name: "goalinfo",
        description: "Displays progress towards your daily goal",
        type: "goals",
		process: function(client,msg,suffix) {
            if(!(msg.author.id in goalList)) {
                msg.channel.send(msg.author + ", you have not yet set a goal"
                    + " for today. Use !set to do so.");
            } else {
                msg.channel.send(msg.author + ", you have written **"
                    + goalList[msg.author.id].written + "** "
                    + goalList[msg.author.id].goalType + " of your **"
                    + goalList[msg.author.id].goal + "**-"
                    + goalList[msg.author.id].goalType.slice(0, -1) + " goal.");
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
            var choiceID = (Math.floor(Math.random() * promptList.length))
            msg.channel.send(msg.author + ", your prompt is: **" + promptList
                [choiceID].trim() + "**");
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
                    msg.channel.send("You rolled " + (Math.floor(Math.random() * faces[0]) + 1));
                } else {
                    if(true) {
                        var diceType = faces[0].split("d");
                        if (diceType.length == 2) {
                            if(Number.isInteger(Number(diceType[0])) && Number.isInteger(Number(diceType[1]))) {
                                if(diceType[0] > 20) {
                                    msg.channel.send("ERROR. TOO BIG.");
                                } else {
                                    var diceSum = 0;
                                    var diceString = "";
                                    for (i = 0; i < Number(diceType[0]); i++){
                                        var roll = (Math.floor(Math.random() * diceType[1]) + 1)
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
                                msg.channel.send("Invalid input. Face count must be a whole number.");
                            }
                        } else {
                            msg.channel.send("Invalid input. Face count must be a whole number.");
                        }
                    } else {
                        msg.channel.send("Invalid input. Face count must be a whole number.");
                    }  
                }
            } else if (faces.length == 2) {
                if(Number.isInteger(Number(faces[0])) && Number.isInteger(Number(faces[1]))){
                    if(Number(faces[0]) < Number(faces[1])){
                        msg.channel.send("You rolled " + (Math.floor(Math.random() * (1 + Number(faces[1]) - Number(faces[0])) + Number(faces[0]))));
                    }
                    else {
                        msg.channel.send("Invalid input. First number must be less than second number.");
                    }
                    
                } else {
                    msg.channel.send("Invalid input. Face count must be a whole number.");
                }
            } else {
                msg.channel.send("Invalid input. Face count must be a whole number.");
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
				for (server in raptorCount) {
					raptorMsg += "\n__*" + client.guilds.get(server) + ":*__ "
						+ raptorCount[server];
				}
            msg.channel.send(raptorMsg);
		}
    }
}

client.on('message', (msg) => {
    if(msg.isMentioned(client.user)){
		msg.channel.send("I don't know what you want. Try !help for command information.");
    }
    if(msg.author.id != client.user.id && (msg.content.startsWith(CMD_PREFIX))){
        logger.info(msg.author + " entered command " + msg.content);
        var cmd_data = msg.content.split(" ")[0]
            .substring(CMD_PREFIX.length).toLowerCase();
        var suffix = msg.content.substring(cmd_data.length
            + CMD_PREFIX.length + 1)
		var cmd = cmd_list[cmd_data];
        if(cmd_data === "help"){
            if(suffix){
                var cmd = cmd_list[suffix];
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
                for(var i in cmd_list) {
                    helpMsg += "**" + CMD_PREFIX;
                    var cmdName = cmd_list[i].name;
                    if(cmdName){
						helpMsg += cmdName;
                    }
                    var cmdUse = cmd_list[i].usage;
                    if(cmdUse){
						helpMsg += " " + cmdUse;
					}
                    var cmdDesc = cmd_list[i].description;
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
            msg.channel.send(cmd_data + " is not a valid command."
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