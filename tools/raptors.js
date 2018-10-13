const toolData = require("./data.js");

exports.raptor = function(server, channel, author, raptorChance) {
    if (!(server in toolData.raptorCount)) {
        toolData.raptorCount[server] = 0;
        conn.collection("raptorDB").update(
            {"server": server},
            {"server": server, "count": toolData.raptorCount[server]},
            {upsert: true}
        );
    }
    if (!(server in toolData.userRaptors)) {
        toolData.userRaptors[server] = {};
    }
    if (!(author.id in toolData.userRaptors[server])) {
        toolData.userRaptors[server][author.id] = 0;
    }
    var raptorRoll = (Math.random() * 100);
    if (raptorRoll < raptorChance) {
        toolData.raptorCount[server] += 1;
        toolData.userRaptors[server][author.id] += 1;
        conn.collection("raptorDB").update(
            {"server": server},
            {"server": server, "count": toolData.raptorCount[server]},
            {upsert: true}
        );
        conn.collection("raptorUserDB").update(
            {"server": server, "user": author.id},
            {"server": server, "user": author.id,
                "count": toolData.userRaptors[server][author.id]},
            {upsert: true}
        );
        channel.send(author + ", you have hatched a raptor! Your server"
        + " currently houses " + toolData.raptorCount[server] + " raptors.");
    }
};

exports.raptorStats = function(client,msg) {
    var raptorMsg = "__**Raptor Statistics:**__\n";
    var raptorOrd = sortCollection(toolData.raptorCount);
    for (var i = 0; i < 10; i++) {
        if (raptorOrd[i] === undefined) {
            break;
        }
        raptorMsg += "\n" + (i+1) + ". *"
            + client.guilds.get(raptorOrd[i]) + ":* "
            + toolData.raptorCount[raptorOrd[i]];
    }
    msg.channel.send(raptorMsg);
    var userOrd = sortCollection(toolData.userRaptors[msg.guild.id]);
    if (toolData.raptorCount[msg.guild.id] > 0) {
        var userRaptorMsg = "**Raptors by Author:**";
        for (var i = 0; i < 10; i++) {
            if (userOrd[i] === undefined) {
                break;
            }
            userRaptorMsg += "\n" + (i+1) + ". *"
                + client.users.get(userOrd[i]).username + ":* "
                + toolData.userRaptors[msg.guild.id][userOrd[i]];
        }
        msg.channel.send(userRaptorMsg);
    }
}

sortCollection = function(toSort) {
    var keys = Object.keys(toSort);
    keys.sort(function(x, y) {
        return toSort[y] - toSort[x];
    });
    return(keys);
}