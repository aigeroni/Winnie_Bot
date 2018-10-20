const Discord = require('discord.js');
const config = require('./config.json');
const client = new Discord.Client();

// TODO: Mock necessary parts of Discord client, improve tests

/** Run test function
 * @param {Promise} x - Promise for async functions
 * @return {Promise} - test details
 */
function runTest(x) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(x);
    }, 10000);
  });
}

/** Sprint test function
 * @return {Promise} - test details
 */
async function sprintTest() {
  try {
    const guildObj = client.guilds.first();
    // Run with name - pass
    await runTest(guildObj.defaultChannel.send('!sprint 200 10 1'
      + ' Named Sprint'));
    // Run without name - pass
    await runTest(guildObj.defaultChannel.send('!sprint 200 10 1'));
    // Run with no delay - pass, 1 minute delay
    await runTest(guildObj.defaultChannel.send('!sprint 200 10'));
    // Run starting immediately - pass
    await runTest(guildObj.defaultChannel.send('!sprint 200 10 0'));
    // Run with timeout of more than an hour - error
    // Sprints cannot run for more than an hour'
    await runTest(guildObj.defaultChannel.send('!sprint 200 70 1'));
    // Run with float for goal - error 'Word goal must be a whole number'
    await runTest(guildObj.defaultChannel.send('!sprint 200.6 10 1'));
    // Run with floats for delay and timeout - pass
    await runTest(guildObj.defaultChannel.send('!sprint 200 10.1 1.5'));
    // Run with string for goal - error 'Word goal must be a whole number'
    await runTest(guildObj.defaultChannel.send('!sprint hundred 10 1'));
    // Run with string for delay - error 'Time to start must be a number'
    await runTest(guildObj.defaultChannel.send('!sprint 200 10 one'));
    // Run with string for timeout - error 'Sprint duration must be a number'
    await runTest(guildObj.defaultChannel.send('!sprint 200 ten 1'));
    // Run with negative goal - error 'Word goal cannot be negative'
    await runTest(guildObj.defaultChannel.send('!sprint -200 10 1'));
    // Run with negative delay - error 'Sprints cannot start in the past'
    await runTest(guildObj.defaultChannel.send('!sprint 200 10 -1'));
    // Run with negative timeout - error
    // 'Sprints cannot run for a negative amount of time'
    await runTest(guildObj.defaultChannel.send('!sprint 200 -10 1'));
    // Run with executable code as the goal - error
    // 'Word goal must be a whole number'
    await runTest(guildObj.defaultChannel.send('!sprint'
      + ' guildObj.defaultChannel.send(' + '"XSS"' + '); 10 1'));
    // Run with executable code as the timeout - error
    // 'Sprint duration must be a number'
    await runTest(guildObj.defaultChannel.send('!sprint 200'
      + ' guildObj.defaultChannel.send(' + '"XSS"' + '); 1'));
    // Run with executable code as the delay - error
    // 'Time to start must be a number'
    await runTest(guildObj.defaultChannel.send('!sprint 200 10'
      + ' guildObj.defaultChannel.send(' + '"XSS"' + ');'));
    // Run with executable code as the name - fail to execute code
    await runTest(guildObj.defaultChannel.send('!sprint 200 10 1'
      + ' guildObj.defaultChannel.send(' + '"XSS"' + ');'));
    // Run with no suffix - gives help message ***not working***
    await runTest(guildObj.defaultChannel.send('!sprint'));
  } catch (e) {
    console.log('Error: %s, %s', e, e.stack);
  }
}

/** War test function
 * @return {Promise} - test details
 */
