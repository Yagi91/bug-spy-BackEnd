const express = require("express");
const userCtrl = require("../controllers/user.controller");

const router = express.Router();

router.route("/api/users").get(userCtrl.list).post(userCtrl.create);

router
  .route("/api/users/:userId")
  .get(userCtrl.read)
  .put(userCtrl.update)
  .delete(userCtrl.remove);

router.param("userId", userCtrl.userByID); //The userByID method will be called whenever the API URL contains a userId parameter in it. It will make sure that the user object corresponding to the userId in the URL is available in the request object before the next() function is called.

module.exports = router;
