const conn = require('mongoose').connection;

/** Database methods. */
class Database {
  /** Initialise variables required for challenge creation and summaries. */
  constructor() {}
  /**
   * Inserts a record into the database
   * @param  {String} db - The database to insert into.
   * @param {String} info - The data to insert.
   * @return {Promise} - Promise object.
   */
  async dbInsert(db, info) {
    await conn.collection(db).insert(
        info,
        {},
        function(e, docs) {}
    );
  }
  /**
   * Updates the database
   * @param  {String} db - The database to update.
   * @param {String} id - The ID of the field to update.
   * @param {String} info - The data to update with.
   * @return {Promise} - Promise object.
   */
  async dbUpdate(db, id, info) {
    await conn.collection(db).update(
        id,
        info,
        {upsert: true}
    );
  }
  /**
   * Removes a record from the database
   * @param  {String} db - The database to remove from.
   * @param {String} id - The document to remove.
   * @return {Promise} - Promise object.
   */
  async dbRemove(db, id) {
    await conn.collection(db).remove(
        id
    );
  }
  /**
   * Finds a record in the database
   * @param  {String} db - The database to search.
   * @param {String} id - The document to find.
   * @return {Promise} - Promise object.
   */
  async dbFind(db, id) {
    return await conn.collection(db).findOne(
        id
    );
  }
}

module.exports = new Database();