async function warTest() {
  try {
    const guildObj = client.guilds.first();
    // Run with name - pass
    await runTest(guildObj.defaultChannel.send('!war 10 1 Named War'));
    // Run without name - pass
    await runTest(guildObj.defaultChannel.send('!war 10 1'));
    // Run starting immediately - pass
    await runTest(guildObj.defaultChannel.send('!war 10 0'));
    // Run with no delay - pass, 1 minute delay
    await runTest(guildObj.defaultChannel.send('!war 10'));
    // Run with timeout of more than an hour - error
    // 'Wars cannot run for more than an hour'
    await runTest(guildObj.defaultChannel.send('!war 70 1'));
    // Run with floats for delay and timeout - pass
    await runTest(guildObj.defaultChannel.send('!war 10.1 1.5'));
    // Run with string for delay - error 'Time to start must be a number'
    await runTest(guildObj.defaultChannel.send('!war 10 one'));
    // Run with string for duration - error 'War duration must be a number'
    await runTest(guildObj.defaultChannel.send('!war ten 1'));
    // Run with negative delay - error 'Wars cannot start in the past'
    await runTest(guildObj.defaultChannel.send('!war 200 10 -1'));
    // Run with negative duration - error
    // 'Wars cannot run for a negative amount of time'
    await runTest(guildObj.defaultChannel.send('!war 200 -10 1'));
    // Run with executable code as the timeout - error
    // 'War duration must be a number'
    await runTest(guildObj.defaultChannel.send('!war'
      + ' guildObj.defaultChannel.send(' + '"XSS"' + '); 1'));
    // Run with executable code as the delay - error
    // 'Time to start must be a number'
    await runTest(guildObj.defaultChannel.send('!war 10'
      + ' guildObj.defaultChannel.send(' + '"XSS"' + ');'));
    // Run with executable code as the name - fail to execute code
    await runTest(guildObj.defaultChannel.send('!war 10 1'
      + ' guildObj.defaultChannel.send(' + '"XSS"' + ');'));
    // Run with no suffix - gives help message ***not working***
    await runTest(guildObj.defaultChannel.send('!war'));
  } catch (e) {
    console.log('Error: %s, %s', e, e.stack);
  }
}

/** Join and leave test function
 * @return {Promise} - test details
 */
async function joinLeaveTest() {
  try {
    const guildObj = client.guilds.first();
    // Start war to test
    await runTest(guildObj.defaultChannel.send('!war 3 0 Join Test'));
    // Run with ID of war not joined - pass
    await runTest(guildObj.defaultChannel.send('!join 1'));
    // Run with ID of war already joined - error
    // 'You already have notifications enabled for this challenge'
    await runTest(guildObj.defaultChannel.send('!join 1'));
    // Run with ID of nonexistent war - error 'Challenge does not exist!'
    await runTest(guildObj.defaultChannel.send('!join 2'));
    // Run with negative integer ID - error 'Challenge ID must be an integer'
    await runTest(guildObj.defaultChannel.send('!join -1'));
    // Run with float ID - error 'Challenge ID must be an integer'
    await runTest(guildObj.defaultChannel.send('!join 0.1'));
    // Run with string ID - error 'Challenge ID must be an integer'
    await runTest(guildObj.defaultChannel.send('!join one'));
    // Run with executable code - fail to execute code
    await runTest(guildObj.defaultChannel.send('!join'
      + ' guildObj.defaultChannel.send(' + '"XSS"' + ');'));
    // Run with no suffix - gives help message ***not working***
    await runTest(guildObj.defaultChannel.send('!join'));
    // Run with ID of war not left - pass
    await runTest(guildObj.defaultChannel.send('!leave 1'));
    // Run with ID of war already left - fail
    await runTest(guildObj.defaultChannel.send('!leave 1'));
    // Run with ID of nonexistent war - error 'Challenge does not exist!'
    await runTest(guildObj.defaultChannel.send('!leave 2'));
    // Run with negative integer ID - error 'Challenge ID must be an integer'
    await runTest(guildObj.defaultChannel.send('!leave -1'));
    // Run with float ID - error 'Challenge ID must be an integer'
    await runTest(guildObj.defaultChannel.send('!leave 0.1'));
    // Run with string ID - error 'Challenge ID must be an integer'
    await runTest(guildObj.defaultChannel.send('!leave one'));
    // Run with executable code - fail to execute code
    await runTest(guildObj.defaultChannel.send('!join'
      + ' guildObj.defaultChannel.send(' + '"XSS"' + ');'));
    // Run with no suffix - gives help message ***not working***
    await runTest(guildObj.defaultChannel.send('!join'));
    // Run with ID of created war - pass
    await runTest(guildObj.defaultChannel.send('!exterminate 1'));
    // Run with ID of war already deleted - fail
    await runTest(guildObj.defaultChannel.send('!exterminate 1'));
    // Run with ID of war created by someone else - fail
    await runTest(guildObj.defaultChannel.send('!exterminate 2'));
    // Run with ID of nonexistent war - error 'Challenge does not exist!'
    await runTest(guildObj.defaultChannel.send('!exterminate 3'));
    // Run with negative integer ID - error 'Challenge ID must be an integer'
    await runTest(guildObj.defaultChannel.send('!exterminate -1'));
    // Run with float ID - error 'Challenge ID must be an integer'
    await runTest(guildObj.defaultChannel.send('!exterminate 0.1'));
    // Run with string ID - error 'Challenge ID must be an integer'
    await runTest(guildObj.defaultChannel.send('!exterminate one'));
    // Run with executable code - fail to execute code
    await runTest(guildObj.defaultChannel.send('!exterminate'
      + ' guildObj.defaultChannel.send(' + '"XSS"' + ');'));
    // Run with no suffix - gives help message ***not working***
    await runTest(guildObj.defaultChannel.send('!exterminate'));
    // Run from a different server - fail
  } catch (e) {
    console.log('Error: %s, %s', e, e.stack);
  }
}

