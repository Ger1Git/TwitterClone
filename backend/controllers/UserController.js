import User from "../models/User.js";
import Notification from "../models/Notification.js";
import bcrypt from "bcryptjs";
import {v2 as cloudinary} from 'cloudinary';


export const getProfile = async (req, res) => {
    const { username } = req.params;

    try {
        const user = await User.findOne({ username }).select("-password");
        
        if (!user) {
            return res.status(404).json({
                error: "User not found"
            })
        }

        res.status(200).json(user);
    } catch (error) {
        console.log('Error in getProfile', error.message);
        res.status(500).json({
            error: error.message
        })
    }
}

export const toggleFollowStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);

        if (id === req.user._id.toString()) {
            return res.status(400).json({
                error: "You cannot follow yourself"
            });
        }

        if (!userToModify || !currentUser) {
            return res.status(400).json({
                error: "User not found"
            });
        }

        const isFollowing = currentUser.following.includes(id);

        if (isFollowing) {
            // Unfollow logic
            await User.findByIdAndUpdate(id, {
                $pull: { followers: req.user._id }
            });
            await User.findByIdAndUpdate(req.user._id, { 
                $pull: { following: id }
            })

            const newNotification = new Notification({
                type: 'follow',
                from: req.user._id,
                to: userToModify._id
            });
            
            await newNotification.save();

            res.status(200).json({
                message: "User unfollowed succesfully"
            });
        } else {
            // Follow logic
            await User.findByIdAndUpdate(id, {
                $push: { followers: req.user._id }
            });

            await User.findByIdAndUpdate(req.user._id, { 
                $push: { following: id }
            })

            const newNotification = new Notification({
                type: 'follow',
                from: req.user._id,
                to: userToModify._id
            });
            
            await newNotification.save();

            res.status(200).json({
                message: "User followed succesfully"
            });
        }
    } catch (error) {
        console.log('Error in protectRoute middleware', error.message);
        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
}

export const getSuggestedUsers = async (req, res) => {
    try {
        const userId = req.user._id;

        const usersFollowed = await User.findById(userId).select("following");

        const users = await User.aggregate([
            {
                $match: {
                    _id: {$ne: userId}
                }
            },
            {$sample: {size: 20}}
        ])

        const filteredUsers = users.filter(user => !usersFollowed.following.includes(user._id));
        const suggestedUsers = filteredUsers.slice(0, 6);

        suggestedUsers.forEach( user => user.password = null);

        res.status(200).json(suggestedUsers);
    } catch (error) {
        console.log("Error in getSuggestedUsers: ", error.message);
        res.status(500).json({
            error: error.message
        });
    }
}

export const updateUser = async (req, res) => {
    const { fullName, email, username, currentPassword, newPassword, bio, link} = req.body;
    let { profileImg, coverImg } = req.body;
    const userId = req.user._id;
    
    try {
        let user = await User.findById(userId);

        if (!user) return res.status(404).json({ error: 'User not found'});

        if ((!newPassword && currentPassword) || (newPassword && !currentPassword)) {
            return res.status(404).json({
                error: "Plase provide both current password and new password"
            })
        }

        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);

            if (!isMatch) {
                return res.status(400).json({
                    error: "Current password is incorrect"
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    error: "Password needs to be at least 6 characters long"
                })
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        if (profileImg) {
            if (user.profileImage) {
                await cloudinary.uploader.destroy(user.profileImage.split("/").pop().split(".")[0]);
            }

            const uploadedIMG = await cloudinary.uploader.upload(profileImg);
            profileImg = uploadedIMG.secure_url;
        }

        if (coverImg) {
            if (user.coverImage) {
                await cloudinary.uploader.destroy(user.coverImage.split("/").pop().split(".")[0]);
            }

            const uploadedIMG = await cloudinary.uploader.upload(coverImg);
            coverImg = uploadedIMG.secure_url;
        }

        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImage = profileImg || user.profileImage;
        user.coverImage = coverImg || user.coverImage;

        user = await user.save();

        user.password = null;

        return res.status(200).json(user);
    } catch (error) {
        console.log("Error in getSuggestedUsers: ", error.message);
        res.status(500).json({
            error: error.message
        });
    }
}