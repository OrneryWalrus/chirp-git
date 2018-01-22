var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    username: String,
    password: String, // bCrypt hash
    time: {
        type: Date,
        default: Date.now
    }
});

var postSchema = new mongoose.Schema({
    text: String,
    author: String,
    time: {
        type: Date,
        default: Date.now
    }
});

// declare user model which has schema userSchema
mongoose.model('User', userSchema);
// declare post model which has schema postSchema
mongoose.model('Post', postSchema);

// utility functions
/*
var User = mongoose.model('User');
exports.findByUsername = function(userName, callback) {
    User.findOne({ user_name: userName }, function(err, user) {
        if (err) {
            return callback(err);
        }
        // success
        return callback(null, user);
    });
}
exports.findById = function(id, callback) {
    User.findById(id, function(err, user) {
        if (err) {
            return callback(err);
        }
        return callback(null, user);
    });
}
*/