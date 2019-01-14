/** Class containing functions to handle rolling dice. */
class Dice {
  /** Initialise variables for tool management. */
  constructor() {
  }
  /**
   * Roll dice according to the user's specifications.
   * @param {String} prefix - The bot's prefix.
   * @param {String} suffix - Information after the bot command.
   * @return {String} - The message to send to the user.
   */
  rollDice(prefix, suffix) {
    let diceString = '';
    let diceSum = 0;
    const faces = suffix.split('+');
    for (let i = 0; i < faces.length; i++) {
      if (Number.isInteger(Number(faces[i]))) {
        // Single number
        if (faces.length == 1) {
          // Treat as a 1dx roll
          const roll = Math.floor(Math.random() * Number(faces[i])) + 1;
          diceString += roll;
          diceSum += roll;
        } else {
          // Add to the other rolls
          diceString += '(' + Number(faces[i]) + ')';
          diceSum += Number(faces[i]);
        }
      } else if (faces[i].split('d').length == 2) {
        // RPG-style roll
        const rpgRoll = faces[i].split('d');
        if (rpgRoll[0] == '') {
          rpgRoll[0] = 1;
        }
        if (
          !Number.isInteger(Number(rpgRoll[0])) ||
          !Number.isInteger(Number(rpgRoll[1]))
        ) {
          diceString =
            '**Error:**: Both values in an RPG-style roll must be integers.' +
            ' Example: `' +
            prefix +
            'roll 2d6`.';
          diceSum = 0;
          break;
        } else {
          if (rpgRoll[0] > 20) {
            diceString = '**Error:**: I cannot roll more than 20 dice at once.';
            diceSum = 0;
            break;
          } else {
            for (let j = 0; j < Number(rpgRoll[0]); j++) {
              const roll = Math.floor(Math.random() * Number(rpgRoll[1])) + 1;
              diceString += roll;
              if (j < Number(rpgRoll[0]) - 1) {
                diceString += ', ';
              }
              diceSum += roll;
            }
          }
        }
      } else if (faces[i].split(' ').length == 2) {
        // Range roll
        const rangeRoll = faces[i].split(' ');
        if (
          !Number.isInteger(Number(rangeRoll[0])) ||
          !Number.isInteger(Number(rangeRoll[1]))
        ) {
          diceString = '**Error:**: Both values in a range roll must be' +
            ' integers. Example: `' +
            prefix +
            'roll 1 100`.';
          diceSum = 0;
          break;
        } else {
          if (Number(rangeRoll[0]) < Number(rangeRoll[1])) {
            const roll = Math.floor(
                Math.random() *
                (1 + Number(rangeRoll[1]) - Number(rangeRoll[0])) +
                Number(rangeRoll[0])
            );
            diceString += roll;
            diceSum += roll;
          } else {
            // First number is larger than second
            diceString =
              '**Error:**: The first number in a range' +
              ' roll must be smaller than the second.';
            diceSum = 0;
            break;
          }
        }
      } else {
        diceString = '**Error:**: ' + faces[i] + ' is not a valid roll.' +
          ' Example: `' +
          prefix +
          'roll 2d6 + 5`.';
        diceSum = 0;
        break;
      }
      if (i < faces.length - 1) {
        diceString += ', ';
      }
    }
    if (diceSum > 0) {
      diceString += '\nTotal = ' + diceSum;
    }
    return diceString;
  }
}

module.exports = new Dice();
