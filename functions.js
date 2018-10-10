var raptorCount = {};
var userRaptors = {};

exports.raptorCount = raptorCount;
exports.userRaptors = userRaptors;

exports.raptor = function(server, channel, author, raptorChance) {
    if (!(server in raptorCount)) {
        raptorCount[server] = 0;
        conn.collection("raptorDB").update(
            {"server": server},
            {"server": server, "count": raptorCount[server]},
            {upsert: true}
        );
    }
    if (!(server in userRaptors)) {
        userRaptors[server] = {};
    }
    if (!(author.id in userRaptors[server])) {
        userRaptors[server][author.id] = 0;
    }
    var raptorRoll = (Math.random() * 100);
    if (raptorRoll < raptorChance) {
        raptorCount[server] += 1;
        userRaptors[server][author.id] += 1;
        conn.collection("raptorDB").update(
            {"server": server},
            {"server": server, "count": raptorCount[server]},
            {upsert: true}
        );
        conn.collection("raptorUserDB").update(
            {"server": server, "user": author.id},
            {"server": server, "user": author.id,
                "count": userRaptors[server][author.id]},
            {upsert: true}
        );
        channel.send(author + ", you have hatched a raptor! Your server"
        + " currently houses " + raptorCount[server] + " raptors.");
    }
};

exports.sortCollection = function(toSort) {
    var keys = Object.keys(toSort);
    keys.sort(function(x, y) {
        return toSort[y] - toSort[x];
    });
    return(keys);
}