/** Summary test function
 * @return {Promise} - test details
 */
async function summaryTest() {
  try {
    const guildObj = client.guilds.first();
    // Start war to test - need to create 5 wars
    await runTest(guildObj.defaultChannel.send('!war 3 0 Summary Test'));
    // Run with ID of war not joined - pass
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
    // Run - pass
    await runTest(guildObj.defaultChannel.send('!prompt'));
    // Run with executable code - fail
    await runTest(guildObj.defaultChannel.send('!prompt'
      + ' guildObj.defaultChannel.send(' + '"XSS"' + ');'));
    // Run with suffix - fail
    await runTest(guildObj.defaultChannel.send('!prompt text'));
  } catch (e) {
    console.log('Error: %s, %s', e, e.stack);
  }
}

/** Timezone test function
 * @return {Promise} - test details
 */
async function tzTest() {
  try {
    const guildObj = client.guilds.first();
    // Run !timezone administrator - angry error message
    await runTest(guildObj.defaultChannel.send('!timezone admin'));
    // Run with IANA canonical timezone - pass
    await runTest(guildObj.defaultChannel.send('!timezone Etc/GMT'));
    // Run with IANA alias timezone - fail
    await runTest(guildObj.defaultChannel.send('!timezone Etc/GMT+0'));
    // Run with IANA deprecated timezone - fail
    await runTest(guildObj.defaultChannel.send('!timezone Poland'));
    // Run with number input - fail
    await runTest(guildObj.defaultChannel.send('!timezone 10'));
    // Run with string input - fail
    await runTest(guildObj.defaultChannel.send('!timezone Etc'));
    // Run with executable code - fail
    await runTest(guildObj.defaultChannel.send('!timezone'
      + ' guildObj.defaultChannel.send(' + '"XSS"' + ');'));
    // Run without suffix - display help message **not working**
    await runTest(guildObj.defaultChannel.send('!timezone'));
  } catch (e) {
    console.log('Error: %s, %s', e, e.stack);
  }
}

/** Goal test function
 * @return {Promise} - test details
 */
async function goalTest() {
  try {
    const guildObj = client.guilds.first();
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

    // Run with no goal set - fail
    // Run with goal set - pass
    // Run with executable code - fail
    // Run with suffix - fail

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
    // Run - pass
    await runTest(guildObj.defaultChannel.send('!prompt'));
    // Run with executable code - fail
    await runTest(guildObj.defaultChannel.send('!prompt'
      + ' guildObj.defaultChannel.send(' + '"XSS"' + ');'));
    // Run with suffix - fail
    await runTest(guildObj.defaultChannel.send('!prompt one'));
  } catch (e) {
    console.log('Error: %s, %s', e, e.stack);
  }
}

/** Target test function
 * @return {Promise} - test details
 */
