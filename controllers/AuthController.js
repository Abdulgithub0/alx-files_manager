import redisClient from '../utils/redis';
import dbClient from '../utils/db';
import getInfo from '../utils/auth';
import { v4 } from 'uuid';
import sha1 from 'sha1';

/**
 * AuthController - has methods that handle various endpoint access Authorization and user Authentication
 */
export default class AuthController{
  /**
   * Sign-in the user by generating a new authentication token that last for 24hrs.
   */
  static async getConnect(req, res) {
    const info = getInfo(req);
    if (info) {
      const isUser = await dbClient.findUserBy({ email: info.email });
      if (isUser) {
        if (sha1(info.password) === isUser.password) {
          const token = v4();
          await redisClient.set(`auth_${token}`, isUser._id.toString(), 86400);
          res.status(200).json({ token: token });
          return;
        }
      }
    }
    res.status(401).json({ error: 'Unauthorized' });
  }
  
  /**
   * sign-out the user based on the x-token value
   */
  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    if (token) {
      const key = `auth_${token}`
      const isSessionUser = await redisClient.get(key) ?? null;
      if (isSessionUser) {
        await redisClient.del(key);
        res.status(204).end();
        return;
      }
    }
    res.status(401).json({error: 'Unauthorized' });
  }
}
