const Discord = require('discord.js');
const client = new Discord.Client();
var config = require('./config.json');
var runningArray = {};
var postMortemArray = {};
var timerID = 1;
var logger = require('./logger.js');
const gameloop = require('node-gameloop');
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
    "Something has a dual function."];

client.on('ready', () => {
    logger.info('Winnie_Bot is online');
});

function Sprint(objectID, creator, displayName, timeToStart, goal, timeout, channel) {
    this.objectID = objectID;
    this.creator = creator;
    this.displayName = displayName;
    this.timeToStart = timeToStart;
    this.goal = goal;
    this.timeout = timeout;
    this.joinedUsers = {};

    this.startData = this.timeToStart * 60;
    this.timeoutData = this.timeout * 60;

    if(this.timeToStart == 1) {
        channel.send("Your sprint, " + this.displayName + " (ID " + this.objectID + "), starts in " + this.timeToStart + " minute.");
    } else {
        channel.send("Your sprint, " + this.displayName + " (ID " + this.objectID + "), starts in " + this.timeToStart + " minutes.");
    }
    let termObjectID = this.objectID;
    let timerData = this.startData;
    let timeoutData = this.timeoutData;
    this.challengeTimer = gameloop.setGameLoop(function(delta) {
        if(timerData > 0) {
            logger.info('(Seconds remaining in countdown=%s, delta=%s)', timerData--, delta);
            if(timerData == 0) {
                userList = "";
                for(user in joinedUsers) {
                    userList += " " + joinedUsers[user];
                }
                channel.send(displayName + " starts now! Race to " + goal + " words!" + userList);
            } else if(timerData == 60) {
                channel.send(displayName + " starts in 1 minute.");
            } else if(timerData % 60 == 0) {
                channel.send(displayName + " starts in " + timerData / 60 + " minutes.");
            } else if(timerData < 60 && timerData % 15 == 0) {
                channel.send(displayName + " starts in " + timerData + " seconds.");
            }
        } else {
            logger.info('(Seconds remaining in sprint=%s, delta=%s)', timeoutData--, delta);
            if(timeoutData == 0) {
                userList = "";
                for(user in joinedUsers) {
                    userList += " " + joinedUsers[user];
                }
                channel.send(displayName + " has timed out." + userList);
                gameloop.clearGameLoop(this.challengeTimer);
                delete runningArray[termObjectID];
            } else if(timeoutData == 60) {
                channel.send("There is 1 minute remaining in " + displayName + ".");
            } else if(timeoutData % 300 == 0) {
                channel.send("There are " + timeoutData/60 + " minutes remaining in " + displayName + ".");
            } else if(timeoutData < 60 && timeoutData % 15 == 0) {
                channel.send("There are " + timeoutData + " seconds remaining in " + displayName + ".");
            }
        }
    }, 1000);
  }

