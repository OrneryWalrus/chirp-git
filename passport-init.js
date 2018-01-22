var LocalStrategy = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Post = mongoose.model('Post');

module.exports = function(passport) {

    // Passport needs to be able to serialize and deserialize users to support persistence
    passport.serializeUser(function(user, done) {
        console.log('serializing user:', user._id);
        return done(null, user._id);
    });
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            /*
            if (err) {
                return done(err, false);
            }
            if (!user) {
                return done('user not found', false);
            }
            // provide located user to passport
            return done(user, true);
            */
            return done(err, user);
        });
    });
    passport.use('login', new LocalStrategy({
            passReqToCallback: true
        },
        function(req, username, password, done) {

            User.findOne({ 'username': username }, function(err, user) {

                // if err
                if (err) {
                    return done(err, false);
                }

                // no user with this username
                if (!user) {
                    return done('user ' + username + ' not found!', false);
                }

                // password incorrect
                if (!isValidPassword(user, password)) {
                    return done('incorrect password', false);
                }

                return done(null, user);

            });

        }
    ));
    passport.use('signup', new LocalStrategy({
            passReqToCallback: true
        },
        function(req, username, password, done) {
            User.findOne({ 'username': username }, function(err, user) {

                if (err) {
                    return done(err, false);
                }

                if (user) {
                    // we have already signed this user up
                    return done('username already taken', false);
                } else {
                    var newUser = new User()

                    newUser.username = username;
                    newUser.password = createHash(password);

                    newUser.save(function(err) {
                        if (err) {
                            throw err;
                        }
                        console.log('successfully signed up user ' + newUser.username);

                        return done(null, newUser);
                    });
                }
            });
        }
    ));

    var isValidPassword = function(user, password) {
        return bCrypt.compareSync(password, user.password);
    };

    var createHash = function(password) {
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    };

}