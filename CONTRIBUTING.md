# The `Winnie_Bot` Contributor Rules of Engagement

The `Winnie_Bot` Contributor Rules of Engagement are licensed under the [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) license.

So you're interested in helping us out with Winnie?

## Where to go with problems

* Discord server
* Documentation
* Github issues

## Communication channels

* Discord
* Twitter (poorly maintained)

## Making improvements

### To the code

* Follow code standards
* Use pull request templates

### To the documentation

* Go to the docs repo and PR there
* Discuss in the server if you're not technically capable enough

### To the translations

* Join the Discord server

#### An existing language

* Contact the existing translators

#### A new language

* Speak to the core team first

## Code standards

* `ts-standard` linting
* `terraform fmt` lints for infrastructure as code
* we favour heavily commented code; we may ask you to improve your comments
* pull requests should explain what you've done; even at a high level is fine


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