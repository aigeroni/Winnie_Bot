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
    let diceString = ''
    let diceSum = 0
    const faces = suffix.split('+')
    for (let i = 0; i < faces.length; i++) {
      let diceArray = []
      if (Number.isInteger(Number(faces[i]))) {
        diceArray = this.flatRoll(faces, i)
      } else if (faces[i].split('d').length === 2) {
        diceArray = this.rpgRoll(prefix, faces[i])
      } else if (faces[i].split(' ').length === 2) {
        diceArray = this.rangeRoll(prefix, faces[i])
      } else {
        diceString = '**Error:**: ' + faces[i] + ' is not a valid roll.' +
          ' Example: `' + prefix + 'roll 2d6 + 5`.'
        diceSum = 0
        break
      }
      diceString += diceArray[0]
      diceSum += diceArray[1]
      if (i < faces.length - 1) {
        diceString += ', '
      }
    }
    if (diceSum > 0) {
      diceString += '\nTotal = ' + diceSum
    }
    return diceString
  }

  /**
   * Roll a single dice.
   * @param {String} faces - The user's roll.
   * @param {String} i - The section of the string to roll.
   * @return {Array} - Roll information.
   */
  flatRoll(faces, i) {
    // Single number
    let diceString = ''
    let diceSum = 0
    if (faces.length === 1) {
      // Treat as a 1dx roll
      const roll = Math.floor(Math.random() * Number(faces[i])) + 1
      diceString += roll
      diceSum += roll
    } else {
      // Add to the other rolls
      diceString += '(' + faces[i] + ')'
      diceSum += Number(faces[i])
    }
    return [diceString, diceSum]
  }

  /**
   * Roll dice according to tabeltop RPG specs.
   * @param {String} prefix - The bot's prefix.
   * @param {String} data - Dice string.
   * @return {Array} - Roll information.
   */
  rpgRoll(prefix, data) {
    // RPG-style roll
    let diceString = ''
    let diceSum = 0
    const rpgRoll = data.split('d')
    if (rpgRoll[0] === '') {
      rpgRoll[0] = 1
    }
    if (
      !Number.isInteger(Number(rpgRoll[0])) ||
      !Number.isInteger(Number(rpgRoll[1]))
    ) {
      diceString =
        '**Error:**: Both values in an RPG-style roll must be integers.' +
        ' Example: `' + prefix + 'roll 2d6`.'
      diceSum = 0
    } else if (rpgRoll[0] > 20) {
      diceString = '**Error:**: I cannot roll more than 20 dice at once.'
      diceSum = 0
    } else {
      for (let i = 0; i < Number(rpgRoll[0]); i++) {
        const roll = Math.floor(Math.random() * Number(rpgRoll[1])) + 1
        diceString += roll
        if (i < Number(rpgRoll[0]) - 1) {
          diceString += ', '
        }
        diceSum += roll
      }
    }
    return [diceString, diceSum]
  }

  /**
   * Roll dice according to the user's specifications.
   * @param {String} prefix - The bot's prefix.
   * @param {String} data - Information after the bot command.
   * @return {String} - The message to send to the user.
   */
  rangeRoll(prefix, data) {
    let diceString = ''
    let diceSum = 0
    // Range roll
    const rangeRoll = data.split(' ')
    if (
      !Number.isInteger(Number(rangeRoll[0])) ||
      !Number.isInteger(Number(rangeRoll[1]))
    ) {
      diceString = '**Error:**: Both values in a range roll must be' +
        ' integers. Example: `' + prefix + 'roll 1 100`.'
      diceSum = 0
    } else if (Number(rangeRoll[0]) < Number(rangeRoll[1])) {
      const roll = Math.floor(
        Math.random() *
          (1 + Number(rangeRoll[1]) - Number(rangeRoll[0])) +
          Number(rangeRoll[0]),
      )
      diceString += roll
      diceSum += roll
    } else {
      // First number is larger than second
      diceString = '**Error:**: The first number in a range' +
        ' roll must be smaller than the second.'
      diceSum = 0
    }
    return [diceString, diceSum]
  }
}

module.exports = new Dice()
