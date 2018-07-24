
# Winnie_Bot

Winnie is a Discord bot for authors.  Winnie allows users to track goals, challenge each other to word wars and sprints, and get prompts to assist with their writing.

## Adding Winnie to your Discord server

If you want to run Winnie on your server, you can either invite the public Winnie_Bot account or set up your own Discord bot with Winnie's code.

### Inviting the public Winnie_Bot account

If you want to invite the public Winnie_Bot account to your server, go [here](https://discordapp.com/api/oauth2/authorize?client_id=386676183791829002&permissions=0&scope=bot).  If you want to turn off cross-server wars, your admin will need to use the !config command (1.1.3 and later).

### Setting up your own instance of Winnie

#### Requirements

Node.js
npm (Node Package Manager)
MongoDB

#### Setting up a Discord bot instance

* Sign in to Discord
* Go to https://discordapp.com/developers/, and click on 'My Apps'
* Click on 'New App' to create a Discord
* Reveal the token under Bot/Token - you will need this in the next step

#### Installation Instructions

* Clone the Winnie_Bot repository onto your server.
* Run `npm install` to get package dependencies.
* Create the file `config.json` in Winnie's root directory, and add the following text: {"token": "your bot's token"}
* Install and run MongoDB.
* Run tz-script.sh to download the IANA timezone data.
* Run `node main.js` to initialise Winnie.

#### Inviting your instance of Winnie to your server

Click the 'Generate OAuth2 URL' button in the Discord Developer pane to generate your invite URL.  Using the invite URL, you can invite your instance of Winnie to any Discord server on which you have administrator permissions.

## Dependencies and frameworks

* [Discord.js](https://discord.js.org) - Discord API for Node.js
* [ESLint](https://eslint.org/) - Linting
* [node-gameloop](https://www.npmjs.com/package/node-gameloop) - Timer
* [timezone-js](https://www.npmjs.com/package/timezone-js) - Timezone management
* [winston](https://www.npmjs.com/package/winston) - Log management

## Bug reports

Please report bugs by opening an [issue](https://github.com/RobFaie/Winnie_Bot/issues) on GitHub.

## Contributing to Winnie

We welcome all contributors to Winnie.  Your pull requests will be reviewed by the authors prior to merging.  Please document your code, and play nicely with other contributors.

## Authors

* **Dawn E. Collett** - *Primary Developer* - [GitHub](https://github.com/lisushka)
* **Robert W. McLeod** - *Server management assistance* - [GitHub](https://github.com/RobFaie)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

* Winnie is inspired by Timmy, National Novel Writing Month's IRC bot.  Timmy can be found at https://github.com/utoxin/TimTheWordWarBot.
* Prompts were brainstormed by NaNoWriMo's Australia::Melbourne region.

Winnie's repository is located at https://github.com/RobFaie/Winnie_Bot.
Winnie's avatar, 'Tiny Cities', was created by Rachael Wheeler (Etlu-Yume on NaNoWriMo).  Prints of 'Tiny Cities' can be purchased [here]().