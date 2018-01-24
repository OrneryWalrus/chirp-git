var app = angular.module('chirpApp', ['ngRoute', 'ngResource']).run(function($rootScope, $http) {
    $http.get('/api/checkauth').success(function(data) {
        if (data.state === 'success') {
            $rootScope.authenticated = true;
            $rootScope.user = data.user;
            $rootScope.current_user = data.user.username;
        }
        if (data.state === 'failure') {
            $rootScope.authenticated = false;
            $rootScope.user = null;
            $rootScope.current_user = '';
        }
    });
    $rootScope.signout = function() {
        $http.get('/auth/signout');
        $rootScope.authenticated = false;
        $rootScope.user = null;
        $rootScope.current_user = '';
    };
});

app.config(function($routeProvider) {
    $routeProvider
    // timeline display
        .when('/', {
            templateUrl: 'main.html',
            controller: 'mainController'
        })
        // login display
        .when('/login', {
            templateUrl: 'login.html',
            controller: 'authController'
        })
        // signup display
        .when('/signup', {
            templateUrl: 'signup.html',
            controller: 'authController'
        });
});

app.factory('postFactory', function($resource) {
    return $resource('/api/posts/:id');
    /* replaced by ngResource
    var factory = {};
    factory.getAll = function() {
        return $http.get('/api/posts');
    };
    return factory;
    */
});

app.controller('mainController', function($rootScope, $scope, postFactory) {
    $scope.posts = postFactory.query();
    $scope.newPost = {
        author: '',
        text: '',
        time: ''
    };

    $scope.post = function() {
        $scope.newPost.author = $rootScope.current_user;
        $scope.newPost.time = Date.now();
        postFactory.save($scope.newPost, function() {
            $scope.posts = postFactory.query();
            $scope.newPost = {
                author: '',
                text: '',
                time: ''
            };
        });
    };
});

app.controller('authController', function($scope, $rootScope, $http, $location) {
    if ($rootScope.authenticated === false) {
        $scope.user = {
            username: '',
            password: ''
        };
        $scope.errorMessage = '';
    } else {
        $scope.errorMessage = 'Already authenticated as ' + $rootScope.current_user;
        $location.path('/');
    }

    $scope.login = function() {
        $http.post('/auth/login', $scope.user).success(function(data) {
            if (data.state === 'success') {
                $rootScope.authenticated = true;
                $rootScope.current_user = data.user.username;
                $location.path('/');
            } else {
                $scope.errorMessage = data.message;
            }
        });
    };
    $scope.signup = function() {
        $http.post('/auth/signup', $scope.user).success(function(data) {
            if (data.state === 'success') {
                $rootScope.authenticated = true;
                $rootScope.current_user = data.user.username;
                $location.path('/');
            } else {
                $scope.errorMessage = data.message;
            }
        });
    };
});