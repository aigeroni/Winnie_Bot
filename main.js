const Discord = require('discord.js');
const client = new Discord.Client();
var config = require('./config.json');
var war_running;
var sprint_running;

client.on('ready', () => {
  console.log('Winnie_Bot is online');
});

function Sprint(creator, displayName, timeToStart, goal, timeout, channel) {
    this.creator = creator;
    this.displayName = displayName;
    this.timeToStart = timeToStart;
    this.goal = goal;
    this.timeout = timeout;
    this.notify = new Array();

    this.startData = this.timeToStart * 60000;
    this.timeoutData = this.timeout * 60000;

    channel.send("Your sprint, " + this.displayName + ", starts in " + this.timeToStart + " minutes.")
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

function War(creator, displayName, timeToStart, duration, channel) {
    this.creator = creator;
    this.displayName = displayName;
    this.timeToStart = timeToStart;
    this.duration = duration;
    this.notify = new Array();

    this.startData = this.timeToStart * 60000;
    this.durationData = this.duration * 60000;

    channel.send("Your war, " + this.displayName + ", starts in " + this.timeToStart + " minutes.")
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
			if(sprint_running === undefined) {
                msg.channel.send("There are no sprints running.")
            } else {
                msg.channel.send(sprint_running.displayName + " is running.")
            }
            if(war_running === undefined) {
                msg.channel.send("There are no wars running.")
            } else {
                msg.channel.send(war_running.displayName + " is running.")
            }
		}
    },
    "set_goal": {
		description: "Sets a goal of w words in m minutes",
		process: function(client,msg,suffix) {
			msg.channel.send("This command is under construction.")
		}
    },
    "sprint": {
		description: "Starts a sprint of n words in m minutes",
		process: function(client,msg,suffix) {
			var args = suffix.split(" ");
            var words = args.shift();
            var start = args.shift();
            var timeout = args.shift();
            var sprint_name = args.join(' ');
            if(isNaN(parseInt(words)) || isNaN(start) || isNaN(timeout)){
                msg.channel.send("Invalid input - start interval must be numeric, word goal must be an integer")
            } else {
                try{
                    creatorID = msg.author.id;
                    startTime = start * 60000;
                    if(sprint_name == '') {
                        sprint_name = msg.author.username + "'s sprint";
                    }
                    if(sprint_running === undefined) {
                        sprint_running = new Sprint(creatorID, sprint_name, start, words, timeout, msg.channel);    
                    } else {
                        msg.channel.send("Only one sprint can run at once.");
                    }
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
                    if(war_running === undefined) {
                        war_running = new War(creatorID, war_name, start, length, msg.channel);    
                    } else {
                        msg.channel.send("Only one war can run at once.");
                    }
                } catch(e) {
                    msg.channel.send("If you are seeing this message, Winnie_Bot has gone on holiday.");
                    console.log(e);
                }
            }
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
								var usage = commands[cmd].usage;
								if(usage){
									info += " " + usage;
								}
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
							msg.author.send("**Available Commands:**").then(function(){
								var batch = "";
								var sortedCommands = Object.keys(commands).sort();
								for(var i in sortedCommands) {
									var cmd = sortedCommands[i];
									var info = "**"+config.cmd_prefix + cmd+"**";
									var usage = commands[cmd].usage;
									if(usage){
										info += " " + usage;
									}
									var description = commands[cmd].description;
									if(description instanceof Function){
										description = description();
									}
									if(description){
										info += "\n\t" + description;
									}
									var newBatch = batch + "\n" + info;
									if(newBatch.length > (1024 - 8)){ //limit message length
										msg.author.send(batch);
										batch = info;
									} else {
										batch = newBatch
									}
								}
								if(batch.length > 0){
									msg.author.send(batch);
								}
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
			msg.channel.send(cmd_data + " not recognized as a command!").then((message => message.delete(5000)))
		}
	} else {
		return
    }
});

client.login(config.token);