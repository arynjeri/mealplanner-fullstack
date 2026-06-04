const User = require('../models/User');
const jwt = require('jsonwebtoken');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

// 🟢 FIXED: Added 'next' to the parameter arguments array list
exports.signup = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const newUser = await User.create({
            name,
            email,
            password
        });

        const token = signToken(newUser._id);
        newUser.password = undefined; 

        res.status(201).json({
            status: 'success',
            token,
            data: { user: newUser }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email address already in use.' });
        }
        // Safely pass the error along to your global error handler middleware!
        next(error); 
    }
};

// 🟢 FIXED: Added 'next' here as well for safety
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password.' });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.correctPassword(password, user.password))) {
            return res.status(401).json({ message: 'Incorrect email or password.' });
        }

        const token = signToken(user._id);
        user.password = undefined;

        res.status(200).json({
            status: 'success',
            token,
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};