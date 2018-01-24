var LocalStrategy = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Post = mongoose.model('Post');

module.exports = function(passport) {
    // serialize for persistence
    passport.serializeUser(function(user, done) {
        return done(null, user._id);
    });
    // deserialize for persistence
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            return done(err, user);
        });
    });
    // login strategy
    passport.use('login', new LocalStrategy({
            passReqToCallback: true,
            session: true
        },
        function(req, username, password, done) {
            User.findOne({ 'username': username }, function(err, user) {
                var message = '';
                if (err) {
                    return done(err);
                }
                if (!user) {
                    message = 'login error - user not found';
                    return done(null, false, { message: message });
                }
                if (!isValidPassword(user, password)) {
                    message = 'login error - invalid password';
                    return done(null, false, { message: message });
                }
                return done(null, user);
            });
        }
    ));
    // signup strategy
    passport.use('signup', new LocalStrategy({
            passReqToCallback: true,
            session: true
        },
        function(req, username, password, done) {
            User.findOne({ 'username': username }, function(err, user) {
                var message = '';
                if (err) {
                    return done(err);
                }
                if (user) {
                    message = 'username already taken'; // we have already signed this user up
                    return done(null, false, { message: message });
                } else {
                    var newUser = new User()
                    newUser.username = username;
                    newUser.password = createHash(password);
                    newUser.save(function(err) {
                        if (err) {
                            throw err;
                        }
                        return done(null, newUser);
                    });
                }
            });
        }
    ));
    // check password hash
    var isValidPassword = function(user, password) {
        return bCrypt.compareSync(password, user.password);
    };
    // create password hash
    var createHash = function(password) {
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    };

}