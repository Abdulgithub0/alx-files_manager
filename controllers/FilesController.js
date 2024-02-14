import dbClient from '../utils/db'
import redisClient from '../utils/redis';
import fprocess from '../utils/filetools';
import { v4 } from 'uuid';
import { ObjectId } from 'mongodb';

/**
 * FilesController - contain middleware methods for files related activies by users
 */
export default class FilesController{
  /**
   * create and write into file and save in DB:
   */
  static async postUpload(req, res) {
    const scanError = await fprocess.scanPostData(req);
    if (scanError) {
      res.status(scanError[0]).json(scanError[1]);
      return;
    }

    const postData = req.body;
    
    // if type is folder put it on db.
    if (postData.type === 'folder') {
      const newFile = await dbClient.createFile(postData);
      res.status(201).json(newFile);
      return;
    }
    // write a folder if doesn't exist
    if (!fprocess.isFolderExist) {
      await fprocess.createFolder();

      // set folder existence status
      await fprocess.folderExist();
      // check again
      if (!fprocess.isFolderExist) {
        res.status(501).json({error: 'Server Error' });
        return;
      }
    }
    // if type is image or file
    const name = v4();
    const content = Buffer.from(postData.data, 'base64');
    const lPath = await fprocess.createFile(name, content);
    if (!lPath) {
      res.status(501).json({'error': 'writing Error' });
      return;
    }
    // data successfully, so remove it from postData
    delete postData.data;
    postData.localPath = lPath;
    const data = await dbClient.createFile(postData);
    if (!data) {
      res.status(501).json({error: 'Error Saving file details to db' });
      return;
    }
    data.userId.toString();
    res.status(201).json(data);
  }
}
