const express = require("express");
const authCtrl = require("../controllers/auth.controller");

const router = express.Router();

router.route("/auth/signin").post(authCtrl.signin); //POST request to authenticate the user with email and password
router.route("/auth/signout").get(authCtrl.signout); //GET request to clear the cookie containing a JWT that was set on the response object after signing in a user.
