const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');
const logger = require('./logger.js');
const gameloop = require('node-gameloop');
const timezoneJS = require('timezone-js');
timezoneJS.timezone.zoneFileBasePath = 'node_modules/timezone-js/tz';
timezoneJS.timezone.init();
var timerID = 1;
var challengeList = {};
var goalList = {};
var count = 0;
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

const tickTimer = gameloop.setGameLoop(function(delta) {
    //logger.info('(Count=%s, Delta=%s)', count++, delta);
    for (item in challengeList){
        challengeList[item].update();
    }
    for (item in goalList){
    	goalList[item].update();
    }
 });

 client.on('ready', () => {
    logger.info('Winnie_Bot is online');
});

class Sprint {
    constructor(objectID, creator, displayName, countdown, goal, timeout, channel) {
        this.objectID = objectID;
        this.creator = creator;
        this.displayName = displayName;
        this.countdown = countdown;
        this.goal = goal;
        this.timeout = timeout;
        this.joinedUsers = {};

        this.cStart = this.countdown * 60;
        this.cDur = this.duration * 60;
        this.cPost = durationAfterChallenge;

        if(this.countdown == 1) {
            channel.send("Your sprint, " + this.displayName + " (ID " + this.objectID + "), starts in " + this.countdown + " minute.");
        } else {
            channel.send("Your sprint, " + this.displayName + " (ID " + this.objectID + "), starts in " + this.countdown + " minutes.");
        }
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
                channel.send("Error: Invalid state reached.");
                break;
        }
    }

    start() {
        this.cStart--;
        if(this.cStart == 0) {
            var userList = "";
            for(var user in this.joinedUsers) {
                userList += " " + this.joinedUsers[user].userData;
            }
            channel.send(this.displayName + " starts now! Race to " + this.goal + " words!" + userList);
            this.state = 1
        } else if(this.cStart == 60) {
            channel.send(this.displayName + " starts in 1 minute.");
        } else if(this.cStart % 60 == 0) {
            channel.send(this.displayName + " starts in " + this.cStart / 60 + " minutes.");
        } else if(this.cStart < 60 && this.cStart % 15 == 0) {
            channel.send(this.displayName + " starts in " + this.cStart + " seconds.");
        }
    }
    end() {
        this.cDur--;
        if(this.cDur == 0) {
            var userList = "";
            for(var user in this.joinedUsers) {
                userList += " " + this.joinedUsers[user].userData;
            }
            channel.send(this.displayName + " has timed out. Post your total to be included in the summary." + userList);
            this.state = 2;
        } else if(this.cDur == 60) {
            channel.send("There is 1 minute remaining in " + this.displayName + ".");
        } else if(this.cDur % 300 == 0) {
            channel.send("There are " + this.cDur/60 + " minutes remaining in " + this.displayName + ".");
        } else if(this.cDur < 60 && this.cDur % 15 == 0) {
            channel.send("There are " + this.cDur + " seconds remaining in " + this.displayName + ".");
        }
    }
    terminate() {
        if(this.cPost == 0) {
            delete challengeList[objectID];
        }
    }
}

class War{
    constructor(objectID, creator, displayName, countdown, duration, channel) {
        this.objectID = objectID;
        this.creator = creator;
        this.displayName = displayName;
        this.countdown = countdown;
        this.duration = duration;
        this.channel = channel;
        this.joinedUsers = {};
        this.state = 0;

        this.cStart = this.countdown * 60;
        this.cDur = this.duration * 60;
        this.cPost = durationAfterChallenge;

        if(this.countdown == 1) {
            this.channel.send("Your war, " + this.displayName + " (ID " + this.objectID + "), starts in " + this.countdown + " minute.");
        } else {
            this.channel.send("Your war, " + this.displayName + " (ID " + this.objectID + "), starts in " + this.countdown + " minutes.");
        }
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
                channel.send("Error: Invalid state reached.");
                break;
        }
    }

    start() {
        this.cStart--;
        if(this.cStart == 0) {
            var userList = "";
            for(var user in this.joinedUsers) {
                userList += " " + this.joinedUsers[user].userData;
            }
            this.channel.send(this.displayName + " starts now!" + userList);
            this.state = 1
        } else if(this.cStart == 60) {
            this.channel.send(this.displayName + " starts in 1 minute.");
        } else if(this.cStart % 60 == 0) {
            this.channel.send(this.displayName + " starts in " + this.cStart / 60 + " minutes.");
        } else if(this.cStart < 60 && this.cStart % 15 == 0) {
            this.channel.send(this.displayName + " starts in " + this.cStart + " seconds.");
        }
    }
    end() {
        this.cDur--;
        if(this.cDur == 0) {
            var userList = "";
            for(var user in this.joinedUsers) {
                userList += " " + this.joinedUsers[user].userData;
            }
            this.channel.send(this.displayName + " has ended! Post your total to be included in the summary." + userList);
            this.state = 2;
        } else if(this.cDur == 60) {
            this.channel.send("There is 1 minute remaining in " + this.displayName + ".");
        } else if(this.cDur % 300 == 0) {
            this.channel.send("There are " + this.cDur/60 + " minutes remaining in " + this.displayName + ".");
        } else if(this.cDur < 60 && this.cDur % 15 == 0) {
            this.channel.send("There are " + this.cDur + " seconds remaining in " + this.displayName + ".");
        }
    }
    terminate() {
        if(this.cPost == 0) {
            delete challengeList[objectID];
        }
    }

}

