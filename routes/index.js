import { Router, json, urlencoded } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';


const router = Router();

// local router middleware for parsing  application/json request body
router.use(json({limit: '10mb'}));

// handle route to db and redis status state
router.get('/status', AppController.getStatus);

// handle route to number of users and files on db
router.get('/stats', AppController.getStats);

//handle route to new user creation
router.post('/users', UsersController.postNew);

// handle user login
router.get('/connect', AuthController.getConnect);

// handle user logout
router.get('/disconnect', AuthController.getDisconnect);

// handle active user session
router.get('/users/me', UsersController.getMe);

// handle files upload
router.post('/files', FilesController.postUpload);

// handle retrieval of  file document based on the ID
router.get('/files/:id', FilesController.getShow);

// retrieve all users file documents for a specific parentId and with pagination
router.get('/files', FilesController.getIndex);

export default router;
