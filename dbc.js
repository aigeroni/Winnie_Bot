/** Database methods. */
class Database {
  /** Initialise variables required for challenge creation and summaries. */
  constructor() {}
  /**
   * Updates the database
   * @param  {String} db - The database to update.
   * @param {String} id - The ID of the field to update.
   * @param {String} info - The data to update with.
   * @return {Object} - User data.
   */
  async dbUpdate(db, id, info) {
    await conn.collection(db).update(
        {_id: id},
        {
          info,
        },
        {upsert: true}
    );
  }
}

module.exports = new Database();
