class Challenges {
    constructor() {
        // TODO: Move these constants to a root-level config.js
        // file and import from there
        this.WAR_RAPTOR_CHANCE = 10
        this.DUR_AFTER = 300

        this.timerID = 1
        this.challengeList = {}
        this.crossServerStatus = {}
        this.autoSumStatus = {}
    }
}

module.exports = new Challenges();
