/**
 * All the types of race settable.
 */
export enum RaceTypes {
  ITEMS = 'items',
  LINES = 'lines',
  MINUTES = 'minutes',
  PAGES = 'pages',
  WORDS = 'words',
}

/**
 * All the types for challenge totals.
 */
export enum ChallengeTotalTypes {
  ITEMS = 'items',
  LINES = 'lines',
  MINUTES = 'minutes',
  PAGES = 'pages',
  WORDS = 'words',
}

/**
 * All the possible statuses for challenges, goals, and projects.
 */
 export enum StatusTypes {
  CREATED = 'created',
  RUNNING = 'running',
  CANCELED = 'canceled',
  COMPLETED = 'completed',
}

/**
 * The challenge types.
 */
 export enum ChallengeTypes {
  RACE = 'race',
  WAR = 'war',
}
