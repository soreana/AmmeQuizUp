/**
 * Created by AmooQuizGroup
 */

var app = angular.module('dashboardApp', ['ui.router', 'ngMaterial', 'ngMessages', 'material.svgAssetsCache']);

app.factory('categories', ['$http', 'auth', function ($http, auth) {
    var o = {};
    o.categories = [
        {
            title: "numberOne",
            type: "1",
            show: true,
            _id: "januaries",
            comments: [
                {
                    body: '',
                    choices: [
                        {title: '', answer: false},
                        {title: '', answer: false},
                        {title: '', answer: false},
                        {title: '', answer: false}
                    ]
                }
            ]
        }
    ];

    var helper = {};

    function Quiz(questions) {
        this.currentQuestion = 0;
        this.questions = questions;
        this.answers = [];
    }

    Quiz.prototype.start = function () {
        this.currentQuestion = 0;
    };

    o.getQuiz = function (categoryTitle) {
        var array = [];
        // var category = o.getCategoryByTitle(categoryTitle);
        //
        // for(var i=0 ; i<category.comments.length;i++)
        //     category.comments[i].added = false;
        //
        // while(array.length < 7){
        //     for(var i=0 ; i<category.comments.length;i++){
        //         if((Math.floor((Math.random() * 10) + 1))>7 && category.comments[i].added === false){
        //             console.log("hello");
        //             array.push(category.comments[i]);
        //             category.comments[i].added = true;
        //         }
        //     }
        // }
        //
        // for(var i=0 ; i<category.comments.length;i++)
        //     category.comments[i].added = false;
        array = o.categories[0].comments;
        
        return new Quiz(array);
    };

    o.get = function (id, index, next) {
        return $http.get('/posts/' + id).then(function (res) {
            next(res.data, index);
            return res.data;
        });
    };

    o.addComment = function (id, comment) {
        return $http.post('/posts/' + id + '/comments', comment, {
            headers: {Authorization: 'Bearer ' + auth.getToken()}
        });
    };

    o.getAll = function () {
        return $http.get('/posts').success(function (data) {
            angular.copy(data, o.categories);
            for (var i = 0; i < o.categories.length; i++) {
                for (var j = 0; j < o.categories[i].comments.length; j++)
                    // o.categories[i] = o.get( o.categories[i]._id );
                // o.categories[i].comments[j]=o.get( o.categories[i].comments[j]);
                o.get(o.categories[i]._id, i, function (data, index) {
                    angular.copy(data, o.categories[index]);
                });
            }
        });
    };

    o.addCategory = function (category) {
        // todo check category existence
        for (var i = 0; i < o.categories.length; i++)
            if (o.categories[i].title === category.title) {
                console.log('category tekrari');
                window.alert("این بخش قبلا ثبت شده است.");
                var notNewCategory = 1;
            }
        if (!notNewCategory) {
            return $http.post('/posts', category, {
                headers: {Authorization: 'Bearer ' + auth.getToken()}
            }).success(function (data) {
                console.log(data);
                data.show = true;
                o.categories.push(data);
            });
        }
    };

    o.getId = function (categoryName) {
        for (var i = 0; i < o.categories.length; i++)
            if (o.categories[i].title === categoryName)
                return o.categories[i]._id;
    };

    o.getCategoryById = function (id) {
        for (var i = 0; i < o.categories.length; i++)
            if (o.categories[i]._id === id)
                return o.categories[i];
        return null;
    };
    
    o.getCategoryByTitle = function (title) {
        for (var i = 0; i < o.categories.length; i++)
            if (o.categories[i].title === title)
                return o.categories[i];
        return o.categories[0];
    };
        
    o.saveNewQuestion = function (question, next) {
        console.log(question);
        if (question.categoryName === '') {
            next(new Error('دسته بندی نمی تواند خالی باشد.'));
        }
        if (question.body === '')
            next(new Error('متن سوال نمی تواند خالی باشد.'));
        if (question.choices[0].title === '' || question.choices[1].title === ''
            || question.choices[2].title === '' || question.choices[3].title === '')
            next(new Error('جواب ها نمی توانند خالی باشند.'));
        if (!(question.choices[0].answer || question.choices[1].answer
            || question.choices[2].answer || question.choices[3].answer))
            next(new Error('باید یک جواب را انتخاب کنید.'));

        return $http.post('/posts/' + o.getId(question.categoryName) + '/comments', question, {
            headers: {Authorization: 'Bearer ' + auth.getToken()}
        }).success(function () {
            o.getCategoryById(o.getId(question.categoryName)).comments.push(question);
            next();
        });
    };

    o.removeCategory = function (categoryTitle) {
        var id;
        for (var i = 0; i < o.categories.length; i++) {
            if (o.categories[i].title == categoryTitle) {
                id = o.categories[i]._id;
                o.categories.splice(i, 1);
                break;
            }
        }

        if (o.categories.length === 0) {
            o.categories.push({title: "dummy", type: "dummy", show: false, _id: "januaries"});
        }

        return $http.post('/posts/delete/' + id, {
            headers: {Authorization: 'Bearer ' + auth.getToken()}
        }).success(function (data) {
            console.log("category was removed.");
        }).error(function (err) {
            console.log(err);
        });
    };

    return o;
}]);

