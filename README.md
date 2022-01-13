<div align="center">
  <img src="https://cdn.discordapp.com/avatars/386676183791829002/7db6a3630cd239e8f666fb9f00a2cd83.png?size=1024" height="250" />
  <h1>Winnie_Bot</h1>

  <a href="https://github.com/aigeroni/Winnie_Bot/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/aigeroni/Winnie_Bot.svg?style=flat-square" alt="Github License" />
  </a>
  <a href="https://discordapp.com/api/oauth2/authorize?client_id=386676183791829002&permissions=0&scope=bot%20applications.commands">
    <img src="https://img.shields.io/badge/Add%20to%20your-server-7289DA.svg?style=flat-square" alt="Add to your server" />
  </a>
   <a href="https://discord.gg/mvZZMhK">
    <img src="https://img.shields.io/badge/Join%20the%20community-Discord-7289DA.svg?style=flat-square" alt="Join Community Server" />
  </a>

  <br />
  <br />

  <p>Winnie is a Discord bot for authors. Winnie allows users to track goals, challenge each other to word wars and sprints, and get prompts to assist with their writing.</p>

<hr />
</div>

## Table of Contents

* [Adding Winnie to your Discord server](#adding-winnie-to-your-discord-server)
  * [Inviting the public Winnie_Bot account](#inviting-the-public-winnie-bot-account)
  * [Setting up your own instance of Winnie](#setting-up-your-own-instance-of-winnie)
    * [Requirements](#requirements)
    * [Setting up a Discord bot instance](#setting-up-a-discord-bot-instance)
    * [Inviting your instance of Winnie to your server](#inviting-your-instance-of-winnie-to-your-server)
* [Using Winnie](#using-winnie)
  * [Basic Features](#basic-features)
  * [Commands](#commands)
* [Dependencies and frameworks](#Dependencies-and-frameworks)
* [Privacy Policy and Data Deletion](#privacy-policy-and-data-deletion)
* [Contributing to Winnie](#contributing-to-winnie)
* [Core Team](#core-team)
* [License](#license)
* [Acknowledgments](#acknowledgments)

## Adding Winnie to your Discord server

If you want to run Winnie on your server, you can either invite the public Winnie_Bot account or set up your own Discord bot with Winnie's code.

### Inviting the public Winnie_Bot account

If you want to invite the public Winnie_Bot account to your server, go [here](https://discordapp.com/api/oauth2/authorize?client_id=386676183791829002&permissions=0&scope=bot%20applications.commands).

### Setting up your own instance of Winnie

#### Requirements

* [Node.js](https://nodejs.org/en/)
* [Yarn Package Manager](https://yarnpkg.com/)
* [Docker](https://www.docker.com/)/[Docker Compose](https://docs.docker.com/compose/)

#### Setting up a Discord bot instance

* Sign in to Discord
* Go to the [Discord Dev Portal](https://discordapp.com/developers/), and click on 'My Apps'
* Click on 'New App' to create a Discord application
* Go to the Bot tab, and click the Add Bot button to create a bot user
* Copy the token under Bot/Token - you will need this in the next step

#### Installation Instructions

You can use the [`start-winnie.sh`](./start-winnie.sh) script to install Winnie's components as services on Linux machines.

#### Inviting your instance of Winnie to your server

Click the 'Generate OAuth2 URL' button in the Discord Developer pane to generate your invite URL.  Using the invite URL, you can invite your instance of Winnie to any Discord server on which you have administrator permissions.

## Using Winnie

### Basic features

Winnie currently consists of the following features:

* **Goals:** Set targeted writing goals for yourself each day, week, month, or year
* **Challenges:** Set timers for yourself, and write as much as you can with other people in your server
* **Writing prompts:** Get prompts for character building, worldbuilding, and a variety of genre-specific situations

The following new features are currently on the core team's roadmap:

* **Encouragement and self-care prompts**
* **Projects:** Set targeted writing goals for individual projects over whatever period of time you want
* **Events:** Create and participate in scheduled events within your own server, or global events that are open to all servers using Winnie

### Commands

You can find more information about Winnie's commands in the [documentation](https://github.com/aigeroni/Winnie_Docs).

## Dependencies and frameworks

* [BullMQ](https://github.com/taskforcesh/bullmq) - Event Queue Management
* [Class-Validator](https://github.com/typestack/class-validator) - Model validations
* [Discord.js](https://discord.js.org) - Discord API for Node.js
* [ESLint](https://eslint.org/) - Linting
* [i18next](https://www.i18next.com/) - Internationalization
* [Luxon](https://moment.github.io/luxon/#/) - Date/Time manipulation
* [node-cron](https://nodecron.com/) - Job scheduling
* [PostgreSQL](https://www.postgresql.org/) - Persistent storage
* [TypeORM](https://typeorm.io/#/) - Database Interaction
* [Winston](https://github.com/winstonjs/winston) - Log management

## Privacy Policy and Data Deletion

Please see our Privacy Policy [here](./PRIVACY.md).

## Contributing to Winnie

We welcome all contributions to Winnie.  Please see the [contributing guidelines](./CONTRIBUTING.md) for more information on how to get involved.

Additionally, we expect all contributors to follow the [Code of Conduct](./CODE_OF_CONDUCT.md).

## Core Team

| Dawn E. Collett | Jason E. Gillikin | Katie Macke |
|---|---|---|
| [![Dawn's Github](https://avatars1.githubusercontent.com/u/28942094?s=100&v=4)](https://github.com/lisushka) | [![Jason's Github](https://avatars2.githubusercontent.com/u/7763031?s=100&v=4)](https://github.com/jegillikin) | [![Katie's Github](https://avatars1.githubusercontent.com/u/12132647?s=100&v=4)](https://github.com/asleepysheepy) |

## License

This project is licensed under the GNU General Public License, v3.0 - see the [LICENSE](LICENSE) file for details.  In particular, if you incorporate Winnie's source code into another project, you must release the source code of that project.

## Acknowledgments

* Winnie is inspired by Timmy, ChatNaNo's IRC bot.  Timmy can be found at [utoxin/TimTheWordWarBot](https://github.com/utoxin/TimTheWordWarBot).
* Prompts were brainstormed by NaNo's Australia::Melbourne region.
* Winnie's avatar, 'Tiny Cities', was created by [Rachael Wheeler](http://www.rachaelw.com.au/).  Prints, notebooks, and other items featuring 'Tiny Cities' are available for purchase [here](https://www.redbubble.com/people/scorpiraw/works/33012468-tiny-cities).
