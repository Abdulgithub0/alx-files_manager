import redisClient from '../utils/redis';
import dbClient from '../utils/db';
import { ObjectId } from 'mongodb';
import * as fs from 'fs/promises';
import path from 'path';

/**
 * Fileprocessor - interface to various methods needed for file operations on server.
 */

class FileProcessor {

  constructor () {
    this.folderName = process.env?.FOLDER_PATH ?? '/tmp/files_manager';
    this.isFolderExist = false;
  }

  /**
   * Scann through various request.body of an uploaded file
   * @params: {Request}
   * @return: {Object || null}
   */
  async scanPostData(req) {
    // check if this request context has a valid session id?
    const token = req.headers['x-token'] ?? null
    if (!token) return [401, { error: 'Unauthorized' }];
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return [401, { error: 'Unauthorized' }];

    //saving userId to request.body
    req.body.userId = userId;

    //check the request body and access the required and optional post fields
    const body = req.body ?? null;
    const types = ['folder', 'file', 'image'];

    //require fields
    if (!body) return {error: 'Missing details', status: 400};
    if ((!body.hasOwnProperty('name')) || (!body.name)) return [400, { error: 'Missing name' }];
    if ((!body.hasOwnProperty('type')) || (!types.includes(body.type))) return [400, { error: 'Missing type' }];;
    if ((!body.hasOwnProperty('data')) && (body.type !== 'folder')) return [400, { error: 'Missing data' }];

    //optional fields
    if (!body.hasOwnProperty('parentId')) {
      req.body.parentId = 0;
    } else if (req.body.parentId !== 0){
      const isParentExist = await dbClient.findUserBy({ _id: ObjectId(req.body.parentId) });
      if (!isParentExist) return [400, { error: 'Parent not found' }];
      if (isParentExist.type !== 'folder') return [400, {error: 'Parent is not a folder'} ];
    }

    if (!body.hasOwnProperty('isPublic')) req.body.isPublic = false;

    // success
    return null;
  }

  /**
   * check if a this.folderName exist and change this.isFolderExist to true
   */
  async folderExist() {
    try {
      const stats = await fs.stat(this.folderName);
      if (stats.isDirectory()) this.isFolderExist = true;
    } catch(error) {
      if (error.code !== 'ENOENT') console.error(error);
    }
  }
  
  /**
   * create a folder
   */
  async createFolder() {
    this.folder = fs.mkdir(this.folderName, { recursive: true });
  }

  /**
   * write into or create a file if does not exist and write into it
   * @param {String} - filename
   * @param {String} - file content
   * @return {Boolean}
   */
  async createFile(fileName, content) {
    const file = path.join(this.folderName, fileName);
    try {
      await fs.writeFile(file, content);
      return file;
    } catch (error){
      console.error(error)
      return null;
    }
  }
}


const fprocess = new FileProcessor();
export default fprocess

/*
function Testclass () {
const test = new FileProcessor();
const request = { body: {name: "myText.txt", type: "file", data: "SGVsbG8gV2Vic3RhY2shCg==" }, x-token: 'blabla' };
const res = test.scanPostData(request);
console.log(res);
console.log(request);
request.body.isPublic = true;
console.log(test.scanPostData(request));
console.log(request);

const newRequest = { body: {name: "myText.txt", data: "SGVsbG8gV2Vic3RhY2shCg==" } };
console.log(test.scanPostData(newRequest));
}

TestClass()
*/
