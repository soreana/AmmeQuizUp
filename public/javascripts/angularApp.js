var app = angular.module('flapperNews', ['ui.router']);

app.factory('posts', ['$http', 'auth', function ($http, auth) {
    var o = {
        posts: [
            {title: 'example post : posts didn\'t load', upvotes: 16},
        ]
    };

    o.getAll = function () {
        return $http.get('/posts').success(function (data) {
            angular.copy(data, o.posts);
        });
    };

    o.creat = function (post) {
        return $http.post('/posts', post, {
            headers: {Authorization: 'Bearer ' + auth.getToken()}
        }).success(function (data) {
            o.posts.push(data);
        });
    };

    o.upvote = function (post) {
        return $http.put('/posts/' + post._id + '/upvote', null, {
            headers: {Authorization: 'Bearer ' + auth.getToken()}
        }).success(function (data) {
            post.upvotes += 1;
        });
    };

    o.get = function (id) {
        return $http.get('/posts/' + id).then(function (res) {
            return res.data;
        });
    };

    o.addComment = function (id, comment) {
        return $http.post('/posts/' + id + '/comments', comment, {
            headers: {Authorization: 'Bearer ' + auth.getToken()}
        });
    };

    o.upvoteComment = function (post, comment) {
        return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote', null, {
            headers: {Authorization: 'Bearer ' + auth.getToken()}
        }).success(function (data) {
            comment.upvotes += 1;
        });
    };

    return o;
}]);

app.factory('auth', ['$http', '$window', '$state', function ($http, $window ,$state) {
    var auth = {};

    auth.saveToken = function (token) {
        $window.localStorage['flapper-news-token'] = token;
    };

    auth.getToken = function () {
        return $window.localStorage['flapper-news-token'];
    };

    auth.isLoggedIn = function () {
        var token = auth.getToken();
        if (token) {
            var payload = JSON.parse($window.atob(token.split('.')[1]));

            var temp = payload.exp > Date.now() / 1000;
            return temp;
        } else {
            return false;
        }
    };

    auth.currentUser = function () {
        if (auth.isLoggedIn()) {
            var token = auth.getToken();
            var payload = JSON.parse($window.atob(token.split('.')[1]));

            return payload.username;
        }
    };

    auth.register = function (user) {
        return $http.post('/register', user).success(function (data) {
            auth.saveToken(data.token);
        });
    };

    auth.login = function (user) {
        return $http.post('/login', user).success(function (data) {
            auth.saveToken(data.token);
        });
    };

    auth.logout = function () {
        $state.go('login');
        $window.localStorage.removeItem('flapper-news-token');
    };

    return auth;
}]);

app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('dashboard', {
                url: '/dashboard',
                templateUrl: '/dashboard.html',
                controller: 'DashboardCtrl',
                resolve: {
                    postPromise: ['posts', function (posts) {
                        return posts.getAll();
                    }]
                },
                onEnter: ['$state','auth',function ($state,auth) {
                    if(!auth.isLoggedIn()){
                        $state.go('login');
                    }
                }]
            });
        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: '/home.html',
                controller: 'MainCtrl',
                resolve: {
                    postPromise: ['posts', function (posts) {
                        return posts.getAll();
                    }]
                },
                onEnter: ['$state','auth',function ($state,auth) {
                    if(auth.isLoggedIn()){
                        $state.go('dashboard');
                    }
                }]
            });
        $stateProvider
            .state('posts', {
                url: '/posts/{id}',
                templateUrl: '/posts.html',
                controller: 'PostsCtrl',
                resolve: {
                    post: ['$stateParams', 'posts', function ($stateParams, posts) {
                        return posts.get($stateParams.id);
                    }]
                }
            });

        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: '/login.html',
                controller: 'AuthCtrl',
                onEnter: ['$state', 'auth', function ($state, auth) {
                    if (auth.isLoggedIn()) {
                        $state.go('dashboard');
                    }
                }]
            });

        $stateProvider
            .state('register', {
                url: '/register',
                templateUrl: '/register.html',
                controller: 'AuthCtrl',
                onEnter: ['$state', 'auth', function ($state, auth) {
                    if (auth.isLoggedIn()) {
                        $state.go('dashboard');
                    }
                }]
            });


        $urlRouterProvider.otherwise('dashboard');
    }]);

