const Comment = require('../models/comment.model');
const Bug = require('../models/bug.model');
const User = require('../models/user.model');
const errorHandler = require('../helpers/dbErrorHandler');
const debug = require('debug')('bug-spy:comment.controller.js');
const extend = require('lodash/extend');


const create = async (req, res) => {
    const comment = new Comment(req.body);
    const bug = await Bug.findById(req.body.bug);
    debug('Fetched bug:', bug);
    debug('Fetched user:', req.body.user);
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
        debug('Parent comment:', parentComment);
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
        debug('Updated parent comment:', parentComment);
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

// const getReplies = (comment) => {
//     if (!comment.replies.length) {//If there are no replies, return an empty array
//         debug('No replies for comment:', comment);
//         return [];
//     }

//     return comment.replies.map(reply => {//If there are replies, map through them and get their replies
//         debug('Replies for comment:', comment.text, reply);
//         return {
//             ...reply._doc,
//             replies: getReplies(reply)//Get the replies of the reply with a recursive function
//         };
//     });
// };

// const listByBugId = async (req, res) => {
//     try {
//         //Exempt the parentComment field from the query
//         const comments = await Comment.find({ bug: req.params.bugId, parentComment: null })
//             .populate('replies')
//             .exec();
//         debug('Fetched comments:', comments);

//         // Create a tree structure of comments
//         const commentsTree = comments.map(comment => {
//             return {
//                 ...comment._doc,//Exempt the replies field from the query
//                 replies: getReplies(comment)//Get the replies of the comment with a recursive function
//             };
//         });
//         res.json(commentsTree);
//     } catch (err) {
//         // return res.status(400).json({
//         //     error: "Could not fetch comments"
//         // });
//         return res.status(400).json({ error: errorHandler.getErrorMessage(err) });
//     }
// };

const listByBugId = async (req, res) => {
    try {
        // Fetch all comments related to a specific bug
        const comments = await Comment.find({ bug: req.params.bugId }).sort('created').exec();

        // Create a map where the key is the comment's ID and the value is the comment object with an added `replies` array
        const commentMap = {};
        comments.forEach(comment => {
            commentMap[comment._id] = { ...comment._doc, replies: [] };
        });
        console.log('commentMap:',commentMap);
        // Iterate over the map. For each comment, if it has a parent, add it to the parent's `replies` array
        Object.values(commentMap).forEach(comment => {
            if (comment.parentComment) {
                commentMap[comment.parentComment].replies.push(comment);
            }
        });
        console.log('after iter1 commentMap:',commentMap);
        // Filter out the top-level comments (those without a parent)
        const topLevelComments = Object.values(commentMap).filter(comment => !comment.parentComment);

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
        debug('Fetched comment:', comment);
        req.comment = comment;
        req.profile = profile;
        next();
    }
    catch (err) {
        return res.status(400).json({ error: errorHandler.getErrorMessage(err) });
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
        return res.status(400).json({ error: errorHandler.getErrorMessage(err) });
    }
};

const remove = async (req, res) => {
    let comment = req.comment;
    debug('Removing comment:', comment);
    try {
        let deletedComment = await Comment.deleteOne({_id: comment._id});
        let parentComment = await Comment.findById(deletedComment.parentComment);
        if (parentComment) {
            parentComment.replies.pull(deletedComment._id);
            await parentComment.save();
        }
        debug('Comment successfully deleted');
        return res.status(200).json(deletedComment);
    } catch (err) {
        console.log(err);
        return res.status(400).json({ error: errorHandler.getErrorMessage(err) });
    }
};

module.exports = { create, list, listByBugId, commentByID, read, update, remove };