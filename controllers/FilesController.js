import dbClient from '../utils/db'
import redisClient from '../utils/redis';
import fprocess from '../utils/filetools';

/**
 * FilesController - contain middleware methods for files related activies by users
 */
export default class FilesController {
  /**
   * create a new file and save in DB:
   */
  static postUpload(req, res) {
    const scanError = fprocess.scanPostData(req);
    if (scanError) {
      res.status(scanError[0]).json(scanError[1]);
      return;
    }
  }
}
