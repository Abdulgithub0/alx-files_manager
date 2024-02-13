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

  /**
   * async method that check if a user by @param exits in db
   * @param {String} - representing email
   * @return {Boolean}
   */
  async findUserBy(params) {
    const user = await this.mongoDb.db().collection('users').findOne(params);
    return user;
  }
}

export const dbClient = new DBClient();
export default dbClient;
