import { Router, json, urlencoded } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';

const router = Router();

// local router middleware for parsing  application/json request body
router.use(json());

// handle route to db and redis status state
router.get('/status', AppController.getStatus);

// handle route to number of users and files on db
router.get('/stats', AppController.getStats);

//handle route to new user creation
router.post('/users', UsersController.postNew);

export default router;
