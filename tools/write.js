const toolData = require("./data.js");

exports.calcTarget = function(msg,suffix) {
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

exports.getPrompt = function(msg) {
    var choiceID = (Math.floor(Math.random() * toolData
        .PROMPT_LIST.length))
    msg.channel.send(msg.author + ", your prompt is: **"
        + toolData.PROMPT_LIST[choiceID].trim() + "**");
}

exports.chooseItem = function(msg,suffix) {
    var items = suffix.split(",");
    var choiceID = (Math.floor(Math.random() * items.length));
    msg.channel.send(msg.author + ", from " + suffix + ", I selected **"
        + items[choiceID].trim() + "**");
}