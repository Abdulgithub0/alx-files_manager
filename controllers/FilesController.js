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
      // check existence status
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
    delete data.localPath;
    data.userId.toString();
    res.status(201).json(data);
  }

  /**
   * retrieve and render a file based on its id
   */
  static async getShow(req, res) {

    // Retrieve the user based on the token
    const token = req.headers['x-token'] ?? null;
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // check if the file id is linked to the user and file
    const fileId = req.params.id || null;
    const foundFile = await dbClient.findFileBy({_id: ObjectId(fileId), userId: userId});
    if (!foundFile) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.status(200).json(foundFile);
  }

  /**
   * Retrieve all users file documents for a specific parentId and page(pagination) pass as query parameters on request.
   * req: {Request Object}
   * res: {Response Object}
   */
  static async getIndex(req, res) {
     // Retrieve the user based on the token
     const token = req.headers['x-token'] || null;
     if (!token) {
       res.status(401).json({ error: 'Unauthorized' });
      return;
      }
     const userId = await redisClient.get(`auth_${token}`);
     if (!userId) {
       res.status(401).json({ error: 'Unauthorized' });
       return;
     }

     //get all users file documents for a specific parentId
     let parentId = req.query.parentId || 0;
     const page = Number.parseInt(req.query.page) || 0;
     const maxItem = 20;
     const files = await dbClient.retrieveFiles([page, maxItem], { parentId: parentId, userId: userId });
     res.json(files);
  }
}
