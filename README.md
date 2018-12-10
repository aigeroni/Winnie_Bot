
# Winnie_Bot

Winnie is a Discord bot for authors.  Winnie allows users to track goals, challenge each other to word wars and sprints, and get prompts to assist with their writing.

## Adding Winnie to your Discord server

If you want to run Winnie on your server, you can either invite the public Winnie_Bot account or set up your own Discord bot with Winnie's code.

### Inviting the public Winnie_Bot account

If you want to invite the public Winnie_Bot account to your server, go [here](https://discordapp.com/api/oauth2/authorize?client_id=386676183791829002&permissions=0&scope=bot).

### Setting up your own instance of Winnie

#### Requirements

* Node.js
* npm (Node Package Manager)

#### Setting up a Discord bot instance

* Sign in to Discord
* Go to https://discordapp.com/developers/, and click on 'My Apps'
* Click on 'New App' to create a Discord application
* Go to the Bot tab, and click the Add Bot button to create a bot user
* Copy the token under Bot/Token - you will need this in the next step

#### Installation Instructions

* Clone the Winnie_Bot repository onto your server.
* Run `npm install` to get package dependencies.
* Edit the `config.json` file in Winnie's root directory as follows: {"token": "your bot's token from the previous step", "storageUrl": "location of your MongoDB"}
* Initialise MongoDB.
* Run `bash tz-script.sh` to download the IANA timezone data.
* Run `node index.js` to initialise Winnie.

#### Inviting your instance of Winnie to your server

Click the 'Generate OAuth2 URL' button in the Discord Developer pane to generate your invite URL.  Using the invite URL, you can invite your instance of Winnie to any Discord server on which you have administrator permissions.

## Dependencies and frameworks

* [Discord.js](https://discord.js.org) - Discord API for Node.js
* [ESLint](https://eslint.org/) - Linting
* [MongoDB](https://www.mongodb.com/) - Persistent storage
* [mongoose](http://mongoosejs.com/) - MongoDB framework
* [node-gameloop](https://www.npmjs.com/package/node-gameloop) - Timer
* [timezone-js](https://www.npmjs.com/package/timezone-js) - Timezone management
* [winston](https://www.npmjs.com/package/winston) - Log management

## Bug reports

Please report bugs by opening an [issue](https://github.com/lisushka/Winnie_Bot/issues) on GitHub.

## Contributing to Winnie

We welcome all contributors to Winnie.  Your pull requests will be reviewed by the authors prior to merging.  Please document your code, and play nicely with other contributors.

## Authors

* **Dawn E. Collett** - *Primary Developer* - [GitHub](https://github.com/lisushka)
* **Robert W. McLeod** - *Server management assistance* - [GitHub](https://github.com/RobFaie)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

* Winnie is inspired by Timmy, ChatNaNo's IRC bot.  Timmy can be found at https://github.com/utoxin/TimTheWordWarBot.
* Prompts were brainstormed by NaNo's Australia::Melbourne region.

Winnie's repository is located at https://github.com/lisushka/Winnie_Bot.
Winnie's avatar, 'Tiny Cities', was created by [Rachael Wheeler](http://www.rachaelw.com.au/).  Prints, notebooks, and other items featuring 'Tiny Cities' are available for purchase [here](https://www.redbubble.com/people/scorpiraw/works/33012468-tiny-cities).