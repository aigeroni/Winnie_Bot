const Discord = require('discord.js');
const client = new Discord.Client();
var config = require('./config.json');
var runningArray = {};
var timerID = 1;
var logger = require('./logger.js');
const gameloop = require('node-gameloop');

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

    channel.send("Your sprint, " + this.displayName + " (ID " + this.objectID + "), starts in " + this.timeToStart + " minutes.");
    let termObjectID = this.objectID;
    let timerData = this.startData;
    let timeoutData = this.timeoutData;
    this.challengeTimer = gameloop.setGameLoop(function(delta) {
        if(timerData > 0) {
            logger.info('(Seconds remaining in countdown=%s, delta=%s)', timerData--, delta);
            if(timerData == 0) {
                channel.send(displayName + " starts now! Race to " + goal + " words!");
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
                channel.send(displayName + " has timed out.");
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

    channel.send("Your war, " + this.displayName + " (ID " + this.objectID + "), starts in " + this.timeToStart + " minutes.");
    let termObjectID = this.objectID;
    let timerData = this.startData;
    let durationData = this.durationData;
    this.challengeTimer = gameloop.setGameLoop(function(delta) {
        if(timerData > 0) {
            logger.info('(Seconds remaining in countdown=%s, delta=%s)', timerData--, delta);
            if(timerData == 0) {
                channel.send(displayName + " starts now!");
            } else if(timerData == 60) {
                channel.send(displayName + " starts in 1 minute.");
            } else if(timerData % 60 == 0) {
                channel.send(displayName + " starts in " + timerData / 60 + " minutes.");
            } else if(timerData < 60 && timerData % 15 == 0) {
                channel.send(displayName + " starts in " + timerData + " seconds.");
            }
        } else {
            logger.info('(Seconds remaining in war=%s, delta=%s)', durationData--, delta);
            if(durationData == 0) {
                channel.send(displayName + " has ended!");
                delete runningArray[termObjectID];
                gameloop.clearGameLoop(this.challengeTimer);
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
        description: "Starts a sprint of n words in m minutes",
        process: function(client,msg,suffix) {
            var args = suffix.split(" ");
            var words = args.shift();
            var start = args.shift();
            var timeout = args.shift();
            var sprint_name = args.join(' ');
            if(!Number.isInteger(Number(words)) || isNaN(start) || isNaN(timeout)){
                msg.channel.send("Invalid input - start interval must be numeric, word goal must be an integer")
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
	    description: "Starts a word war of n minutes' length in m minutes",
	    process: function(client,msg,suffix) {
	    	var args = suffix.split(" ");
            var length = args.shift();
            var start = args.shift();
            var war_name = args.join(' ');
            if(isNaN(length) || isNaN(start)){
                msg.channel.send("Invalid input - start interval and length must be numeric")
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
	    description: "Joins war/sprint",
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
                    // logger.info(runningArray[joinTimerID].joinedUsers[msg.author.id]);
                }
            } else {
                msg.channel.send("There is no such challenge!");
            }
	    }
    },
    "leave": {
	    description: "Leaves war/sprint",
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
                msg.channel.send("There is no such challenge!");
            }
	    }
    },
    "exterminate": {
	    description: "Ends war/sprint. Can only be performed by creator.",
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
                    msg.channel.send("If you did not create it, you cannot exterminate it.");
                }
            } else {
                msg.channel.send("You cannot end a challenge that has not been started!");
            }
	    }
    },
    "list": {
        description: "Lists all running sprints/wars",
        process: function(client,msg,suffix) {
            if(Object.keys(runningArray).length == 0) {
                msg.channel.send("There are no sprints or wars running. Why don't you start one?");
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
    "goal": {
		description: "Sets a goal of w words in m minutes (under construction)",
		process: function(client,msg,suffix) {
			msg.channel.send("This command is under construction.");
		}
    },
    "roll": {
		description: "Rolls a die",
		process: function(client,msg,suffix) {
            var faces = suffix.split(" ");
            if (faces.length == 1) {
                if(Number.isInteger(Number(faces[0]))) {
                    msg.channel.send("You rolled " + (Math.floor(Math.random() * faces[0]) + 1));
                } else {
                    msg.channel.send("Invalid input - face count must be an integer");
                }
            } else if (faces.length == 2) {
                if(Number.isInteger(Number(faces[0])) && Number.isInteger(Number(faces[1]))) {
                    msg.channel.send("You rolled " + (Math.floor(Math.random() * (1 + Number(faces[1]) - Number(faces[0])) + Number(faces[0]))));
                } else {
                    msg.channel.send("Invalid input - face count must be an integer");
                }
            } else {
                msg.channel.send("Invalid input - face count must be an integer");
            }
		}
    },
    "select": {
		description: "Selects between an array of objects (under construction)",
		process: function(client,msg,suffix) {
			msg.channel.send("This command is under construction.");
		}
    }
}

client.on('message', (msg) => {
    if(msg.author.id != client.user.id && (msg.content.startsWith(config.cmd_prefix))){
        logger.info("treating " + msg.content + " from " + msg.author + " as command");
		var cmd_data = msg.content.split(" ")[0].substring(config.cmd_prefix.length);
        var suffix = msg.content.substring(cmd_data.length+config.cmd_prefix.length+1);//add one for the ! and one for the space
        if(msg.isMentioned(client.user)){
			try {
				cmd_data = msg.content.split(" ")[1];
				suffix = msg.content.substring(client.user.mention().length+cmd_data.length+Config.commandPrefix.length+1);
			} catch(e){ //no command
				msg.channel.send("Yes?");
				return;
			}
        }
		var cmd = cmd_list[cmd_data];
        if(cmd_data === "help"){
            //help is special since it iterates over the other commands
						if(suffix){
							var cmds = suffix.split(" ").filter(function(cmd){return commands[cmd]});
							var info = "";
							for(var i=0;i<cmds.length;i++) {
								var cmd = cmds[i];
								info += "**"+config.cmd_prefix + cmd+"**";
								var description = commands[cmd].description;
								if(description instanceof Function){
									description = description();
								}
								if(description){
									info += "\n\t" + description;
								}
								info += "\n"
							}
							msg.channel.send(info);
						} else {
							msg.author.send("Winnie_Bot Commands:").then(function(){
                                var commands = Object.keys(cmd_list);
                                var helpMsg = '';
                                for(var i in commands) {
									var info = config.cmd_prefix + commands[i];
									var description = commands[i].description;
									if(description instanceof Function){
										description = description();
									}
									if(description){
										info += "\n\t" + description;
                                    }
                                    helpMsg += info + "\n";
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