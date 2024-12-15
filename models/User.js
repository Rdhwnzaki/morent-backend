const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    id: {
        type: mongoose.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId()
    },
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phone_number: {
        type: String,
    },
    address: {
        type: String,
    },
    city: {
        type: String,
    },
    image: {
        type: String,
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user",
    },
}, { timestamps: true })

module.exports = mongoose.model("User", userSchema);