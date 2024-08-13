import User from "../models/User.js";
import generateTokenAndSetCookie from "../utils/generateToken.js";
import bcrypt from 'bcryptjs';

export const signup = async (req, res) => {
    try {
        const {fullName, username, email, password } = req.body,
            emailRegex = /^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gim,
            existingUser = await User.findOne({ username }),
            existingEmail = await User.findOne({ username });

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: 'Invaild email format'
            });
        }

        if (existingUser) {
            return res.status(400).json({
                error: 'Username is already taken'
            });
        }

        if (existingEmail) {
            return res.status(400).json({
                error: 'Email already used'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                error: 'Password must be at least 6 characters long'
            })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            username: username,
            fullName: fullName,
            email: email,
            password: hashedPassword
        })

        if (newUser) {
            generateTokenAndSetCookie(newUser.id, res);
            await newUser.save();
            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                username: newUser.username,
                email: newUser.email,
                followers: newUser.followers,
                following: newUser.following,
                coverImage: newUser.coverImage
            })
        } else {
            res.status(400).json({
                error: 'Invalid user data'
            });
        }

    } catch (error) {
        console.log('Error in signup controller', error.message);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

export const login = async (req, res) => {
    try {
        const { username, password } = req.body,
            user = await User.findOne({ username }),
            isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

        if (!user || !isPasswordCorrect) {
            return res.status(400).json({
                error: "Invalid username or password"
            })
        }

        generateTokenAndSetCookie(user._id, res);

        res.status(200).json({                
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            followers: user.followers,
            following: user.following,
            coverImage: user.coverImage
        });
        
    } catch (error) {
        console.log('Error in signup controller', error.message);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

export const logout = async (req, res) => {
    try {
        res.cookie("jwt", "", {maxAge: 0});
        res.status(200).json({
            message: 'Logged out succesfully'
        })
    } catch (error) {
        console.log('Error when trying to logout');
        res.status(500).json({
            error: 'Internal server error'
        })
    }
};

export const getMyAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json(user);
    } catch (error) {
        console.log('Error in protectRoute middleware', error.message);
        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
}