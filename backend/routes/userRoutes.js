import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import {
    getUserProfile,
    getUsers,
    getUserSuggestions,
    toggleFollowStatus,
    updateUserProfile
} from '../controllers/UserController.js';

const router = express.Router();

router
    .get('/', protectRoute, getUsers)
    .get('/profile/:username', protectRoute, getUserProfile)
    .get('/suggestions', protectRoute, getUserSuggestions)
    .post('/follow/:id', protectRoute, toggleFollowStatus)
    .post('/update', protectRoute, updateUserProfile);

export default router;
