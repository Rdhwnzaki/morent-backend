const User = require("../../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validateLoginInput } = require("../../utils/validators");
const { createError } = require("../../utils/errorHandler");

const loginUser = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const validationError = validateLoginInput({ username, password });
        if (validationError) return res.status(400).json({ message: validationError });

        const user = await User.findOne({ username });
        if (!user) return next(createError(400, "Invalid username or password."));

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return next(createError(400, "Invalid username or password."));

        const token = generateToken(user);

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

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );
};

module.exports = { loginUser };
