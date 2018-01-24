var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var User = mongoose.model('User');

router.use(function(req, res, next) {
    console.log('req.user: ' + req.user);
    if (req.method === "GET") {
        // continue to next middleware or request handler
        console.log('GET request - continue without auth');
        return next();
    }
    if (req.isAuthenticated()) {
        // continue to next middleware or request handler
        console.log('user is authenticated - continue');
        return next();
    }
    // user not authenticated - redirect to login page
    console.log('user not authenticated and not GET request - redirect to login');
    res.redirect('/#login');
});

router.route('/checkauth')
    .get(function(req, res) {
        if (!req.user) {
            return res.send({
                state: 'failure',
                user: null,
                message: 'Invalid username or password.'
            });
        } else {
            return res.send({
                state: 'success',
                user: req.user ? req.user : null
            });
        }
    });

router.route('/posts')
    // returns all posts    
    .get(function(req, res) {
        // temporary solution
        Post.find(function(err, posts) {
            if (err) {
                return res.send(500, err);
            }
            return res.send(posts);
        });
    })
    // post
    .post(function(req, res) {
        var post = new Post();
        post.text = req.body.text;
        post.author = req.body.author;
        post.save(function(err, post) {
            if (err) {
                return res.send(500, err);
            }
            return res.json(post);
        });
    });

router.route('/posts/:id')
    // return post by id
    .get(function(req, res) {
        //
        Post.findById(req.params.id, function(err, post) {
            if (err) {
                res.send(err);
            }
            res.json(post);
        });
    })
    // update existing post by id
    .put(function(req, res) {
        Post.findById(req.params.id, function(err, post) {
            if (err) {
                res.send(err);
            }
            post.author = req.body.author;
            post.text = req.body.text;
            post.save(function(err, post) {
                if (err) {
                    res.send(err);
                }
                res.json(post);
            });
        });
    })
    // delete a post by id
    .delete(function(req, res) {
        Post.remove({
            _id: req.params.id
        }, function(err) {
            if (err) {
                res.send(err);
            }
            res.json('deleted :(');
        });
    });

module.exports = router;