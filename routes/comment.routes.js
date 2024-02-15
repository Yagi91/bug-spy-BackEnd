const express = require("express");
const authCtrl = require("../controllers/auth.controller");
const commentCtrl = require("../controllers/comment.controller");

const router = express.Router();

router
    .route("/api/comments")
    .get(commentCtrl.list)
    .post(commentCtrl.create);

router.param("commentId", commentCtrl.commentByID);

router.route("/api/comments/:commentId").get(commentCtrl.read).put(authCtrl.requireSignin, authCtrl.hasAuthorization, commentCtrl.update).delete(authCtrl.requireSignin, authCtrl.hasAuthorization, commentCtrl.remove);

router.route("/api/comments/bug/:bugId").get(authCtrl.requireSignin, commentCtrl.listByBugId);

module.exports = router;
