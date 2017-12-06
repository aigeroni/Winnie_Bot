const Discord = require('discord.js');
const client = new Discord.Client();
var config = require('./config.json');
var runningArray = {};
var timerID = 1;

client.on('ready', () => {
  console.log('Winnie_Bot is online');
});

function Sprint(creator, displayName, timeToStart, goal, timeout, channel) {
    this.creator = creator;
    this.displayName = displayName;
    this.timeToStart = timeToStart;
    this.goal = goal;
    this.timeout = timeout;
    this.joinedUsers = {};

    this.startData = this.timeToStart * 60000;
    this.timeoutData = this.timeout * 60000;

    channel.send("Your sprint, " + this.displayName + " (ID " + timerID + "), starts in " + this.timeToStart + " minutes.")
    this.challenge_start = setTimeout(function(){
        channel.send(displayName + " starts now! Race to " + goal + " words!");
    }, this.startData);
    this.challenge_end = setTimeout(function(){
        channel.send(displayName + " has timed out.");
    }, this.startData + this.timeoutData);
  }

function War(creator, displayName, timeToStart, duration, channel) {
    this.creator = creator;
    this.displayName = displayName;
    this.timeToStart = timeToStart;
    this.duration = duration;
    this.joinedUsers = {};

    this.startData = this.timeToStart * 60000;
    this.durationData = this.duration * 60000;

    channel.send("Your war, " + this.displayName + " (ID " + timerID + "), starts in " + this.timeToStart + " minutes.")
    this.challenge_start = setTimeout(function(){
        channel.send(displayName + " starts now!");
    }, this.startData);
    this.challenge_end = setTimeout(function(){
        channel.send(displayName + " has ended!");
    }, this.startData + this.durationData);
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
                    startTime = start * 60000;
                    if(sprint_name == '') {
                        sprint_name = msg.author.username + "'s sprint";
                    }
                    runningArray[timerID] = new Sprint(creatorID, sprint_name, start, words, timeout, msg.channel);
                    timerID = timerID + 1;
                } catch(e) {
                    msg.channel.send("If you are seeing this message, Winnie_Bot has gone on holiday.");
                    console.log(e);
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
                    runningArray[timerID] = new War(creatorID, war_name, start, length, msg.channel);
                    timerID = timerID + 1;
                } catch(e) {
                    msg.channel.send("If you are seeing this message, Winnie_Bot has gone on holiday.");
                    console.log(e);
                }
            }
	    }
    },
    "join": {
	    description: "Joins war/sprint",
	    process: function(client,msg,suffix) {
            var args = suffix.split(" ");
            var joinTimerID = args.shift();
            console.log(joinTimerID);
            console.log(Object.keys(runningArray));
            if (joinTimerID in runningArray) {
                if(msg.author.id in runningArray[joinTimerID].joinedUsers) {
                    msg.channel.send(msg.author + ", you already have notifications enabled for this challenge.");
                } else {
                    runningArray[joinTimerID].joinedUsers[msg.author.id] = msg.author;
                    msg.channel.send(msg.author + ", you have joined " + runningArray[joinTimerID].displayName);
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
            console.log(leaveTimerID);
            console.log(Object.keys(runningArray));
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
                console.log(runningArray[exterminateID].creator);
                console.log(msg.author);
                if(runningArray[exterminateID].creator == msg.author.id) {
                    exName = runningArray[exterminateID].displayName;
                    clearTimeout(runningArray[exterminateID].challenge_start);
                    clearTimeout(runningArray[exterminateID].challenge_end);
                    delete runningArray[exterminateID];
                    msg.channel.send(exName + " has been successfully exterminated.");
                    
                } else {
                    msg.channel.send("If you did not create it, you cannot exterminate it.");
                }
            } else {
                msg.channel.send("You cannot end a challenge that has not been started!");
            }
            console.log(exterminateID);
            console.log(Object.keys(runningArray));
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
        console.log("treating " + msg.content + " from " + msg.author + " as command");
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
                console.log(e);
			}
		} else {
			msg.channel.send(cmd_data + " is not a valid command. Type !help for a list of commands.").then((message => message.delete(2500)))
		}
	} else {
		return
    }
});

client.login(config.token);