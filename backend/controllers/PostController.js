import User from '../models/User.js';
import Post from '../models/Post.js';
import Notification from '../models/Notification.js';
import { v2 as cloudinary } from 'cloudinary';

export const createPost = async (req, res) => {
    try {
        const { text } = req.body;
        const userId = req.user._id.toString();
        let { image } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        if (image) {
            const uploadedResponse = await cloudinary.uploader.upload(image);
            image = uploadedResponse.secure_url;
        }

        if (!text && !image) {
            return res.status(400).json({
                error: 'Post must contain an image or a text'
            });
        }

        const newPost = new Post({
            user: userId,
            text,
            image
        });

        await newPost.save();
        return res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({
            error: 'Internal server error'
        });
        console.log('Error in createPost controller: ', error);
    }
};

export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                error: 'Post not found'
            });
        }

        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                error: 'You are not authorized to delete this post'
            });
        }

        if (post.img) {
            const imgId = post.img.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(imgId);
        }

        await Post.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            message: 'Post deleted succesfully'
        });
    } catch (error) {
        console.log('Error in deletePost controller: ', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

export const commentOnPost = async (req, res) => {
    try {
        const { text } = req.body;
        const postId = req.params.id;
        const userId = req.user._id;

        if (!text) {
            return res.status(400).json({
                error: 'Text field is required'
            });
        }

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                error: 'Post not found'
            });
        }

        const comment = {
            user: userId,
            text,
            createdAt: new Date()
        };

        post.comments.push(comment);
        await post.save();

        return res.status(200).json(post);
    } catch (error) {
        console.error('Error commenting on post:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const likeDislikePost = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id: postId } = req.params;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const userLikedPost = post.likes.includes(userId);

        if (userLikedPost) {
            await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
            await User.updateOne(
                { _id: userId },
                { $pull: { likedPosts: postId } }
            );

            const updatedPost = await Post.findById(postId).select('likes');

            return res.status(200).json({
                likes: updatedPost.likes,
                isLikedByUser: false
            });
        } else {
            await Post.updateOne(
                { _id: postId },
                { $addToSet: { likes: userId } }
            );
            await User.updateOne(
                { _id: userId },
                { $addToSet: { likedPosts: postId } }
            );

            // Prevent duplicate notifications
            const existingNotification = await Notification.findOne({
                from: userId,
                to: post.user,
                type: 'like',
                post: postId
            });

            if (!existingNotification) {
                const notification = new Notification({
                    from: userId,
                    to: post.user,
                    type: 'like',
                    post: postId
                });
                await notification.save();
            }

            // Refetch updated post likes
            const updatedPost = await Post.findById(postId).select('likes');
            return res.status(200).json({
                likes: updatedPost.likes,
                isLikedByUser: !userLikedPost
            });
        }
    } catch (error) {
        console.error('Error in likeDislikePost:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const getAllPosts = async (req, res) => {
    try {
        const userId = req.user._id; // The authenticated user's ID
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate('user', '-password')
            .populate('comments.user', '-password')
            .populate('likes', '-password');

        const postsWithLikeStatus = posts.map((post) => ({
            ...post.toObject(),
            isLikedByUser: post.likes.some(
                (like) => like._id.toString() === userId.toString()
            )
        }));

        return res.status(200).json(postsWithLikeStatus);
    } catch (error) {
        console.log('Error in getAllPosts controller: ', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

export const getLikedPosts = async (req, res) => {
    const userId = req.user._id;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
            .populate('user', '-password')
            .populate('comments.user', '-password')
            .populate('likes', '-password');

        return res.status(200).json(likedPosts);
    } catch (error) {
        console.log('Error in getLikedPosts controller: ', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

export const getFollowingPosts = async (req, res) => {
    const userId = req.user._id;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        const followingPosts = await Post.find({
            user: { $in: user.following }
        })
            .sort({ createdAt: -1 })
            .populate('user', '-password')
            .populate('comments.user', '-password')
            .populate('likes', '-password');

        return res.status(200).json(followingPosts);
    } catch (error) {
        console.log('Error in getFollowingPosts controller: ', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

export const getUserPosts = async (req, res) => {
    const { username } = req.params;

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        const myPosts = await Post.find({ user: user._id })
            .sort({ createdAt: -1 })
            .populate('user', '-password')
            .populate('comments.user', '-password')
            .populate('likes', '-password');

        return res.status(200).json(myPosts);
    } catch (error) {
        console.log('Error in getMyPosts controller: ', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};
