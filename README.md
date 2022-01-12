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
  * [Bug reports](#bug-reports)
  * [Translations](#translations)
    * [Adding a new langauge](#adding-a-new-langauge)
    * [Improving an existing language](#improving-an-existing-language)
    * [Translation files explained](#translation-files-explained)
  * [Developing Winnie](#developing-winnie)
    * [Requirements](#requirements)
    * [Running Winnie for local development](#running-winnie-for-local-development)
    * [`package.json` scripts](#package.json-scripts)
* [Authors](#authors)
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

* TODO: Write this

#### Inviting your instance of Winnie to your server

Click the 'Generate OAuth2 URL' button in the Discord Developer pane to generate your invite URL.  Using the invite URL, you can invite your instance of Winnie to any Discord server on which you have administrator permissions.

## Using Winnie

### Basic features

* TODO: Write this

### Commands

* TODO: Write this

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

### Bug reports

Please report bugs by opening an [issue](https://github.com/lisushka/Winnie_Bot/issues) on GitHub.

### Translations

#### Adding a new langauge

If you want to help translate Winnie into a language she does not currently support, please join our [community Discord](https://discord.gg/mvZZMhK) to get in touch with the team.

#### Improving an existing language
If you're looking to help improve the translations for an existing language you can follow these steps:

<ol>
  <li>
    <a href="https://guides.github.com/activities/forking/">Fork</a> the Winnie_Bot repo and <a href="https://docs.github.com/en/.free-pro-team@latest/github/creating-cloning-and-archiving-repositories/cloning-a-repository">clone</a> it to your computer.
  </li>
  <li>
    Open the file containing the messages you want to correct in your favorite text editor. For help finding the right translation file, see <a href="translation-files-explained">here</a>.
    <br>
    <em>Note: We reccommend a program like notepad++ or VS Code, please don't use Microsoft Word or another word processing application.</em>
  </li>
  <li>
    The the string you want to change and make your changes.
  </li>
  <li>
    <a href="https://github.com/git-guides/git-commit">Commit</a> your changes and <a href="https://github.com/git-guides/git-push">push</a> them to your fork.
  </li>
  <li>
    Create a <a href="https://docs.github.com/en/free-pro-team@latest/desktop/contributing-and-collaborating-using-github-desktop/creating-an-issue-or-pull-request#creating-a-pull-request">pull request</a> back to Winnie with your changes.
  </li>
</ol>

#### Translation files explained

* `winnie.json` - Miscellanous translations that don't better fit in another file
* `commands.json` - Command response messages
* `goals.json` - Goal related messages

### Developing Winnie

#### Requirements
* [Docker](https://www.docker.com/)/[Docker Compose](https://docs.docker.com/compose/)
* [Node.js](https://nodejs.org/en/) 14.0 or higher
* [Yarn](https://yarnpkg.com/)

#### Running Winnie for local development

<ol>
  <li>
    clone the repo and move into the directory
    <br>
    <pre>$ git clone https://github.com/aigeroni/Winnie_Bot.git winnie_bot && cd winnie_bot</pre>
  </li>
  <li>
    Install dependencies with yarn 
    <br>
    <pre>$ yarn install</pre>
  </li>
  <li>
    Create <code>.env</code> file
    <br>
    <pre>$ cp .env.sample .env</pre>
  </li>
  <li>
    Setup your environment variables in the <code>.env</code> file.
  </li>
  <li>
    Start the docker processes 
    <br>
    <pre>$ yarn docker:local:up -d</pre>
  </li>
  <li>
    Run the mirgations to set up the database
    <br>
    <pre>$ yarn typeorm migration:run</pre>
  </li>
  <li>
    Start Winnie
    <br>
    <pre>$ yarn start</pre>
  </li>
  <li>
    In seperate terminal windows start the job workers
    <br>
    <pre>$ yarn start:worker:goal</pre>
  </li>
</ol>

#### package.json scripts

* `yarn build` - Compiles Winnie's typescript code into plain JavaScript
* `yarn docker:local:down` - Teardown local docker processes
* `yarn docker:local:up` - Start up local docker processes
* `yarn lint:all` - Run eslint over Winnie's code
* `yarn lint:fix` - Run eslint over Winnie's code, fixing mistakes
* `yarn start` - Compile Winnie and start up the bot process
* `start:worker:goal` - Starts the goals worker, needed for goals to complete.
* `yarn typeorm` - Access the [TypeORM CLI](https://typeorm.io/#/using-cli)

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
