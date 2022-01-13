# The `Winnie_Bot` Contributor Rules of Engagement

The `Winnie_Bot` Contributor Rules of Engagement are licensed under the [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) license.

So you're interested in helping out?  You can find everything that you need to know about contributing to Winnie here.

## Table of Contents

* [Where to go with problems](#where-to-go-with-problems)
* [Making improvements](#what-we-dont-store)
  * [Code](#code)
  * [Documentation](#documentation)
  * [Translations](#translations)

## Where to go with problems

If you're having trouble using Winnie, you might find the answer in the [documentation](https://github.com/aigeroni/Winnie_Docs).  Otherwise, you can join the [community Discord server](https://discord.gg/mvZZMhK) to get help from the core team and members of the community.

If you think that you've found a problem in the code, you can report bugs by opening an [issue](https://github.com/lisushka/Winnie_Bot/issues) on GitHub.

## Making improvements

### Code

#### Requirements

You'll need the following dependencies to develop Winnie locally:

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

#### `package.json` scripts

You can use the following scripts on your local CLI to complete tasks:

* `yarn build` - Compile Winnie's TypeScript code into plain JavaScript
* `yarn docker:local:down` - Shut down local Docker processes
* `yarn docker:local:up` - Start up local Docker processes
* `yarn lint:all` - Run ESLint over Winnie's code
* `yarn lint:fix` - Run ESLint over Winnie's code, fixing basic linting errors
* `yarn start` - Compile Winnie and start up the bot process
* `start:worker:goal` - Start the goals worker, needed for goals to complete.
* `yarn typeorm` - Access the [TypeORM CLI](https://typeorm.io/#/using-cli)

#### Code standards

We use the following standards whilst coding:

* `ts-standard` for linting TypeScript files
* `terraform fmt` for linting Terraform infrastructure as code

We favour heavily commented code; this makes it easier for all of our contributors to understand how Winnie works.  We may ask you to improve your comments if we think that they need to be clearer.

#### Pull requests

* pull requests should explain what you've done; even at a high level is fine
* Use pull request templates

### Documentation

* Go to the docs repo and PR there
* Discuss in the server if you're not technically capable enough

### Translations

#### Languages

Winnie is currently available in seven languages:

* English
* Français
* Magyar
* Latina
* Bahasa Melayu
* Nederlands
* Svenska

#### Files

The translation framework consists of the following files:

* `winnie.json` - Miscellanous translations that don't better fit in another file
* `challenges.json` - Challenge-related messages
* `commands.json` - Command responses
* `goals.json` - Goal-related messages
* `prompts.json` - Story prompts

#### Improving an existing translation

For extensive changes to an existing translation, please join our [community Discord](https://discord.gg/mvZZMhK), go to the `#new_features` channel, and tag `@Core Team` with the language whose translation you want to improve.  We'll connect you with the existing translators for the language, and help you to get set up with our frameworks.

For minor changes, use the following instructions:

<ol>
  <li>
    <a href="https://guides.github.com/activities/forking/">Fork</a> the Winnie_Bot repo and <a href="https://docs.github.com/en/.free-pro-team@latest/github/creating-cloning-and-archiving-repositories/cloning-a-repository">clone</a> it to your computer.
  </li>
  <li>
    Open the file containing the messages you want to correct in your favorite text editor. For help finding the right translation file, see <a href="files">here</a>.
    <br>
    <em>**NOTE:** We recommend a program like <a href="https://notepad-plus-plus.org/">Notepad++</a> or <a href="https://code.visualstudio.com/">Visual Studio Code</a>.  Word processing applications, such as LibreOffice Writer, Microsoft Word, and WordPerfect, add extra information to the text that prevents Winnie from parsing it properly.</em>
  </li>
  <li>
    Find the string that you want to change, and edit it accordingly.
  </li>
  <li>
    <a href="https://github.com/git-guides/git-commit">Commit</a> your changes and <a href="https://github.com/git-guides/git-push">push</a> them to your fork.
  </li>
  <li>
    Create a <a href="https://docs.github.com/en/free-pro-team@latest/desktop/contributing-and-collaborating-using-github-desktop/creating-an-issue-or-pull-request#creating-a-pull-request">pull request</a> back to Winnie with your changes.
  </li>
</ol>

#### Translating Winnie into new language

If you want to help translate Winnie into a language she does not currently support, please join our [community Discord](https://discord.gg/mvZZMhK), go to the `#new_features` channel, and tag `@Core Team` with the language that you want to translate Winnie into.  We'll then set up localisation files for your language, and help you to get set up with our frameworks.
