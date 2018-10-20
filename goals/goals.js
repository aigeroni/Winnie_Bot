const goallist = require("./goallist.js");
const Goal = require("./goal");
const timezoneJS = require("timezone-js");
const logger = require("../logger.js");
const conn = require("mongoose").connection;

class Goals {
    constructor() {
        this.regionRegex = /^(Africa|America|Antarctica|Asia|Atlantic|Australia|Europe|Indian|Pacific|Etc)/;
    }

    regexCheck(roleList) {
        return this.test(roleList.name);
    }

    async setTimezone(msg,suffix) {
        var timezone = suffix;
        var dateCheck = new timezoneJS.Date();
        if (suffix == "") {
            msg.channel.send(msg.author + ", I need a timezone to set!");
        } else {
            try{
                //check to see if timezone is in IANA library
                dateCheck.setTimezone(timezone);
            } catch(e) {
                if (e.code == "ENOENT") {
                    await msg.channel.send("Fatal error. Please contact"
                        + " your server admin.");
                    await logger.error("Fatal error %s: %s.  Winnie_Bot"
                        + " cannot locate required files.\nWinnie_Bot will"
                        + " now terminate.");
                    process.exit(1);
                } else {
                    msg.channel.send("Winnie_Bot accepts IANA timezone"
                        + " identifiers only.  For detailed information"
                        + " about IANA timezone identifiers, go here:"
                        + " https://en.wikipedia.org/wiki/Tz_database");
                }
                return false;
            }
            //check entered timezone against regex
            if (!(this.regionRegex.test(timezone))){
                msg.channel.send("Winnie_Bot accepts IANA timezone"
                    + " identifiers only.  For detailed information"
                    + " about IANA timezone identifiers, go here:"
                    + " https://en.wikipedia.org/wiki/Tz_database");
                return false;
            }
            //create new role if needed, find role ID
            try {
                if (msg.guild.roles.find("name", timezone) === null){
                    await msg.guild.createRole({name: timezone});
                }
            } catch(e) {
                if (e.code == 50013) {
                    msg.channel.send("Winnie requires the Manage Roles"
                        + " permission to set timezones.  Please contact"
                        + " your server admin.");
                } else {
                    msg.channel.send("Unknown error. Check log file for"
                        + " details.");
                }
                return false;
            }
            var tzRole = msg.guild.roles.find("name", timezone);
            //get timezone
            var currentRoleList = msg.member.roles.filter(this.regexCheck,
                this.regionRegex);
            //add user to role, confirm
            await msg.member.removeRoles(currentRoleList);
            msg.channel.send(msg.author + ", you have set your timezone"
                + " to **" + timezone + "**.");
            await msg.member.addRole(tzRole);
        }
    }

    setGoal(msg,suffix) {
        var args = suffix.split(" ");
        var goal = args.shift();
        var goalType = args.shift();
        if (goal === undefined || goal == "") {
            msg.channel.send("I need a goal to set!");
        } else if(!Number.isInteger(Number(goal))){
            msg.channel.send("Your goal must be a whole"
                + " number.");
        } else if((msg.author.id in goallist.goalList)) {
            msg.channel.send(msg.author + ", you have already set a goal"
                + " today. Use !update/!progress to record your progress.");
        } else {
            if (goalType == "line" || goalType == "page"
                || goalType == "word" || goalType == "minute") {
                goalType += "s";
            }   
            if (!(goalType == "lines" || goalType == "pages" ||
                goalType == "minutes" || goalType == "words" ||
                goalType === undefined)) {
                msg.channel.send("Goal type must be words, lines, pages, or"
                    + " minutes.");
            } else {
                if (goalType === undefined) {
                    goalType = "words";
    
                }
                try {
                    //get timezone
                    var tzRole = msg.member.roles.filter(this.regexCheck,
                        this.regionRegex);
                    var userTZ = tzRole.first().name;
                    //get current time
                    var startTime = new timezoneJS.Date();
                    startTime.setTimezone(userTZ);
                    //calculate next midnight based on timezone
                    var endTime = new timezoneJS.Date();
                    endTime.setTimezone(userTZ);
                    endTime.setHours(24,0,0,0);
                    goallist.goalList[msg.author.id] = new Goal
                        (msg.author.id, goal, goalType, 0,
                        startTime.getTime(), endTime.getTime(),
                        msg.channel.id);
                    msg.channel.send(msg.author + ", your goal for today"
                        + " is **" + goal + "** " + goalType + ".");
                } catch(e) {
                    logger.info(e, e.stack);
                    msg.channel.send(msg.author + ", you need to set your"
                        + " timezone before setting a daily goal."
                        + " Use the !timezone command to do so.");
                }
            }
        }
    }
    
    updateGoal(msg,suffix,overwrite) {
        var goal = suffix;
        if (suffix == "") {
            msg.channel.send(msg.author + ", I need an amount of progress"
                + " to update!");
        } else if(!Number.isInteger(Number(goal))){
            msg.channel.send("Invalid input. Your goal must be a whole"
                + " number.");
        } else if(!(msg.author.id in goallist.goalList)) {
            msg.channel.send(msg.author + ", you have not yet set a goal"
                + " for today. Use !set to do so.");
        } else {
            goallist.goalList[msg.author.id].addWords(goal, overwrite);
            msg.channel.send(msg.author + ", you have written **"
                + goallist.goalList[msg.author.id].written + "** "
                + goallist.goalList[msg.author.id].goalType + " of your **"
                + goallist.goalList[msg.author.id].goal + "**-"
                + goallist.goalList[msg.author.id].goalType.slice(0, -1)
                + " goal.");
        }
    }
    
    resetGoal(msg) {
        if(!(msg.author.id in goallist.goalList)) {
            msg.channel.send(msg.author + ", you have not yet set a goal"
                + " for today. Use !set to do so.");
        } else {
            conn.collection("goalDB").remove(
                {authorID: msg.author.id}
            );
            delete goallist.goalList[msg.author.id];
    
            msg.channel.send(msg.author + ", you have successfully reset"
                + " your daily goal.");
        }
    }
    
    viewGoal(msg) {
        if(!(msg.author.id in goallist.goalList)) {
            msg.channel.send(msg.author + ", you have not yet set a goal"
                + " for today. Use !set to do so.");
        } else {
            msg.channel.send(msg.author + ", you have written **"
                + goallist.goalList[msg.author.id].written + "** "
                + goallist.goalList[msg.author.id].goalType + " of your **"
                + goallist.goalList[msg.author.id].goal + "**-"
                + goallist.goalList[msg.author.id].goalType.slice(0, -1)
                + " goal.");
        }
    }
}

module.exports = new Goals();