async function targetTest() {
  try {
    const guildObj = client.guilds.first();
    // Run with no difficulty - fail
    await runTest(guildObj.defaultChannel.send('!target 15'));
    // Run with no time - fail
    await runTest(guildObj.defaultChannel.send('!target easy'));
    // Run with easy target - pass
    await runTest(guildObj.defaultChannel.send('!target easy 15'));
    // Run with average target - pass
    await runTest(guildObj.defaultChannel.send('!target average 15'));
    // Run with hard target - pass
    await runTest(guildObj.defaultChannel.send('!target hard 15'));
    // Run with -1 target - fail
    await runTest(guildObj.defaultChannel.send('!target easy -1'));
    // Run with ‘string’ target - fail
    await runTest(guildObj.defaultChannel.send('!target easy fifteen'));
    // Run with integer difficulty - fail
    await runTest(guildObj.defaultChannel.send('!target 1 15'));
    // Run with executable code as difficulty - fail
    await runTest(guildObj.defaultChannel.send('!target'
      + ' guildObj.defaultChannel.send(' + '"XSS"' + '); 15'));
    // Run with executable code as time - fail
    await runTest(guildObj.defaultChannel.send('!target easy'
      + ' guildObj.defaultChannel.send(' + '"XSS"' + ');'));
    // Run without suffix - display help message **not working**
    await runTest(guildObj.defaultChannel.send('!target'));
  } catch (e) {
    console.log('Error: %s, %s', e, e.stack);
  }
}

/** Roll test function
 * @return {Promise} - test details
 */
async function rollTest() {
  try {
    const guildObj = client.guilds.first();
    // Roll a die - pass
    await runTest(guildObj.defaultChannel.send('!roll 6'));
    // Roll a range - pass
    await runTest(guildObj.defaultChannel.send('!roll 3 6'));
    // Roll multiple dice - pass
    await runTest(guildObj.defaultChannel.send('!roll 2d6'));
    // Roll a very large number of dice - fail
    await runTest(guildObj.defaultChannel.send('!roll 2000d6'));
    // Run with executable code - fail
    await runTest(guildObj.defaultChannel.send('!roll'
      + ' guildObj.defaultChannel.send(' + '"XSS"' + ');'));
    // Run without suffix - display help message **not working**
    await runTest(guildObj.defaultChannel.send('!roll'));
  } catch (e) {
    console.log('Error: %s, %s', e, e.stack);
  }
}

/** Prompt test function
 * @return {Promise} - test details
 */
async function promptTest() {
  try {
    const guildObj = client.guilds.first();
    // Run - pass
    await runTest(guildObj.defaultChannel.send('!prompt'));
    // Run with executable code - fail
    await runTest(guildObj.defaultChannel.send('!prompt'
      + ' guildObj.defaultChannel.send(' + '"XSS"' + ');'));
    // Run with suffix - fail
    await runTest(guildObj.defaultChannel.send('!prompt text'));
  } catch (e) {
    console.log('Error: %s, %s', e, e.stack);
  }
}

/** Choose test function
 * @return {Promise} - test details
 */
async function chooseTest() {
  try {
    const guildObj = client.guilds.first();
    // Run with a single item - fail
    await runTest(guildObj.defaultChannel.send('!choose one two three'));
    // Run with multiple items, separated with the wrong delineator - fail
    await runTest(guildObj.defaultChannel.send('!choose one; two; three'));
    // Run with multiple comma-separated items - pass
    await runTest(guildObj.defaultChannel.send('!choose one, two, three'));
    // Run with executable code - fail
    await runTest(guildObj.defaultChannel.send('!choose'
      + ' guildObj.defaultChannel.send(' + '"XSS"' + ');'));
    // Run without suffix - display help message **not working**
    await runTest(guildObj.defaultChannel.send('!choose'));
  } catch (e) {
    console.log('Error: %s, %s', e, e.stack);
  }
}

/** Test function
 * @return {Promise} - test details
 */
async function startTest() {
  await client.login(config.test_token);
  sprintTest();
  warTest();
  joinLeaveTest();
  summaryTest();
  tzTest();
  goalTest();
  targetTest();
  rollTest();
  promptTest();
  chooseTest();
}

startTest();
