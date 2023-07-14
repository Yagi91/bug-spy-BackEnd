const express = require("express");
const projectCtrl = require("../controllers/project.controller");
const authCtrl = require("../controllers/auth.controller");

const router = express.Router();

router.route("/api/projects").get(projectCtrl.list).post(projectCtrl.create);

router
  .route("/api/users/projects/:projectId")
  .get(authCtrl.requireSignin, projectCtrl.read)
  .put(authCtrl.requireSignin, projectCtrl.update)
  .delete(authCtrl.requireSignin, projectCtrl.remove);

router.param("projectId", projectCtrl.projectByID);

module.exports = router;
