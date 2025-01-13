import jwt from 'jsonwebtoken';

const generateTokenAndSetCookie = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '10d'
    });

    res.cookie('jwt', token, {
        maxAge: 10 * 24 * 60 * 60 * 1000,
        htppOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'none',
        domain: '.vercel.app',
        path: '/'
    });
};

export default generateTokenAndSetCookie;
