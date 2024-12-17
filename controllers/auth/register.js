const User = require("../../models/User");
const bcrypt = require("bcrypt");
const { validateRegisterInput } = require("../../utils/validators");
const { createError } = require("../../utils/errorHandler");

const registerUser = async (req, res, next) => {
    try {
        const { name, username, email, password } = req.body;
        const validationError = validateRegisterInput({ name, username, email, password });

        if (validationError) return res.status(400).json({ message: validationError });
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return next(createError(400, "Username or email already exists."));
        }

        const SALT_ROUNDS = 10;
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const newUser = new User({
            name,
            username,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        res.status(201).json({
            message: "User registered successfully.",
            data: {
                id: newUser._id,
                name: newUser.name,
                username: newUser.username,
                email: newUser.email,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { registerUser };
