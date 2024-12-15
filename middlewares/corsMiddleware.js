const cors = require("cors");
const corsOptions = require("../config/corsOptions")

const corsMiddleware = cors(corsOptions);

module.exports = corsMiddleware;
