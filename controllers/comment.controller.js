const Comment = require('../models/comment.model');
const Bug = require('../models/bug.model');
const User = require('../models/user.model');
const errorHandler = require('../helpers/dbErrorHandler');
const debug = require('debug')('bug-spy:comment.controller.js');
const extend = require('lodash/extend');
const mongoose = require('mongoose');


const create = async (req, res) => {
    const comment = new Comment(req.body);
    const bug = await Bug.findById(req.body.bug);
    debug('Fetched bug');
    debug('Fetched user:');
    const user = await User.findById(req.body.user);
    debug('creating comment:', req.body);
    if (!bug || !user) {
        return res.status(400).json({ error: 'Referenced bug or user id is incorrect' });
    };
    // if parentComment is present, then it is a reply
    if (req.body.parentComment) {
        const parentComment = await Comment.findById(req.body.parentComment);
        if (!parentComment) {
            return res.status(400).json({ error: 'Referenced parent comment id is incorrect' });
        };
        comment.level = parentComment.level + 1;
        // check if the level of nesting is not more than 3
        if( comment.level > 3) {
            return res.status(400).json({ error: 'Maximum 3 levels of nesting is allowed' });
        }
        // check if parentComment and comment belong to same bug
        if (parentComment.bug.toString() !== comment.bug.toString()) {
            return res.status(400).json({ error: 'Parent comment and comment should belong to same bug' });
        }
        parentComment.replies.push(comment._id);
        debug('Updated parent comment');
        await parentComment.save();
    }
    try {
        await comment.save();
        debug('Comment successfully created');
        return res.status(200).json(comment);
    } catch (err) {
        debug('Error in creating comment:', err);
        return res.status(400).json({ error: errorHandler.getErrorMessage(err) });
    }
};

const list = async (req, res) => {
    try {
        const comments = await Comment.find().select('_id user text bug level created');
        debug('Fetched comments:', comments);
        return res.json(comments);
    } catch (err) {
        return res.status(400).json({ error: errorHandler.getErrorMessage(err) });
    }
};


const listByBugId = async (req, res) => {
    try {
        // Fetch all comments related to a specific bug
        const comments = await Comment.find({ bug: req.params.bugId })
            .sort('created')
            .populate('user', 'name _id')
            .exec();

        // Create a map where the key is the comment's ID and the value is the comment object with an added `replies` array
        const commentMap = {};
        comments.forEach(comment => {
            commentMap[comment._id] = { ...comment._doc, replies: [] };
        });
        
        // Iterate over the map. For each comment, if it has a parent, add it to the parent's `replies` array
        Object.values(commentMap).forEach(comment => {
            if (comment.parentComment) {
                if (commentMap[comment.parentComment]) {
                    commentMap[comment.parentComment].replies.push(comment);
                } else {
                    // Delete the comment if the parent comment is not available. This is to handle the case where a comment is a reply to a deleted comment and helps prevent orphaned comments
                    delete commentMap[comment._id];
                    Comment.deleteOne({ _id: comment._id }).exec();
                }
            }
        });
        
        // Filter out the top-level comments (those without a parent)
        const topLevelComments = Object.values(commentMap).filter(comment => !comment.parentComment);
        debug('Fetched comments Succesffully');
        res.json(topLevelComments);
    } catch (err) {
        return res.status(400).json({
            error: "Could not fetch comments"
        });
    }
};

const commentByID = async (req, res, next, id) => {
    debug('Fetchig comment');
    try {
        let comment = await Comment.findById(id);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        let profile = await User.findById(comment.user);
        debug('Fetched comment';
        req.comment = comment;
        req.profile = profile;
        next();
    }
    catch (err) {
        debug('Error in fetching comment');
        return res.status(400).json({
            error: "Could not fetch comment"
        });
    }
}

const read = (req, res) => {
    return res.json(req.comment);
};

const update = async (req, res) => {
    let comment = req.comment;
    comment = extend(comment, req.body);
    try {
        await comment.save();
        debug('Comment successfully updated');
        return res.status(200).json(comment);
    } catch (err) {
        debug('Error in updating comment');
        return res.status(400).json({ error: errorHandler.getErrorMessage(err) || 'Could not update comment' });
    }
};

const remove = async (req, res) => {
    const { comment } = req;
    debug('Removing comment');

    // Extracted the deletion of a single comment into a separate function
    const deleteComment = async (commentId) => {
        await Comment.deleteOne({ _id: commentId });
    };

    // Recursive function to delete a comment and its replies
    const deleteCommentTree = async (comment) => {
        if (comment.replies.length) {
            await Promise.all(comment.replies.map(async (reply) => {
                if (mongoose.Types.ObjectId.isValid(reply)) {
                    const replyComment = await Comment.findById(reply);
                    if (replyComment) {
                        await deleteCommentTree(replyComment);
                    }
                }
            }));
        }
        await deleteComment(comment._id);
    };

    try {
        await deleteCommentTree(comment);
        debug('Comment successfully deleted');

        if (comment.parentComment) {
            const parentComment = await Comment.findById(comment.parentComment);
            if (parentComment) {
                parentComment.replies.pull(comment._id);
                await parentComment.save();
            }
        }

        return res.status(200).json(comment);
    } catch (err) {
        debug('Error in deleting comment');
        return res.status(400).json({ error: errorHandler.getErrorMessage(err) || 'Could not delete comment' });
    }
};

module.exports = { create, list, listByBugId, commentByID, read, update, remove };