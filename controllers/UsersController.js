import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import { ObjectId } from 'mongodb';

/**
 * Interface to dbClient that handles user creation
 */
export default class UsersController{
  /**
   * postNew middleware - create new user
   */
  static async postNew(req, res) {
    const email = req.body?.email ?? null;
    const pword = req.body?.password ?? null;
    if (!email) {
      res.status(400).json({ error: 'Missing email' });
      return;
    }
    if (!pword) {
      res.status(400).json({ error: 'Missing password' });
      return;
    }

    const userExist =  await dbClient.findUserBy({ email: email });
    if (userExist) {
      res.status(400).json({ error: 'Already exist' });
      return;
    }

    const newUser = await dbClient.createUser(email, pword);
    if (!newUser)
      res.status(400).json({ error: null });
    res.status(201).json(newUser);
  }

  /**
   * retrieve the user base on the x-token used
   */
  static async getMe(req, res) {
    const token = req.headers['x-token'];
    if (token) { 
      const id = await redisClient.get(`auth_${token}`);
      if (id) {
        const user = await dbClient.findUserBy({ _id: ObjectId(id) });
        if (user) {
          res.status(200).json({ email: user.email, _id: id });
          return;
        }
      }  
    }
    res.status(401).json({ error: 'Unauthorized'});
  }
}

