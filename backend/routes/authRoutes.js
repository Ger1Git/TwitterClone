import express from 'express';
import { signup,login, logout, getMyAccount} from '../controllers/Authentication.js';
import { protectRoute } from '../middleware/protectRoute.js'

const router = express.Router();

router.get('/auth', protectRoute, getMyAccount)
    .post('/signup', signup)
    .post('/login', login)
    .post('/logout', logout);

export default router;