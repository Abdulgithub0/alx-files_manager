import mongodb from 'mongodb';
import sha1 from 'sha1';

/**
 * DBClient - A wrapper interface to specific set of operations on mongodb
 *
 */

class DBClient {
  /**
   * Constructor - establish a client connection to a running mongodb server
   */

  constructor() {
    this.host = process.env.DB_HOST || 'localhost';
    this.port = process.env.DB_PORT || 27017;
    this.database = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${this.host}:${this.port}/${this.database}`;
    this.mongoDb = new mongodb.MongoClient(url, { useUnifiedTopology: true });
    this.mongoDb.connect();
  }

  /**
   * check connection to MongoDB server is a success or otherwise
   * @return {Boolean}
   */
  isAlive() { return this.mongoDb.isConnected(); }

  /**
   * asynchronous method nbUsers returns the number of documents in the collection users
   * @return {Promise}
   */
  async nbUsers() { return this.mongoDb.db().collection('users').countDocuments(); }

  /**
   * asynchronous method nbFiles that returns the number of documents in the collection files
   * @return {Promise}
   */
  async nbFiles() { return this.mongoDb.db().collection('files').countDocuments(); }
  
  /**
   * async method that new user to mongodb
   * @return {Object | null}
   */ 
  async createUser(email, password) {
    try {
      const newUser = await this.mongoDb.db().collection('users').insertOne({ email: email, password: sha1(password) });
      return { email: email, id: newUser.insertedId.toString() };
    } catch (error) {
      return null;
    }
  }
  
  /*
   * async method that new user to mongodb
   * @params {Object} -  file data
   * @return {Object | null}
   */
  async createFile(params) {
    try {
      const newFile = await this.mongoDb.db().collection('files').insertOne(params);
      //params.id = newFile.insertedId.toString();
      return params;
    } catch (err) {
      return null;
    }
  }

  /**
   * async method that check if a user by @param exits in db
   * @param {String} - representing search user details
   * @return {Object | null} match user on success or null if otherwise
   */
  async findUserBy(params) {
    const user = await this.mongoDb.db().collection('users').findOne(params);
    return user;
  }

  /**
   * async method that check if a file by @param exits in db
   * @param {String} - representing search file details
   * @return {Object | null} match file on success or null if otherwise
   */
  async findFileBy(params) {
    const file = await this.mongoDb.db().collection('files').findOne(params);
    return file;
  }

  /**
   * async method that retrieve files in form of pages from mongodb
   * @size {Array} array object containing page number and max number of document on the page
   * @query {Object} object to search for on the db
   */
  async retrieveFiles(size, query) {
    const pagination = [{ $match: query}, { $skip: size[0] * size[1] }, { $limit: size[1] }];
    try {
      const files = await this.mongoDb.db().collection('files').aggregate(pagination).toArray();
      return files;
    } catch(error) {
      return [];
    }
  }
}

export const dbClient = new DBClient();
export default dbClient;