app.controller('PostsCtrl',
    ['$scope', 'posts', 'post', 'auth',
        function ($scope, posts, post, auth) {
            $scope.post = post;
            $scope.addComment = function () {
                if (!$scope.body || $scope.body === '') return;
                if (!$scope.post.comments) {
                    $scope.post.comments = [];
                }

                posts.addComment(post._id, {
                    body: $scope.body,
                    author: 'user'
                }).success(function (comment) {
                    $scope.post.comments.push(comment);
                });

                $scope.body = '';
            };
            $scope.incrementUpvotes = function (comment) {
                posts.upvoteComment(post, comment);
            };

            $scope.isLoggedIn = auth.isLoggedIn;
        }]);


app.controller('AuthCtrl',
    ['$scope', '$state', 'auth',
        function ($scope, $state, auth) {
            $scope.user = {
                agreement: false,
                password: ''
            };
            $scope.error = {};
            $scope.passwordRepeat = '';

            $scope.register = function () {

                if (!$scope.user.agreement) {
                    $scope.error.message = 'شما شرایط عضویت را نپذیرفته‌اید.';
                    return;
                }

                if ($scope.user.password !== $scope.passwordRepeat) {
                    $scope.error.message = 'رمز‌ها یکسان نیستند.';
                    return;
                }

                auth.register($scope.user).error(function (error) {
                    $scope.error = error;
                }).then(function () {
                    $state.go('dashboard');
                });
            };

            $scope.logIn = function () {
                auth.login($scope.user).error(function (error) {
                    $scope.error = error;
                }).then(function () {
                    $state.go('dashboard');
                });
            };

        }]);

app.controller('NavCtrl',
    ['$scope', 'auth',
        function ($scope, auth) {
            $scope.isLoggedIn = auth.isLoggedIn;
            $scope.currentUser = auth.currentUser;
            $scope.logOut = auth.logout;
        }]);

app.controller('MainCtrl',
    ['$scope', 'posts', 'auth',
        function ($scope, posts, auth) {
            $scope.test = 'Hello world!';
            $scope.posts = posts.posts;
            $scope.addPost = function () {
                if (!$scope.title || $scope.title === '')
                    return;

                posts.creat({
                    title: $scope.title,
                    link: $scope.link
                });

                $scope.title = '';
                $scope.link = '';
            };
            $scope.incrementUpvotes = function (post) {
                posts.upvote(post);
            };
            $scope.isLoggedIn = auth.isLoggedIn;
        }]);


app.controller('DashboardCtrl',
    ['$scope', 'posts', 'auth',
        function ($scope, posts, auth) {
            $scope.test = 'Hello world!';
            $scope.posts = posts.posts;
            $scope.addPost = function () {
                if (!$scope.title || $scope.title === '')
                    return;

                posts.creat({
                    title: $scope.title,
                    link: $scope.link
                });

                $scope.title = '';
                $scope.link = '';
            };
            $scope.incrementUpvotes = function (post) {
                posts.upvote(post);
            };
            
            $scope.logOut = auth.logout;
        }]);

app.directive('validateEmail', function () {
    var EMAIL_REGEXP = /^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,5})$/;

    return {
        require: 'ngModel',
        restrict: '',
        link: function (scope, elm, attrs, ctrl) {
            // only apply the validator if ngModel is present and Angular has added the email validator
            if (ctrl && ctrl.$validators.email) {

                // this will overwrite the default Angular email validator
                ctrl.$validators.email = function (modelValue) {
                    return ctrl.$isEmpty(modelValue) || EMAIL_REGEXP.test(modelValue);
                };
            }
        }
    };
});
