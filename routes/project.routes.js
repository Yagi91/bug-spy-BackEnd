const express = require("express");
const projectCtrl = require("../controllers/project.controller");
const authCtrl = require("../controllers/auth.controller");

const router = express.Router();

router.route("/api/projects").get(projectCtrl.list).post(projectCtrl.create);

router
  .route("/api/projects/:projectId")
  .get(authCtrl.requireSignin, projectCtrl.read)
  .put(authCtrl.requireSignin, projectCtrl.update)
  .delete(authCtrl.requireSignin, projectCtrl.remove);

router
  .route("/api/projects/details/:projectName")
  .get(authCtrl.requireSignin, projectCtrl.read);

router.param("projectId", projectCtrl.projectByID);
router.param("projectName", projectCtrl.projectByName);

module.exports = router;
