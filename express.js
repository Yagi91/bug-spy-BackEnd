const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const corsOptions = require("./config/cors-params");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const debug = require("debug")("bug-spy:express.js");
const RateLimit = require("express-rate-limit");

const app = express();
const limit = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // limit each IP to 100 requests per windowMs
  delayMs: 0, // disable delaying - full speed until the max limit is reached
  message: "Too many requests from this IP, please try again later.",
});

app.use(cors()); // enable CORS - Allows restricted resources on a web page to be requested from another domain outside the domain from which the first resource was served
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser()); // parse cookie header and populate req.cookies with an object keyed by the cookie names
app.use(compression()); // compress all responses
app.use(helmet()); // secure apps by setting various HTTP headers
app.set("trust proxy", true); //This is needed for rate limiting to work properly when behind a reverse proxy such as Heroku, Bluemix, AWS ELB, Nginx, etc
app.use(limit); // Limit repeated requests to public APIs and/or endpoints such as password reset

app.use("/", require("./routes/user.routes"));
app.use("/", require("./routes/auth.routes"));
app.use("/", require("./routes/project.routes"));
app.use("/", require("./routes/bug.routes"));

// Catch unauthorized errors
app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    debug("UnauthorizedError", err);
    res.status(401).json({ error: err.name + ": " + err.message });
  } else if (err) {
    res.status(400).json({ error: err.name + ": " + err.message });
    debug(err);
  }
});

module.exports = app;