app.factory('auth', ['$http', '$window', function ($http, $window) {
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

            return payload.exp > Date.now() / 1000;
        } else {
            return false;
        }
    };

    auth.currentUser = function () {
        if (auth.isLoggedIn()) {
            var token = auth.getToken();
            var payload = JSON.parse($window.atob(token.split('.')[1]));

            console.log(payload);

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
        $window.localStorage.removeItem('flapper-news-token');
        $window.location.href = '/';
    };

    return auth;
}]);
app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {

        //$stateProvider
        //    .state('quizHome', {
        //        url: '/quizHome',
        //        templateUrl: '/quizHome.html',
        //        controller: 'QuizHomeCtrl'
        //    });

        $stateProvider
            .state('profile', {
                url: '/profile',
                templateUrl: '/profile.html',
                controller: 'ProfileCtrl'
            });

        $stateProvider
            .state('question', {
                url: '/question',
                templateUrl: '/question.html',
                controller: 'QuestionCtrl',
                resolve: {
                    postPromise: ['categories', function (categories) {
                        return categories.getAll();
                    }]
                }
            });

        $stateProvider
            .state('category', {
                url: '/category',
                templateUrl: '/category.html',
                controller: 'CategoryCtrl',
                resolve: {
                    postPromise: ['categories', function (categories) {
                        return categories.getAll();
                    }]
                }
            });

        $stateProvider
            .state('quiz', {
                url: '/quiz',
                templateUrl: '/quiz.html',
                controller: 'QuizCtrl'
            });

        $stateProvider
            .state('contact', {
                url: '/contact',
                templateUrl: '/contact.html',
                controller: 'ContactCtrl'
            });

    }

]);

app.controller('QuizHomeCtrl',
    ['$scope', 'auth',
        function ($scope, auth) {

        }]);

app.controller('ProfileCtrl',
    ['$scope', 'auth',
        function ($scope, auth) {
            $scope.user = auth.currentUser();
            $scope.getRandomNumber = function () {
                Math.floor((Math.random() * 20) + 1);
            };

        }]);

function DialogController($scope, $mdDialog, categories) {

    $scope.categories = categories.categories;

    $scope.newQuestion = {
        categoryName: '',
        body: '',
        choices: [
            {title: '', answer: false},
            {title: '', answer: false},
            {title: '', answer: false},
            {title: '', answer: false}
        ]
    };

    $scope.setAnswer = function (choiceNumber) {
        for (var i = 0; i < 4; i++) {
            if (i === choiceNumber)
                continue;
            $scope.newQuestion.choices[i].answer = false;
            console.log(choiceNumber);
        }
        console.log($scope.newQuestion.choices);
    };

    $scope.hide = function () {
        $mdDialog.hide();
    };

    $scope.cancel = function () {
        $mdDialog.cancel();
    };

    $scope.answer = function (answer) {
        categories.saveNewQuestion($scope.newQuestion, function (err) {
            if (err) {
                $scope.errMessage = err.message;
                return;
            }
            $mdDialog.hide(answer);
        });
    };
}

app.controller('QuestionCtrl',
    ['$scope', 'auth', '$mdDialog', '$mdMedia', 'categories',
        function ($scope, auth, $mdDialog, $mdMedia, categories) {
            $scope.categories = categories.categories;
            $scope.showAdvanced = function (ev) {
                var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;

                $mdDialog.show({
                    controller: DialogController,
                    templateUrl: 'dialog1.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    fullscreen: useFullScreen
                })
                    .then(function (answer) {
                        $scope.status = 'You said the information was "' + answer + '".';
                    }, function () {
                        $scope.status = 'You cancelled the dialog.';
                    });
            }

        }]);

app.controller('CategoryCtrl',
    ['$scope', 'auth', 'categories',
        function ($scope, auth, categories) {
            $scope.categories = categories.categories;

            $scope.currentType = "";

            $scope.disableFilters = function () {
                for (var i = 0; i < $scope.categories.length; i++) {
                    $scope.categories[i].show = true;
                }
            };

            $scope.getAllTypes = function () {
                var types = [];

            };

            $scope.filterByType = function (typeName) {
                $scope.currentType = typeName;
                for (var i = 0; i < $scope.categories.length; i++) {
                    $scope.categories[i].show = $scope.categories[i].type === typeName;
                }
            };

            $scope.sampleCategory = {
                title: "نام بخش جدید",
                type: "4",
                show: true
            };

            $scope.addCategory = categories.addCategory;

            $scope.removeCategory = categories.removeCategory;
        }]);

app.controller('QuizCtrl',
    ['$scope', 'auth', 'categories',
        function ($scope, auth , categories) {
            $scope.quiz = categories.getQuiz(categories.categories[0]);

        }]);

app.controller('ContactCtrl',
    ['$scope', 'auth',
        function ($scope, auth) {

        }]);

app.controller('NavCtrl',
    ['$scope', '$state', 'auth', function ($scope, $state, auth) {
        $scope.gotoState = function (state) {
            console.log(state);
            $state.go(state);
        };

        $scope.logout = auth.logout;
    }]);

