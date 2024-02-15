const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    // major fields...
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: String,
    parentComment: { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
    replies: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    bug: { type: Schema.Types.ObjectId, ref: 'Bug', required: true },
    // other fields...
    level: { type: Number, default: 1 },
    created: { type: Date, default: Date.now },
});

const Comment = mongoose.model('Comment', CommentSchema);
module.exports = Comment;