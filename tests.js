const Discord = require('discord.js');
const client = new Discord.Client();

// !sprint <words> <delay> <timeout> [name]: Starts a sprint of <words> words in <delay> minutes which times out in <timeout> minutes with optional [name]
// Run with name - pass
msg.channel.send("!sprint");
// Run without name - pass
// Run with timeout of more than an hour - fail
// Run with floats for length, delay, and timeout - pass
// Run with string for length - fail
// Run with string for delay - fail
// Run with string for timeout - fail
// Run with negative length - fail
// Run with negative delay - fail
// Run with negative timeout - fail
// Run with executable code as the length - fail
// Run with executable code as the delay - fail
// Run with executable code as the timeout - fail
// Run with executable code as the name - fail
//Run with length and delay, but no timeout - fail
//Run with length, but no delay - fail
//Run with no suffix - fail

// !war <length> <delay> [name]: Starts a word war of <length> minutes in <delay> minutes with optional [name]
// Run with name - pass
// Run without name - pass
// Run with length of more than an hour - fail
// Run with floats for length and delay - pass
// Run with string for length - fail
// Run with string for delay - fail
// Run with negative length - fail
// Run with negative delay - fail
// Run with executable code as the length - fail
// Run with executable code as the delay - fail
// Run with executable code as the name - fail
// Run with length, but no delay - fail
// Run with no suffix - fail

// !join <id>: Joins war/sprint with ID <id>
// Run with ID of war not joined - pass
// Run with ID of war already joined - fail
// Run with negative integer ID - fail
// Run with float ID - fail
// Run with string ID - fail
// Run with executable code - fail
// Run with no suffix - fail

// !leave <id>: Leaves war/sprint with ID <id>
// Run with ID of war not joined - fail
// Run with ID of war already joined - pass
// Run with negative integer ID - fail
// Run with float ID - fail
// Run with string ID - fail
// Run with executable code - fail
// Run with no suffix - fail

// !exterminate <id>: Ends war/sprint with ID <id>. Can only be performed by creator.
// Run with ID of war not created - fail
// Run with ID of war created by someone else - fail
// Run from a different server - fail
// Run with ID of war created by user - pass
// Run with negative integer ID - fail
// Run with float ID - fail
// Run with string ID - fail
// Run with executable code - fail
// Run with no suffix - fail

// !total <id> <total> [pages/lines]: Adds your <total> for completed challenge <id>, optional [pages/lines] for scriptwriters
// Run without joining war - fail
// Run with ID of war not created - fail
// Run with floating-point ID - fail
// Run with string ID - fail
// Run with goal in pages - pass
// Run with total in lines - pass
// Run with total in words - pass
// Run with total - pass
// Run with a floating-point total - fail
// Run with a floating-point total in lines - pass
// Run with a floating-point total in pages - pass
// Run with a negative total - fail
// Run with a string total - fail
// Run with executable code - fail
// Run with no suffix - fail

// !summary <id>: Shows the summary for completed challenge <id>
// Run with ID of existing war - pass
// Run with ID of non-existing war - fail
// Run with negative integer ID - fail
// Run with float ID - fail
// Run with string ID - fail
// Run with executable code - fail
// Run with no suffix - fail
// !list : Lists all running sprints/wars
// Run - pass
// Run with executable code - fail
// Run with a suffix - fail

// !target <easy/average/hard> <time>: Generates an <easy/average/hard> target for <time> minutes
// Run with no difficulty - fail
// Run with no time - fail
// Run with easy target - pass
// Run with average target - pass
// Run with hard target - pass
// Run with -1 target - fail
// Run with ‘string’ target - fail
// Run with executable code as difficulty - fail
// Run with executable code as time - fail
// Run with no suffix - fail
// !set <words>: Sets a daily goal of <words>
// Run with goal already set - fail
// Run with goal in minutes - pass
// Run with goal in pages - pass
// Run with goal in lines - pass
// Run with goal in words - pass
// Run with goal in number - fail
// Run with goal in string - fail
// Run with goal - pass
// Run with floating-point goal - fail
// Run with executable code as goal - fail
// Run with no suffix - fail

// !timezone <IANA timezone identifier>: Sets your <IANA timezone identifier>
// Run !timezone administrator - angry error message
// Run with timezone already set - overwrite
// Run with IANA canonical timezone - pass
// Run with IANA alias timezone - fail
// Run with IANA deprecated timezone - fail
// Run with number input - fail
// Run with string input - fail
// Run with executable code - fail
// Run with no suffix - fail

// !update <words>: Updates your daily goal with the number of <words> you have completed since your last update
// Run without goal set - fail
// Run with goal in minutes set - pass
// Run with goal in pages set - pass
// Run with goal in lines set - pass
// Run with goal in words set - pass
// Run with goal set - pass
// Run with goal in minutes progressed - add
// Run with goal in pages progressed - add
// Run with goal in lines progressed - add
// Run with goal in words progressed - add
// Run with goal progressed - add
// Run with executable code - fail
// Run with a suffix - fail

// !progress <words>: Updates your daily goal with the total number of <words> you have completed today
// Run without goal set - fail
// Run with goal in minutes set - pass
// Run with goal in pages set - pass
// Run with goal in lines set - pass
// Run with goal in words set - pass
// Run with goal set - pass
// Run with goal in minutes progressed - overwrite
// Run with goal in pages progressed - overwrite
// Run with goal in lines progressed - overwrite
// Run with goal in words progressed - overwrite
// Run with goal progressed - overwrite
// Run with executable code - fail
// Run with suffix - fail

// !reset : Resets your daily goal
// Run with no goal set - fail
// Run with goal set - pass
// Run with executable code - fail
// Run with suffix - fail

// !prompt : Provides a writing prompt
// Run - pass
// Run with executable code - fail
// Run with suffix - fail

// !goalinfo : Displays progress towards your daily goal
// Run without goal set - fail
// Run with goal in minutes set - pass
// Run with goal in pages set - pass
// Run with goal in lines set - pass
// Run with goal in words set - pass
// Run with goal set - pass
// Run with goal in minutes progressed - pass
// Run with goal in pages progressed - pass
// Run with goal in lines progressed - pass
// Run with goal in words progressed - pass
// Run with goal progressed - pass
// Run with executable code - fail
// Run with suffix - fail
// !roll <x> [y], <x>d<y>: Rolls a die
// !roll <number> - pass
// !roll <number> <number> - pass
// !roll <number>d<number> - pass
// !roll <large number>d<number> - fail
// Run with executable code - fail
// Run without suffix - fail

// !choose <list>: Selects an item from a list <list> of items, separated by commas
// Run without suffix - fail
// Run with a single item - fail
// Run with multiple items, separated with the wrong delineator - fail
// Run with multiple comma-separated items - pass
// Run with executable code - fail

// Pen testing:
// Use commands to add roles
// Use commands to crash bot
// Use commands to send rude messages
// Use commands to send DMs with malicious links

process.on('uncaughtException', function(e) {
    logger.info('Error %s: %s.\nWinnie_Bot will now restart.', e, e.stack);
    process.exit(1);
  })

client.login(config.test_token);