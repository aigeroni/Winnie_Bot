const prompts = require("./data.js");
const conn = require("mongoose").connection;

class Tools {
    constructor() {
        this.raptorCount = {};
        this.userRaptors = {};
    }

    calcTarget(msg,suffix) {
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
                    + " easy, average, or hard target.");
            } else {
                var goalPerMinute = ((Math.ceil(Math.random() * 12)
                    + base));
                var goalTotal = (goalPerMinute * time);
                msg.channel.send(msg.author + ", your target is **"
                    + goalTotal + "**.");
            }
        }
    }

    getPrompt(msg) {
        var choiceID = (Math.floor(Math.random() * prompts
            .PROMPT_LIST.length))
        msg.channel.send(msg.author + ", your prompt is: **"
            + prompts.PROMPT_LIST[choiceID].trim() + "**");
    }

    chooseItem(msg,suffix) {
        var items = suffix.split(",");
        var choiceID = (Math.floor(Math.random() * items.length));
        msg.channel.send(msg.author + ", from " + suffix + ", I selected **"
            + items[choiceID].trim() + "**");
    }

    raptor(server, channel, author, raptorChance) {
        if (!(server in this.raptorCount)) {
            this.raptorCount[server] = 0;
            conn.collection("raptorDB").update(
                {"server": server},
                {"server": server, "count": this.raptorCount[server]},
                {upsert: true}
            );
        }
        if (!(server in this.userRaptors)) {
            this.userRaptors[server] = {};
        }
        if (!(author.id in this.userRaptors[server])) {
            this.userRaptors[server][author.id] = 0;
        }
        var raptorRoll = (Math.random() * 100);
        if (raptorRoll < raptorChance) {
            this.raptorCount[server] += 1;
            this.userRaptors[server][author.id] += 1;
            conn.collection("raptorDB").update(
                {"server": server},
                {"server": server, "count": this.raptorCount[server]},
                {upsert: true}
            );
            conn.collection("raptorUserDB").update(
                {"server": server, "user": author.id},
                {"server": server, "user": author.id,
                    "count": this.userRaptors[server][author.id]},
                {upsert: true}
            );
            channel.send(author + ", you have hatched a raptor! Your server"
            + " currently houses " + this.raptorCount[server] + " raptors.");
        }
    };

    raptorStats(client,msg) {
        var raptorMsg = "__**Raptor Statistics:**__";
        var raptorOrd = this.sortCollection(this.raptorCount);
        for (var i = 0; i < raptorOrd.length; i++) {
            if (i < 10 || raptorOrd[i] == msg.guild.id) {
                raptorMsg += "\n" + (i+1) + ". *"
                + client.guilds.get(raptorOrd[i]) + ":* "
                + this.raptorCount[raptorOrd[i]];
            }
        }
        var userOrd = this.sortCollection(this.userRaptors[msg.guild.id]);
        if (this.raptorCount[msg.guild.id] > 0) {
            raptorMsg += "\n\n**Raptors by Author:**";
            for (var i = 0; i < userOrd.length; i++) {
                if (i < 10 || userOrd[i] == msg.author.id) {
                    raptorMsg += "\n" + (i+1) + ". *"
                    + client.users.get(userOrd[i]).username + ":* "
                    + this.userRaptors[msg.guild.id][userOrd[i]];
                }
            }
        }
        msg.channel.send(raptorMsg);
    }

    sortCollection(toSort) {
        var keys = Object.keys(toSort);
        keys.sort(function(x, y) {
            return toSort[y] - toSort[x];
        });
        return(keys);
    }

    rollDice(msg,suffix) {
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
                var rpgRoll = faces[i].split("d");
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
                var rangeRoll = faces[i].split(" ");
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
        if (diceSum > 0) {
            diceString += ("\nTotal = " + diceSum);
        }
        msg.channel.send(diceString);
    }
}

module.exports = new Tools();