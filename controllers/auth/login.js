const redis = require("../../utils/redis");
const User = require("../../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validateLoginInput } = require("../../utils/validators");
const { createError } = require("../../utils/errorHandler");

const MAX_LOGIN_ATTEMPTS = 5;
const BLOCK_TIME = 60 * 5;

const loginUser = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        const validationError = validateLoginInput({ username, password });
        if (validationError) return res.status(400).json({ message: validationError });

        const attempts = await redis.get(`login_attempts:${username}`);
        if (attempts >= MAX_LOGIN_ATTEMPTS) {
            return next(createError(429, "Too many failed login attempts. Try again later."));
        }

        const user = await User.findOne({ username });
        if (!user) {
            await increaseLoginAttempts(username);
            return next(createError(400, "Invalid username or password."));
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            await increaseLoginAttempts(username);
            return next(createError(400, "Invalid username or password."));
        }

        await redis.del(`login_attempts:${username}`);

        const token = generateToken(user);

        await redis.set(`user_token:${user._id}`, token, "EX", 3600);

        res.status(200).json({
            message: "Login successful.",
            token,
            data: {
                id: user._id,
                name: user.name,
                username: user.username,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
};

const increaseLoginAttempts = async (username) => {
    const key = `login_attempts:${username}`;
    const attempts = await redis.incr(key);

    if (attempts === 1) {
        await redis.expire(key, BLOCK_TIME);
    }
};

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );
};

module.exports = { loginUser };
