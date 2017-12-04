const Discord = require('discord.js');
const client = new Discord.Client();
var config = require('./config.json');
var runningArray = [];
var timerID = 1;

client.on('ready', () => {
  console.log('Winnie_Bot is online');
});

function Sprint(uniqueID, creator, displayName, timeToStart, goal, timeout, channel) {
    this.countID = uniqueID;
    this.creator = creator;
    this.displayName = displayName;
    this.timeToStart = timeToStart;
    this.goal = goal;
    this.timeout = timeout;
    this.notify = [];

    this.startData = this.timeToStart * 60000;
    this.timeoutData = this.timeout * 60000;

    channel.send("Your sprint, " + this.displayName + " (ID " + this.countID + "), starts in " + this.timeToStart + " minutes.")
    this.sprint_start = setTimeout(function(){
        var sprintNotifyList = '';
        for(var i in this.notify)
        {
            sprintNotifyList += i + ' ';
        }
        channel.send(displayName + " starts now! Race to " + goal + " words! " + sprintNotifyList);
    }, this.startData);
    this.sprint_close = setTimeout(function(){
        var sprintNotifyList = '';
        for(var i in this.notify)
        {
            sprintNotifyList += i + ' ';
        }
        channel.send(displayName + " has timed out.");
    }, this.startData + this.timeoutData);
  }

function War(uniqueID, creator, displayName, timeToStart, duration, channel) {
    this.countID = uniqueID;
    this.creator = creator;
    this.displayName = displayName;
    this.timeToStart = timeToStart;
    this.duration = duration;
    this.notify = new Array();

    this.startData = this.timeToStart * 60000;
    this.durationData = this.duration * 60000;

    channel.send("Your war, " + this.displayName + " (ID " + this.countID + "), starts in " + this.timeToStart + " minutes.")
    this.war_start = setTimeout(function(){
        var warNotifyList = '';
        for(var i in this.notify)
        {
            warNotifyList += i + ' ';
        }
        channel.send(displayName + " starts now! " + warNotifyList);
    }, this.startData);
    this.war_end = setTimeout(function(){
        var warNotifyList = '';
        for(var i in this.notify)
        {
            warNotifyList += i + ' ';
        }
        channel.send(displayName + " has ended! " + warNotifyList);
        war_running = undefined;
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
                    runningArray.push(new Sprint(timerID, creatorID, sprint_name, start, words, timeout, msg.channel));
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
                    runningArray.push(new War(timerID, creatorID, war_name, start, length, msg.channel));
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
            var userLookup = sprint_running.notify.indexOf(msg.author);
            if (userLookup = -1) {
                sprint_running.notify.push(msg.author);
                msg.channel.send(msg.author + ", you have joined " + sprint_running.displayName);
            } else {
                msg.channel.send(msg.author + ", you have already joined the sprint.");
            }
	    }
    },
    "leave": {
	    description: "Leaves war/sprint",
	    process: function(client,msg,suffix) {
            var userLookup = sprint_running.notify.indexOf(msg.author);
            if (userLookup = -1) {
                sprint_running.notify.push(msg.author);
                msg.channel.send(msg.author + ", you have joined " + sprint_running.displayName);
            } else {
                msg.channel.send(msg.author + ", you have already joined the sprint.");
            }
	    }
    },
    "exterminate": {
	    description: "Ends war/sprint. Can only be performed by creator.",
	    process: function(client,msg,suffix) {
            var userLookup = sprint_running.notify.indexOf(msg.author);
            if (userLookup = -1) {
                sprint_running.notify.push(msg.author);
                msg.channel.send(msg.author + ", you have joined " + sprint_running.displayName);
            } else {
                msg.channel.send(msg.author + ", you have already joined the sprint.");
            }
	    }
    },
    "endsprint": {
	    description: "Ends sprint. Can only be used by creator.",
	    process: function(client,msg,suffix) {
	    	if(sprint_running.creator == msg.author.id) {
                msg.channel.send(sprint_running.displayName + " has been terminated.");
                clearTimeout(sprint_running.sprint_start);
                clearTimeout(sprint_running.sprint_close);
                sprint_running = undefined;
            } else {
                msg.channel.send(msg.author + ", you are not the creator of this sprint.")
            }
	    }
    },
    "joinsprint": {
	    description: "Joins sprint",
	    process: function(client,msg,suffix) {
            var userLookup = sprint_running.notify.indexOf(msg.author);
            if (userLookup = -1) {
                sprint_running.notify.push(msg.author);
                msg.channel.send(msg.author + ", you have joined " + sprint_running.displayName);
            } else {
                msg.channel.send(msg.author + ", you have already joined the sprint.");
            }
	    }
    },
    "leavesprint": {
	    description: "Leaves sprint",
	    process: function(client,msg,suffix) {
            var userLookup = sprint_running.notify.indexOf(msg.author);
            if (userLookup > -1) {
                sprint_running.notify.splice(userLookup, 1);
                msg.channel.send(msg.author + ", you have left " + sprint_running.displayName);
            } else {
                msg.channel.send(msg.author + ", you had not joined the sprint.");
            }
		}
    },
    "endwar": {
		description: "Ends sprint. Can only be used by creator.",
		process: function(client,msg,suffix) {
			if(war_running.creator == msg.author.id) {
                msg.channel.send(war_running.displayName + " has been terminated.");
                clearTimeout(war_running.war_start);
                clearTimeout(war_running.war_end);
                war_running = undefined;
            } else {
                msg.channel.send(msg.author + ", you are not the creator of this war.")
            }
		}
    },
    "joinwar": {
		description: "Joins war",
		process: function(client,msg,suffix) {
            var userLookup = war_running.notify.indexOf(msg.author);
            
            if (userLookup = -1) {
                war_running.notify.push(msg.author);
                msg.channel.send(msg.author + ", you have joined " + war_running.displayName);
            } else {
                msg.channel.send(msg.author + ", you have already joined the war.");
            }
		}
    },
    "leavewar": {
		description: "Leaves war",
        process: function(client,msg,suffix) {
            var userLookup = war_running.notify.indexOf(msg.author);
        
            if (userLookup > -1) {
                war_running.notify.splice(userLookup, 1);
                msg.channel.send(msg.author + ", you have left " + war_running.displayName);
            } else {
                msg.channel.send(msg.author + ", you had not joined the war.");
            }
		}
    },
    "list": {
        description: "Lists all running sprints/wars",
        process: function(client,msg,suffix) {
            if(runningArray.length == 0) {
                msg.channel.send("There are no sprints or wars running. Why don't you start one?");
            } else {
                if(runningArray.length == 1) {
                    timerInfo = "There is " + runningArray.length + " timer running:\n";
                } else {
                    timerInfo = "There are " + runningArray.length + " timers running:\n";
                }
                for(var i in runningArray) {
                    timerInfo += runningArray[i].countID + " " + runningArray[i].displayName +  "\n";
                }
                msg.channel.send(timerInfo);
            }
        }
    },
    "set_goal": {
		description: "Sets a goal of w words in m minutes (under construction)",
		process: function(client,msg,suffix) {
			msg.channel.send("This command is under construction.")
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