const express = require("express");
const userCtrl = require("../controllers/user.controller");
const authCtrl = require("../controllers/auth.controller");

const router = express.Router();

router.route("/api/users").get(userCtrl.list).post(userCtrl.create);

//The listBugsByUser route will be used to retrieve all bugs assigned to a user. The listBugsByUser method in the controller will query the Bug model to find all bugs where the assignee field matches the userId in the request.

//The update and remove routes require authentication and authorization while the read route requires only authentication.
router
  .route("/api/users/:userId")
  .get(authCtrl.requireSignin, userCtrl.read)
  .put(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.update)
  .delete(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.remove);

router.param("userId", userCtrl.userByID); //The userByID method will be called whenever the API URL contains a userId parameter in it. It will make sure that the user object corresponding to the userId in the URL is available in the request object before the next() function is called.

module.exports = router;