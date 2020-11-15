# Winnie_Bot

Winnie is a Discord bot for authors.  Winnie allows users to track goals, challenge each other to word wars and sprints, and get prompts to assist with their writing.

## Table of Contents

* [Adding Winnie to your Discord server](#adding-winnie-to-your-discord-server)
  * [Inviting the public Winnie_Bot account](#inviting-the-public-winnie-bot-account)
  * [Setting up your own instance of Winnie](#setting-up-your-own-instance-of-winnie)
    * [Requirements](#requirements)
    * [Setting up a Discord bot instance](#setting-up-a-discord-bot-instance)
    * [Inviting your instance of Winnie to your server](#inviting-your-instance-of-winnie-to-your-server)
* [Dependencies and frameworks](#Dependencies-and-frameworks)
* [Bug reports](#bug-reports)
* [Contributing to Winnie](#contributing-to-winnie)
* [Authors](#authors)
* [License](#license)
* [Acknowledgments](#acknowledgments)
* [Data Deletion](#data-deletion)

## Adding Winnie to your Discord server

If you want to run Winnie on your server, you can either invite the public Winnie_Bot account or set up your own Discord bot with Winnie's code.

### Inviting the public Winnie_Bot account

If you want to invite the public Winnie_Bot account to your server, go [here](https://discordapp.com/api/oauth2/authorize?client_id=386676183791829002&permissions=0&scope=bot).

### Setting up your own instance of Winnie

#### Requirements

* [Node.js](https://nodejs.org/en/)
* [Yarn Package Manager](https://yarnpkg.com/)
* [Docker](https://www.docker.com/)

#### Setting up a Discord bot instance

* Sign in to Discord
* Go to the [Discord Dev Portal](https://discordapp.com/developers/), and click on 'My Apps'
* Click on 'New App' to create a Discord application
* Go to the Bot tab, and click the Add Bot button to create a bot user
* Copy the token under Bot/Token - you will need this in the next step

#### Installation Instructions

* Clone the Winnie_Bot repository onto your server.
* Run `docker build .` to get package dependencies.
* Set an environment variable with your bot token.
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

* **Dawn E. Collett** - *Maintainer* - [GitHub](https://github.com/lisushka)
* **Katie Macke** - *Development Team* - [GitHub](https://github.com/asleepysheepy)
* **Robert W. McLeod** - *Server management assistance* - [GitHub](https://github.com/RobFaie)
* **Lauren Jenkinson** - *Server management assistance* - [GitHub](https://github.com/alxce)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

* Winnie is inspired by Timmy, ChatNaNo's IRC bot.  Timmy can be found at [utoxin/TimTheWordWarBot](https://github.com/utoxin/TimTheWordWarBot).
* Prompts were brainstormed by NaNo's Australia::Melbourne region.

Winnie's repository is located at [aigeroni/Winnie_Bot](https://github.com/aigeroni/Winnie_Bot).
Winnie's avatar, 'Tiny Cities', was created by [Rachael Wheeler](http://www.rachaelw.com.au/).  Prints, notebooks, and other items featuring 'Tiny Cities' are available for purchase [here](https://www.redbubble.com/people/scorpiraw/works/33012468-tiny-cities).

## Data Deletion

Winnie only stores data that you provide to her, and your data is only stored under the unique identifier that Discord uses for your account.  If you wish to request deletion of your user data on the public Winnie_Bot instance, please contact dawn@dawnbug.com with your request.
