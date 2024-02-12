import mongodb from 'mongodb';

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
}

export const dbClient = new DBClient();
export default dbClient;
