import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { getProfile, getSuggestedUsers, toggleFollowStatus, updateUser } from '../controllers/UserController.js';

const router = express.Router();

router.get('/profile/:username', protectRoute, getProfile)
    .get('/suggested', protectRoute, getSuggestedUsers)
    .post('/follow/:id', protectRoute, toggleFollowStatus)
    .post('/update', protectRoute, updateUser)

export default router;