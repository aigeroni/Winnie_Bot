exports.rollDice = function(msg,suffix) {
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
            rpgRoll = faces[i].split("d");
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
            rangeRoll = faces[i].split(" ");
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
    msg.channel.send(diceString);
    if (diceSum > 0) {
        msg.channel.send("Total = " + diceSum);
    }
}