class Goal {
    constructor(creator, goal, startTime, terminationTime) {
        this.creator = creator;
        this.goal = goal;
        this.written = 0;
        this.startTime = startTime;
        this.terminationTime = terminationTime;
    }

    update() {
        if(new timezoneJS.Date() == this.terminationTime) {
            delete goalList[creator];
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
    }
}

var cmd_list = {
    "sprint": {
        name: "!sprint",
        description: "Starts a sprint of <words> words in <delay> minutes which times out in <timeout> minutes with optional [name]",
        usage: "<words> <delay> <timeout> [name]",
        process: function(client,msg,suffix) {
            var args = suffix.split(" ");
            var words = args.shift();
            var start = args.shift();
            var timeout = args.shift();
            var sprint_name = args.join(' ');
            if(!Number.isInteger(Number(words)) || isNaN(start) || isNaN(timeout)){
                msg.channel.send("Invalid input. Start interval must be a number, word goal must be a whole number.")
            } else {
                try{
                    creatorID = msg.author.id;
                    if(sprint_name == '') {
                        sprint_name = msg.author.username + "'s sprint";
                    }
                    challengeList[timerID] = new Sprint(timerID, creatorID, sprint_name, start, words, timeout, msg.channel);
                    timerID = timerID + 1;
                } catch(e) {
                    msg.channel.send("If you are seeing this message, Winnie_Bot has gone on holiday.");
                    logger.info(e);
                }
            }
        }
    },
	"war": {
        name: "!war",
        description: "Starts a word war of <length> minutes in <delay> minutes with optional [name]",
        usage: "<length> <delay> [name]",
	    process: function(client,msg,suffix) {
	    	var args = suffix.split(" ");
            var length = args.shift();
            var start = args.shift();
            var war_name = args.join(' ');
            if(isNaN(length) || isNaN(start)){
                msg.channel.send("Invalid input. Start interval and length must be numbers.")
            } else {
                try{
                    creatorID = msg.author.id;
                    if(war_name == '') {
                        war_name = msg.author.username + "'s war";
                    }
                    challengeList[timerID] = new War(timerID, creatorID, war_name, start, length, msg.channel);
                    timerID = timerID + 1;
                } catch(e) {
                    msg.channel.send("If you are seeing this message, Winnie_Bot has gone on holiday.");
                    logger.info(e);
                }
            }
	    }
    },
    "join": {
        name: "!join",
        description: "Joins war/sprint with ID <id>",
        usage: "<id>",
	    process: function(client,msg,suffix) {
            var args = suffix.split(" ");
            var challengeID = args.shift();
            if (challengeID in challengeList) {
                if(msg.author.id in challengeList[challengeID].joinedUsers) {
                    msg.channel.send(msg.author + ", you already have notifications enabled for this challenge.");
                } else {
                    challengeList[challengeID].joinedUsers[msg.author.id] = {"userData": msg.author, "countData": undefined};
                    msg.channel.send(msg.author + ", you have joined " + challengeList[challengeID].displayName);
                }
            } else {
                msg.channel.send("Challenge " + challengeID + " does not exist!");
            }
	    }
    },
    "leave": {
        name: "!leave",
        description: "Leaves war/sprint with ID <id>",
        usage: "<id>",
	    process: function(client,msg,suffix) {
            var args = suffix.split(" ");
            var challengeID = args.shift();
            if (challengeID in challengeList) {
                if(msg.author.id in challengeList[challengeID].joinedUsers) {
                    delete challengeList[challengeID].joinedUsers[msg.author.id];
                    msg.channel.send(msg.author + ", you have left " + challengeList[challengeID].displayName);
                } else {
                    msg.channel.send(msg.author + ", you have not yet joined this challenge.");
                }
            } else {
                msg.channel.send("Challenge " + challengeID + " does not exist!");
            }
	    }
    },
    "exterminate": {
        name: "!exterminate",
        description: "Ends war/sprint with ID <id>. Can only be performed by creator.",
        usage: "<id>",
	    process: function(client,msg,suffix) {
            var args = suffix.split(" ");
            var challengeID = args.shift();
            if (challengeID in challengeList) {
                if(challengeList[challengeID].creator == msg.author.id) {
                    exName = challengeList[challengeID].displayName;
                    delete challengeList[challengeID];
                    msg.channel.send(exName + " has been successfully exterminated.");
                    
                } else {
                    msg.channel.send("Only the creator of " + exName + " can end this challenge.");
                }
            } else {
                msg.channel.send("Challenge " + challengeID + " does not exist!");
            }
	    }
    },
    "total": {
        name: "!total",
        description: "Adds your <total> for completed challenge <id>, optional [pages/lines] for scriptwriters",
        usage: "<id> <total> [pages/lines]",
        process: function(client,msg,suffix) {
            var args = suffix.split(" ");
            var challengeID = args.shift();
            var wordsWritten = args.shift();
            var projectTypeID = args.shift();
            // if(projectTypeID != '') {
            //     if(projectTypeID
            // }
            if (challengeID in challengeList) {
                if (challengeList[challengeID].state == 2) {
                    if(Number.isInteger(parseInt(wordsWritten))){
                        for(user in challengeList[challengeID].joinedUsers) {
                            if(challengeList[challengeID].joinedUsers[user].userData.id == msg.author.id) {
                                challengeList[item].joinedUsers[user].countData = wordsWritten;
                            }
                        }
                        msg.channel.send("Total added to summary.");
                    } else {
                        msg.channel.send(msg.author + ", I need a whole number of words to include in the summary!");
                    }
                } else {
                    msg.channel.send("This challenge has not ended yet!");
                }
            } else {
                msg.channel.send("This challenge does not exist!");
            }
        }
    },
    "summary": {
        name: "!summary",
        description: "Shows the summary for completed challenge <id>",
        usage: "<id>",
        process: function(client,msg,suffix) {
            var args = suffix.split(" ");
            var challengeID = args.shift();
            if (challengeID in challengeList) {
                if (challengeList[challengeID].state == 2) {
                    var userTotal = "";
                    var totalWords = 0;
                    for(var user in challengeList[challengeID].joinedUsers) {
                        logger.info(challengeList[challengeID].joinedUsers[user].countData);
                        if(Number.isInteger(Number(challengeList[challengeID].joinedUsers[user].countData))){
                            userTotal += "\n" + challengeList[challengeID].joinedUsers[user].userData + ": **" + challengeList[challengeID].joinedUsers[user].countData + "** words";
                            totalWords += parseInt(challengeList[challengeID].joinedUsers[user].countData);
                        }
                    }
                    msg.channel.send("Statistics for " + challengeList[challengeID].displayName + ":\n" + userTotal + "\n\nTotal: **" + totalWords + "** words");                    
                } else {
                    msg.channel.send("This challenge has not ended yet!");
                }
            } else {
                msg.channel.send("This challenge does not exist!");
            }
        }
    },
    "list": {
        name: "!list",
        description: "Lists all running sprints/wars",
        usage: "",
        process: function(client,msg,suffix) {
            if(Object.keys(challengeList).length == 0) {
                msg.channel.send("There are no challenges running. Why don't you start one?");
            } else {
                if(Object.keys(challengeList).length == 1) {
                    timerInfo = "There is " + Object.keys(challengeList).length + " challenge running:\n";
                } else {
                    timerInfo = "There are " + Object.keys(challengeList).length + " challenges running:\n";
                }
                for(var i in challengeList) {
                    switch(challengeList[i].state){
                        case 0:
                            var timeout = "";
                            if ((challengeList[i].cStart % 60) < 10) {
                                timeout = "0" + (challengeList[i].cStart % 60).toString();
                            } else {
                                timeout = challengeList[i].cStart % 60;
                            }
                            logger.info(timeout);
                            timerInfo += i + ": " + challengeList[i].displayName
                            timerInfo += " (starts in " + Math.floor(challengeList[i].cStart / 60) + ":" + timeout + ")\n";
                            break;
                        case 1:
                            var timeout = "";
                            if ((challengeList[i].cDur % 60) < 10) {
                                timeout = "0" + (challengeList[i].cDur % 60).toString();
                            } else {
                                timeout = challengeList[i].cDur % 60;
                            }
                            logger.info(timeout);
                            timerInfo += i + ": " + challengeList[i].displayName 
                            timerInfo += " (" + Math.floor(challengeList[i].cDur / 60) + ":" + timeout + " remaining)\n";
                            break;
                        case 2:
                        default:
                            break;
                    }
                }
                msg.channel.send(timerInfo);
            }
        }
    },
    "target": {
        name: "!target",
        description: "Generates an <easy/average/hard> target for <time> minutes",
        usage: "<easy/average/hard> <time>",
		process: function(client,msg,suffix) {
            var args = suffix.split(" ");
            var difficulty = args.shift();
            var time = args.shift();
            var base = null;
            if(!Number.isInteger(Number(time))){
                msg.channel.send("Invalid input. Duration must be a whole number.")
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
                }
                goalPerMinute = ((Math.ceil(Math.random() * 12) + base));
                goalTotal = (goalPerMinute * time);
                msg.channel.send(msg.author + ", your goal is **" + goalTotal + "**.");
            }
	    }
    },
    "timezone": {
        name: "!timezone",
        description: "Sets your <IANA timezone identifier>",
        usage: "<IANA timezone identifier>",
		process: async function(client,msg,suffix) {
            var timezone = suffix;
            var dt = new timezoneJS.Date();
            try{
                //check to see if timezone is in IANA library
                dt.setTimezone(timezone)
                //create new role if needed, find role ID
                if (msg.guild.roles.find("name", timezone) === null){
                    await msg.guild.createRole({name: timezone});
                    tzRole = msg.guild.roles.find("name", timezone);
                } else {
                    tzRole = msg.guild.roles.find("name", timezone);
                }
                //get timezone
                // regionRegex = /^(Africa|America|Antarctica|Asia|Atlantic|Australia|Europe|Indian|Pacific|Etc)/;
                // currentRoleList = msg.member.roles.filter(function (a) {
                //     return regionRegex.test(a.name);
                // });
                // logger.info(currentRoleList);
                // currentRoleArray = currentRoleList.array();
                // for(role in currentRoleArray) {
                //     logger.info(role.toString());
                //     msg.member.removeRole(role);
                // }
                //add user to role, confirm
                msg.member.addRole(tzRole);
                msg.channel.send(msg.author + ", you have set your timezone to **" + timezone + "**.");
            } catch(e) {
                msg.channel.send("Winnie_Bot accepts IANA canonical timezones only.")
            }
	    }
    },
    "set": {
        name: "!set",
        description: "Sets a daily goal of <words>",
        usage: "<words>",
		process: function(client,msg,suffix) {
            var words = suffix.split(" ");
            if(!Number.isInteger(Number(words))){
                msg.channel.send("Invalid input. Your goal must be a whole number.")
            } else if(typeof(goalList[msg.author.id]) != "undefined") {
                msg.channel.send(msg.author + ", you have already set a goal today. Use !update to record your progress.");
            } else {
                //get timezone
                regionRegex = /^(Africa|America|Antarctica|Asia|Atlantic|Australia|Europe|Indian|Pacific|Etc)/;
                tzRole = msg.member.roles.filter(function (a) {
                    return regionRegex.test(a.name);
                });
                userTZ = tzRole.name;
                //get current time
                startTime = new timezoneJS.Date();
                startTime.setTimezone(userTZ);
                //logger.info(startTime);
                //calculate next midnight based on timezone
                endTime = startTime;
                endTime.setHours(24,0,0,0);
                //logger.info(endTime);
                goalList[msg.author.id] = new Goal(msg.author.id, words, startTime, endTime);
                msg.channel.send(msg.author + ", your goal for today is **" + words + "** words.");
            }
	    }
    },
    "update": {
        name: "!update",
        description: "Updates your daily goal with the number of <words> you have completed since your last update",
        usage: "<words>",
		process: function(client,msg,suffix) {
            var words = suffix.split(" ");
            logger.info(words);
            if(!Number.isInteger(parseInt(words))){
                msg.channel.send("Invalid input. Your goal must be a whole number.")
            } else if(typeof(goalList[msg.author.id]) == "undefined") {
                msg.channel.send(msg.author + ", you have not yet set a goal for today. Use !set to do so.");
            } else {
                goalList[msg.author.id].addWords(words, 0);
                msg.channel.send(msg.author + ", you have written **" + goalList[msg.author.id].written + "** words of your **" + goalList[msg.author.id].words + "**-word goal.");
            }
	    }
    },
    "progress": {
        name: "!progress",
        description: "Updates your daily goal with the total number of <words> you have completed today",
        usage: "<words>",
		process: function(client,msg,suffix) {
	    	var words = suffix.split(" ");
            if(!Number.isInteger(parseInt(words))){
                msg.channel.send("Invalid input. Your goal must be a whole number.")
            } else if(typeof(goalList[msg.author.id]) == "undefined") {
                msg.channel.send(msg.author + ", you have not yet set a goal for today. Use !set to do so.");
            } else {
                goalList[msg.author.id].addWords(words, 1);
                msg.channel.send(msg.author + ", you have written **" + goalList[msg.author.id].written + "** words of your **" + goalList[msg.author.id].words + "**-word goal.");
            }
	    }
    },
    "reset": {
        name: "!reset",
        description: "Resets your daily goal",
		process: function(client,msg,suffix) {
            if(typeof(goalList[msg.author.id]) == "undefined") {
                msg.channel.send(msg.author + ", you have not yet set a goal for today. Use !set to do so.");
            } else {
                goalList[msg.author.id] = undefined;
                msg.channel.send(msg.author + ", you have successfully reset your daily goal.");
            }
	    }
    },
    "prompt": {
        name: "!prompt",
        description: "Provides a writing prompt",
		process: function(client,msg,suffix) {
            logger.info(promptList.length);
            var choiceID = (Math.floor(Math.random() * promptList.length))
            logger.info(choiceID);
            msg.channel.send(msg.author + ", your prompt is: **" + promptList[choiceID].trim() + "**");
		}
    },
    "goalinfo": {
        name: "!goalinfo",
        description: "Displays progress towards your daily goal",
		process: function(client,msg,suffix) {
            if(typeof(goalList[msg.author.id]) == "undefined") {
                msg.channel.send(msg.author + ", you have not yet set a goal for today. Use !set to do so.");
            } else {
                msg.channel.send(msg.author + ", you have written **" + goalList[msg.author.id].written + "** words of your **" + goalList[msg.author.id].words + "**-word goal.");
            }
		}
    },
    "roll": {
        name: "!roll",
        description: "Rolls a die",
        usage: "<x> [y], <x>d<y>",
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
        name: "!choose",
        description: "Selects an item from a list <list> of items, separated by commas",
        usage: "<list>",
		process: function(client,msg,suffix) {
            var items = suffix.split(",");
            logger.info(items.length);
            var choiceID = (Math.floor(Math.random() * items.length))
            logger.info(choiceID);
            msg.channel.send(msg.author + ", from " + suffix + ", I selected **" + items[choiceID].trim() + "**");
		}
    }
}

