const goalData = require("./data.js");
const logger = require("../logger.js");

exports.setTimezone = async function(msg,suffix) {
    var timezone = suffix;
    var dateCheck = new timezoneJS.Date();
    if (suffix == "") {
        msg.channel.send(msg.author + ", I need a timezone to set!");
    } else {
        try{
            //check to see if timezone is in IANA library
            dateCheck.setTimezone(timezone)
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
        currentRoleList = msg.member.roles.filter(function (a) {
            return goalData.regionRegex.test(a.name);
        });
        //add user to role, confirm
        await msg.member.removeRoles(currentRoleList);
        msg.channel.send(msg.author + ", you have set your timezone"
            + " to **" + timezone + "**.");
        await msg.member.addRole(tzRole);
    }
}