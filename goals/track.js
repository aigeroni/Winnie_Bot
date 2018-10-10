const goalData = require("./data.js");

exports.setGoal = function(msg,suffix) {
    var args = suffix.split(" ");
    var goal = args.shift();
    var goalType = args.shift();
    if (goal === undefined || goal == "") {
        msg.channel.send("I need a goal to set!");
    } else if(!Number.isInteger(Number(goal))){
        msg.channel.send("Your goal must be a whole"
            + " number.");
    } else if((msg.author.id in goalData.goalList)) {
        msg.channel.send(msg.author + ", you have already set a goal"
            + " today. Use !update/!progress to record your progress.");
    } else {
        if (writtenType == "line" || writtenType == "page"
            || writtenType == "word" || writtenType == "minute") {
            writtenType += "s";
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
                var tzRole = msg.member.roles.filter(function (a) {
                    return regionRegex.test(a.name);
                });
                var userTZ = tzRole.first().name;
                //get current time
                var startTime = new timezoneJS.Date();
                startTime.setTimezone(userTZ);
                //calculate next midnight based on timezone
                var endTime = new timezoneJS.Date();
                endTime.setTimezone(userTZ);
                endTime.setHours(24,0,0,0);
                goalData.goalList[msg.author.id] = new goalClass.Goal
                    (msg.author.id, goal, goalType, 0,
                    startTime.getTime(), endTime.getTime(),
                    msg.channel.id);
                msg.channel.send(msg.author + ", your goal for today"
                    + " is **" + goal + "** " + goalType + ".");
            } catch(e) {
                msg.channel.send(msg.author + ", you need to set your"
                    + " timezone before setting a daily goal."
                    + " Use the !timezone command to do so.");
            }
        }
    }
}

exports.updateGoal = function(msg,suffix,overwrite) {
    var goal = suffix;
    if (suffix == "") {
        msg.channel.send(msg.author + ", I need an amount of progress"
            + " to update!");
    } else if(!Number.isInteger(Number(goal))){
        msg.channel.send("Invalid input. Your goal must be a whole"
            + " number.");
    } else if(!(msg.author.id in goalData.goalList)) {
        msg.channel.send(msg.author + ", you have not yet set a goal"
            + " for today. Use !set to do so.");
    } else {
        goalData.goalList[msg.author.id].addWords(goal, overwrite);
        msg.channel.send(msg.author + ", you have written **"
            + goalData.goalList[msg.author.id].written + "** "
            + goalData.goalList[msg.author.id].goalType + " of your **"
            + goalData.goalList[msg.author.id].goal + "**-"
            + goalData.goalList[msg.author.id].goalType.slice(0, -1)
            + " goal.");
    }
}

exports.resetGoal = function(msg) {
    if(!(msg.author.id in goalData.goalList)) {
        msg.channel.send(msg.author + ", you have not yet set a goal"
            + " for today. Use !set to do so.");
    } else {
        conn.collection("goalDB").remove(
            {authorID: msg.author.id}
        );
        delete goalData.goalList[msg.author.id];

        msg.channel.send(msg.author + ", you have successfully reset"
            + " your daily goal.");
    }
}

exports.viewGoal = function(msg) {
    if(!(msg.author.id in goalData.goalList)) {
        msg.channel.send(msg.author + ", you have not yet set a goal"
            + " for today. Use !set to do so.");
    } else {
        msg.channel.send(msg.author + ", you have written **"
            + goalData.goalList[msg.author.id].written + "** "
            + goalData.goalList[msg.author.id].goalType + " of your **"
            + goalData.goalList[msg.author.id].goal + "**-"
            + goalData.goalList[msg.author.id].goalType.slice(0, -1)
            + " goal.");
    }
}