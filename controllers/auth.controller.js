const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const { expressjwt: expressJwt } = require("express-jwt");
const config = require("../config/config");
const debug = require("debug")("bug-spy:auth.controller.js");

const signin = async (req, res) => {
  try {
    console.log('body: ', req.body);
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    if (!user.authenticate(req.body.password)) {
      return res.status(401).send({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ _id: user._id }, config.jwtSecret);
    res.cookie("t", token, { expire: new Date() + 9999 }); //cookie expires in about 2.7 hours, "t" is the name of the cookie, token is cookie value, and the cookie is HTTP-only cookie which is the default for the cookie-parser module

    return res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });
  } catch (err) {
    debug("Error in signin:", err);
    return res.status(401).json({ error: "Could not sign in" });
  }
};
const signout = async (req, res) => {
  res.clearCookie("t");
  return res.status(200).json({ message: "Signed out" });
};

//Requires the incoming request to have a valid JWT in the Authorization header in order to access the protected route
//expressJWT works by adding a property to the request object called auth which contains the payload of the JWT that can be accessed in any of the following middleware functions using req.auth

const requireSignin = expressJwt({
  secret: config.jwtSecret,
  userProperty: "auth",
  algorithms: ["HS256"],
});
const hasAuthorization = (req, res, next) => {
  //Checks if the authenticated user is the same as the user being updated or deleted before allowing the request to proceed
  const authorized = req.profile && req.auth && req.profile._id == req.auth._id; //req.profile is the user object that was loaded from the database in the userByID controller, req.auth is the payload of the JWT in the auth property of the request object, and req.profile._id is the id of the user being updated or deleted
  if (!authorized) {
    return res.status(403).json({ error: "User is not authorized" });
  }
  debug("user is authorized");
  next();
};

module.exports = {
  signin,
  signout,
  requireSignin,
  hasAuthorization,
};