client.on('message', (msg) => {
    if(msg.isMentioned(client.user)){
		msg.channel.send("I don't know what you want. Try !help for command information.");
    }
    if(msg.author.id != client.user.id && (msg.content.startsWith(config.cmd_prefix))){
        logger.info("treating " + msg.content + " from " + msg.author + " as command");
		var cmd_data = msg.content.split(" ")[0].substring(config.cmd_prefix.length);
        var suffix = msg.content.substring(cmd_data.length+config.cmd_prefix.length+1);//add one for the ! and one for the space
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
                    msg.channel.send("That command does not exist.");
                }
			} else {
                msg.author.send("Winnie_Bot Commands:").then(function(){
                var helpMsg = "";
                for(var i in cmd_list) {
                    var cmdName = cmd_list[i].name;
                    if(cmdName){
						helpMsg += cmdName + " ";
                    }
                    var cmdUse = cmd_list[i].usage;
                    if(cmdUse){
						helpMsg += cmdUse;
					}
                    var cmdDesc = cmd_list[i].description;
                    if(cmdDesc){
						helpMsg += ": " + cmdDesc;
					}
                    helpMsg += "\n";
                }
                msg.author.send(helpMsg);	
			});
		    }
        }
		else if(cmd) {
		    try{
				cmd.process(client,msg,suffix);
			} catch(e){
                msg.channel.send("If you are reading this message, Winnie_Bot has gone on holiday.");
                logger.info(e);
			}
		} else {
			msg.channel.send(cmd_data + " is not a valid command. Type !help for a list of commands.").then((message => message.delete(2500)))
		}
	} else {
		return
    }
});

process.on('uncaughtException', function(e) {
    logger.info('Error %s: %s.\nWinnie_Bot will now restart.', e, e.stack);
    process.exit(1);
  })

client.login(config.token);