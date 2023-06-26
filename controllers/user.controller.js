const User = require("../models/user.model");
const extend = require("lodash/extend");
const errorHandler = require("../helpers/dbErrorHandler");

//create a new user in the database as a user object
const create = async (req, res) => {
  const user = new User(req.body); //TODO: edit the req.body to ensure the fields frontend sends are the same as the ones in the model
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
  req.profile.hashed_password = undefined; //TODO: remove this line after testing
  req.profile.salt = undefined; //TODO: remove this line after testing
  return res.json(req.profile);
};

//update a user in the database as a user object with the new information
const update = async (req, res) => {
  try {
    let user = req.profile;
    user = extend(user, req.body); //extend - Mutates the first object by copying the properties of the second object to it. It returns the mutated object.
    user.updated = Date.now();
    await user.save();
    user.hashed_password = undefined; //TODO: remove this line after testing
    user.salt = undefined; //TODO: remove this line after testing
    res.json(user);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

//delete a user from the database
const remove = async (req, res) => {
  try {
    let user = req.profile;
    let deletedUser = await user.remove();
    deletedUser.hashed_password = undefined; //TODO: remove this line after testing
    deletedUser.salt = undefined; //TODO: remove this line after testing
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
