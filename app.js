var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var bCrypt = require('bcrypt-nodejs');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var mongoose = require('mongoose');
var models = require('./models/models');
var User = mongoose.model('User');
var Post = mongoose.model('Post');
var dbConfig = require('./config/database');

// connect to database
mongoose.connect(dbConfig.url);

// import routers
var index = require('./routes/index');
var api = require('./routes/api');
var authenticate = require('./routes/authenticate')(passport);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(session({
    secret: 'secret string is not here'
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());

// register routers
app.use('/', index);
app.use('/api', api);
app.use('/auth', authenticate);

// initialize passport
//var initPassport = require('./passport-init');
//initPassport(passport);
passport.serializeUser(function(user, done) {
    console.log('serializing user:', user._id);
    return done(null, user._id);
});
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        return done(err, user);
    });
});
passport.use('login', new LocalStrategy({
        passReqToCallback: true
    },
    function(req, username, password, done) {
        User.findOne({ 'username': username }, function(err, user) {
            if (err) {
                return done(err, false);
            }
            if (!user) {
                return done('user ' + username + ' not found!', false);
            }
            if (!isValidPassword(user, password)) {
                return done('incorrect password', false);
            }
            return done(null, user);
        });
    }
));
passport.use('signup', new LocalStrategy({
        passReqToCallback: true,
        session: true
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

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// dev error handler
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}
// prod error handler
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;