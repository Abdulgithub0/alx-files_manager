import dbClient from '../utils/db';
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

    const userExist =  await dbClient.findUserBy(email);
    if (userExist) {
      res.status(400).json({ error: 'Already exist' });
      return;
    }

    const newUser = await dbClient.createUser(email, pword);
    if (!newUser)
      res.status(400).json({ error: null });
    res.status(201).json(newUser);
  }
}

