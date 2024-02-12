import { Router } from 'express';
import AppController from '../controllers/AppController';

const router = Router();
// handle route to db and redis status state
router.get('/status', AppController.getStatus);

// handle route to number of users and files on db
router.get('/stats', AppController.getStats);

export default router;
