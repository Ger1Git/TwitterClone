import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { createPost, deletePost, commentOnPost, likeDislikePost, getAllPosts, getLikedPosts, getFollowingPosts, getUserPosts } from '../controllers/PostController.js';

const router = express.Router();

router.get("/all", protectRoute, getAllPosts)
    .get("/following", protectRoute, getFollowingPosts)
    .get("/likes/:id", protectRoute, getLikedPosts)
    .get("/user/:username", protectRoute, getUserPosts)
    .post('/create', protectRoute, createPost)
    .post('/like/:id', protectRoute, likeDislikePost)
    .post('/comment/:id', protectRoute, commentOnPost)
    .delete('/delete/:id', protectRoute, deletePost)

export default router;