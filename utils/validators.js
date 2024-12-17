const validateRegisterInput = ({ name, username, email, password }) => {
    if (!name || !username || !email || !password) {
        return "Name, username, email, and password are required.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return "Invalid email format.";
    }

    if (password.length < 6) {
        return "Password must be at least 6 characters.";
    }

    return null;
};

const validateLoginInput = ({ username, password }) => {
    if (!username || !password) {
        return "Username and password are required.";
    }
    return null;
};

module.exports = { validateRegisterInput, validateLoginInput };
