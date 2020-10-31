/**
 * Represents the possible states of a challenge
 */
enum ChallengeStates {

  /**
   * The challenge has been created but has not yet started.
   */
  SCHEDULED = 0,

  /**
   * The challenge has started and is currently running.
   */
  IN_PROGRESS = 1,

  /**
   * The challenge has ended.
   */
  ENDED = 2,
}

export default ChallengeStates
