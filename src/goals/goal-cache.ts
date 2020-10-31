import Goal from './goal'
import { Snowflake } from 'discord.js'

/**
 * A cached list of goals to ease in management
 */
class GoalCache {

  /**
   * A list of goals
   */
  goals: Array<Goal>

  /**
   * Initialise a list of goals being tracked by Winnie.
   */
  constructor() {
    this.goals = []
  }

  /**
   * Adds a new goal to the cache.
   *
   * @param goal - That goal to add
   */
  add(goal: Goal): void {
    goals.push(goal)
  }

  /**
   * Adds a new goal to the cache.
   *
   * @param goal - That goal to add
   */
  remove(goal: Goal): void {
    const goalIndex = this.goals.findIndex((g) => g.authorID === goal.authorID)
    this.goals.splice(goalIndex, 1)
  }

  /**
   * Checks if the given author has a goal
   *
   * @param authorID the Discord ID of the author to find a goal for
   * @returns true if the author has a goal
   */
  has(authorID: Snowflake): boolean {
    const goal = this.goals.find((goal) => goal.authorID === authorID)

    return !!goal
  }

  /**
   * Gets the goal for a given author
   *
   * @param authorID the Discord ID of the author to find a goal for
   * @returns the Goal for the author, undefined if no goal was found
   */
  get(authorID: Snowflake): Goal | undefined {
    return this.goals.find((goal) => goal.authorID === authorID)

  }
}

export default new GoalCache()
