const User = require("../models/user.model");
const extend = require("lodash/extend");
const errorHandler = require("../helpers/dbErrorHandler");
const debug = require("debug")("bug-spy:user.controller.js");

//create a new user in the database as a user object
const create = async (req, res) => {
  const userExist = await User.exists({ email: req.body.email });
  if (userExist)
    return res
      .status(400)
      .json({ error: "A user with this email already exist." });

  const user = new User(req.body);
  debug("in create", req.body);
  try {
    await user.save();
    return res.status(200).json({
      message: "Successfully signed up!",
    });
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err), //Returns the error message from the error object using the getErrorMessage() method from the dbErrorHandler.js helper for any database-related errors that might occur when saving the user to the database.
    });
  }
};

//list all users in the database as an array of user objects
const list = async (req, res) => {
  debug("in list", req.body);
  try {
    let users = await User.find().select("name email role updated created"); //Find all users and only return the name, email, role, updated, and created fields
    res.json(users);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

//find a user in the database by its id and store it in the request object as a user object,it executes fetch and loads before passing control to the next function thats specific to the request that came in
const userByID = async (req, res, next, id) => {
  debug("in userByID", id);
  try {
    let user = await User.findById(id);
    if (!user) {
      return res.status(400).json({
        error: "User not found",
      });
    }
    req.profile = user;
    next();
  } catch (err) {
    return res.status(400).json({
      error: "Could not retrieve user",
    });
  }
};

//read a user from the database as a user object
const read = async (req, res) => {
  debug("in read", req.body);
  req.profile.hashed_password = undefined;
  req.profile.salt = undefined;
  return res.json(req.profile);
};

//update a user in the database as a user object with the new information
const update = async (req, res) => {
  debug("in update", req.body);
  try {
    let user = req.profile;
    user = extend(user, req.body); //extend - Mutates the first object by copying the properties of the second object to it. It returns the mutated object.
    user.updated = Date.now();
    await user.save();
    user.hashed_password = undefined;
    user.salt = undefined;
    res.json(user);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

//delete a user from the database
const remove = async (req, res) => {
  debug("in remove", req.body);
  try {
    let user = req.profile;
    let deletedUser = await User.deleteOne({ _id: user._id });
    deletedUser.hashed_password = undefined;
    deletedUser.salt = undefined;
    res.json(deletedUser);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

module.exports = {
  create,
  userByID,
  read,
  list,
  remove,
  update,
};
