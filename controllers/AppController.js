import redisClient from '../utils/redis';
import dbClient from '../utils/db';

/**
 * AppController - Provide the interface to middleware functions that
 *                 interact with mongodb and redis clients interface.
 */
export default class AppController {
  /**
   * getStatus middleware -  return the connection status of redisClient
   *                         and dbClient (mongodb) respectfully.
   */

  static getStatus(req, res) {
    res.status(200).json({ redis: redisClient.isAlive(), db: dbClient.isAlive() });
  }

  /**
   * getStats middleware - return the respective total number of users and files
   */
  static getStats(req, res) {
    Promise.all([dbClient.nbUsers(), dbClient.nbFiles()])
      .then(([users, files]) => {
          res.status(200).json({ users: users, files: files });
    });
  }
}