function War(objectID, creator, displayName, timeToStart, duration, channel) {
    this.objectID = objectID;
    this.creator = creator;
    this.displayName = displayName;
    this.timeToStart = timeToStart;
    this.duration = duration;
    this.joinedUsers = {};
    this.channel = channel;

    this.startData = this.timeToStart * 60;
    this.durationData = this.duration * 60;

    if(this.timeToStart == 1) {
        channel.send("Your war, " + this.displayName + " (ID " + this.objectID + "), starts in " + this.timeToStart + " minute.");
    } else {
        channel.send("Your war, " + this.displayName + " (ID " + this.objectID + "), starts in " + this.timeToStart + " minutes.");
    }
    let joinedUsers = this.joinedUsers;
    let termObjectID = this.objectID;
    let timerData = this.startData;
    let durationData = this.durationData;
    let postMortemTimer = 120;
    this.challengeTimer = gameloop.setGameLoop(function(delta) {
        if(timerData > 0) {
            logger.info('(Seconds remaining in countdown=%s, delta=%s)', timerData--, delta);
            if(timerData == 0) {
                userList = "";
                for(user in joinedUsers) {
                    userList += " " + joinedUsers[user];
                }
                channel.send(displayName + " starts now!" + userList);
            } else if(timerData == 60) {
                channel.send(displayName + " starts in 1 minute.");
            } else if(timerData % 60 == 0) {
                channel.send(displayName + " starts in " + timerData / 60 + " minutes.");
            } else if(timerData < 60 && timerData % 15 == 0) {
                channel.send(displayName + " starts in " + timerData + " seconds.");
            }
        } else if(postMortemTimer < 120) {
            logger.info('(Seconds remaining in post-mortem=%s, delta=%s)', postMortemTimer--, delta);
            if(postMortemTimer == 0) {
                userList = "";
                for(user in joinedUsers) {
                    userList += " " + joinedUsers[user];
                }
                channel.send(displayName + " starts now!" + userList);
                gameloop.clearGameLoop(this.challengeTimer);
            }
        } else {
            logger.info('(Seconds remaining in war=%s, delta=%s)', durationData--, delta);
            if(durationData == 0) {
                userList = "";
                for(user in joinedUsers) {
                    userList += " " + joinedUsers[user];
                }
                channel.send(displayName + " has ended! Post your total to be included in the summary." + userList);
                delete runningArray[termObjectID];
                postMortemTimer--;
            } else if(durationData == 60) {
                channel.send("There is 1 minute remaining in " + displayName + ".");
            } else if(durationData % 300 == 0) {
                channel.send("There are " + durationData/60 + " minutes remaining in " + displayName + ".");
            } else if(durationData < 60 && durationData % 15 == 0) {
                channel.send("There are " + durationData + " seconds remaining in " + displayName + ".");
            }
        }
    }, 1000);
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
                    runningArray[timerID] = new Sprint(timerID, creatorID, sprint_name, start, words, timeout, msg.channel);
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
                    runningArray[timerID] = new War(timerID, creatorID, war_name, start, length, msg.channel);
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
            var joinTimerID = args.shift();
            logger.info(joinTimerID);
            logger.info(Object.keys(runningArray));
            if (joinTimerID in runningArray) {
                if(msg.author.id in runningArray[joinTimerID].joinedUsers) {
                    msg.channel.send(msg.author + ", you already have notifications enabled for this challenge.");
                } else {
                    runningArray[joinTimerID].joinedUsers[msg.author.id] = msg.author;
                    msg.channel.send(msg.author + ", you have joined " + runningArray[joinTimerID].displayName);
                }
            } else {
                msg.channel.send("Challenge " + joinTimerID + " does not exist!");
            }
	    }
    },
    "leave": {
        name: "!leave",
        description: "Leaves war/sprint with ID <id>",
        usage: "<id>",
	    process: function(client,msg,suffix) {
            var args = suffix.split(" ");
            var leaveTimerID = args.shift();
            logger.info(leaveTimerID);
            logger.info(Object.keys(runningArray));
            if (leaveTimerID in runningArray) {
                if(msg.author.id in runningArray[leaveTimerID].joinedUsers) {
                    delete runningArray[leaveTimerID].joinedUsers[msg.author.id];
                    msg.channel.send(msg.author + ", you have left " + runningArray[leaveTimerID].displayName);
                } else {
                    msg.channel.send(msg.author + ", you have not yet joined this challenge.");
                }
            } else {
                msg.channel.send("Challenge " + joinTimerID + " does not exist!");
            }
	    }
    },
    "exterminate": {
        name: "!exterminate",
        description: "Ends war/sprint with ID <id>. Can only be performed by creator.",
        usage: "<id>",
	    process: function(client,msg,suffix) {
            var args = suffix.split(" ");
            var exterminateID = args.shift();
            if (exterminateID in runningArray) {
                if(runningArray[exterminateID].creator == msg.author.id) {
                    exName = runningArray[exterminateID].displayName;
                    gameloop.clearGameLoop(runningArray[exterminateID].challengeTimer);
                    delete runningArray[exterminateID];
                    msg.channel.send(exName + " has been successfully exterminated.");
                    
                } else {
                    msg.channel.send("Only the creator of " + exName + " can end this challenge.");
                }
            } else {
                msg.channel.send("Challenge " + exterminateID + " does not exist!");
            }
	    }
    },
    "list": {
        name: "!list",
        description: "Lists all running sprints/wars",
        usage: "",
        process: function(client,msg,suffix) {
            if(Object.keys(runningArray).length == 0) {
                msg.channel.send("There are no challenges running. Why don't you start one?");
            } else {
                if(Object.keys(runningArray).length == 1) {
                    timerInfo = "There is " + Object.keys(runningArray).length + " challenge running:\n";
                } else {
                    timerInfo = "There are " + Object.keys(runningArray).length + " challenges running:\n";
                }
                for(var i in runningArray) {
                    timerInfo += i + ": " + runningArray[i].displayName +  "\n";
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
    "set": {
        name: "!set",
        description: "Sets a daily goal of <words>",
        usage: "<words>",
		process: function(client,msg,suffix) {
	    	var words = suffix.split(" ");
            if(!Number.isInteger(Number(words))){
                msg.channel.send("Invalid input. Your goal must be a whole number.")
            } else {
                msg.channel.send(msg.author + ", your goal for today is **" + goal + "**.");
            }
	    }
    },
    "update": {
        name: "!update",
        description: "Updates your daily goal with <words> you have completed",
        usage: "<words>",
		process: function(client,msg,suffix) {
	    	var words = suffix.split(" ");
            if(!Number.isInteger(Number(words))){
                msg.channel.send("Invalid input. Your goal must be a whole number.")
            } else {
                msg.channel.send(msg.author + ", your goal for today is **" + goal + "**.");
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
                                if(diceType[0] > 100) {
                                    msg.channel.send("ERROR. TOO BIG.");
                                } else {
                                    var diceSum = 0;
                                    for (i = 0; i < Number(diceType[0]); i++){
                                        var roll = (Math.floor(Math.random() * diceType[1]) + 1)
                                        msg.channel.send(roll);
                                        diceSum += roll;
                                        msg.channel.send("Total = " + diceSum);
                                    }
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
		try {
			cmd_data = msg.content.split(" ")[1];
			suffix = msg.content.substring(client.user.mention().length+cmd_data.length+Config.commandPrefix.length+1);
        } catch(e){
			msg.channel.send("Yes?");
			return;
		}
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

client.login(config.token);