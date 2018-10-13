exports.xsDisplay = function(msg,suffix) {
    if(suffix == "") {
        var xsType = "on";
        if (chalData.crossServerStatus[msg.guild.id] == true) {
            xsType = "off";
        }
        msg.channel.send(msg.guild.name + " currently has cross-server"
            + " challenges turned **" + xsType + "**.")
    } else {
        if(msg.member.permissions.has("ADMINISTRATOR")) {
            if(suffix == "on" || suffix == "off") {
                var xsType = "on";
                if (suffix == "off") {
                    xsType = "off";
                    chalData.crossServerStatus[msg.guild.id] = true;
                } else {
                    xsType = "on";
                    chalData.crossServerStatus[msg.guild.id] = false;
                }
                conn.collection("configDB").update(
                    {"server": msg.guild.id},
                    {$set: {"xStatus":
                        chalData.crossServerStatus[msg.guild.id]}},
                    {upsert: true}
                )
                msg.channel.send(msg.author + ", you have turned"
                    + " cross-server challenges **" + xsType + "**.");
            } else {
                msg.channel.send(msg.author + ", use **on|off** to"
                    + " toggle cross-server challenges.");
            }
        } else {
            msg.channel.send("Only server administrators are permitted"
                + " to configure challenges.");
        }
    }
}

exports.autoSum = function(msg,suffix) {
    if(suffix == "") {
        var autoType = "visible";
        if (chalData.autoSumStatus[msg.guild.id] == true) {
            autoType = "hidden";
        }
        msg.channel.send(msg.guild.name + " currently has automatic"
            + " summaries **" + autoType + "**.")
    } else {
        if(msg.member.permissions.has("ADMINISTRATOR")) {
            if(suffix == "show" || suffix == "hide") {
                var autoType = "on";
                if (suffix == "hide") {
                    autoType = "off";
                    chalData.autoSumStatus[msg.guild.id] = true;
                } else {
                    autoType = "on";
                    chalData.autoSumStatus[msg.guild.id] = false;
                }
                conn.collection("configDB").update(
                    {"server": msg.guild.id},
                    {$set: {"autoStatus":
                        chalData.autoSumStatus[msg.guild.id]}},
                    {upsert: true}
                )
                msg.channel.send(msg.author + ", you have turned"
                    + " automatic summaries **" + autoType + "**.");
            } else {
                msg.channel.send(msg.author + ", use **show|hide** to"
                    + " toggle automatic summaries.");
            }
        } else {
            msg.channel.send("Only server administrators are permitted"
                + " to configure automatic summaries.");
        }
    }
}