import redis from 'redis';
import { promisify } from 'util';

/**
 * RedisClient -  Wrapper interface to Redis
 */
class RedisClient {
  /**
   * Create a Redis server instance with default parameters.
   * @returns {this} the instance of RedisClient
   */
  constructor() {
    this.connected = true;
    this.redisDb = redis.createClient();
    this.redisDb.on('error', (err) => {
      this.connected = false;
      console.log(`Failed to establish a connection to Redis server: ${err}`);
    });
  }

  /**
   * Check if connection to Redis server is successful or not.
   * @returns {Boolean}
   */
  isAlive() { return this.connected; }

  /**
   * async method to retrieve the value of a key from redis.
   * @param {String} - representing key
   * @returns {Object} - a promise object
   */
  async get(key) {
    const value = await promisify(this.redisDb.GET).bind(this.redisDb)(key);
    return value;
  }

  /**
   * async method to set and store a given key - value pair for a specific time duration
   * @param {String} - first param, representing the key.
   * @param {String, Boolean, Number} - representing the key's value
   * @param {Number} - representing duration of storage
   * @returns {Object} - a promise object
   */
  async set(key, value, duration) {
    await promisify(this.redisDb.SETEX).bind(this.redisDb)(key, duration, value);
  }

  /**
   * async method that removes an item from redis
   * @param {String} - representing the key.
   */
  async del(key) {
    await promisify(this.redisDb.DEL).bind(this.redisDb)(key);
  }
}

export const redisClient = new RedisClient();
export default redisClient;
