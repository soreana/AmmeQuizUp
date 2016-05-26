/**
 * Created by AmooQuizGroup
 */

var app = angular.module('dashboardApp', ['ui.router', 'ngMaterial', 'ngMessages', 'material.svgAssetsCache']);

app.factory('categories', [function () {
    var o = {};
    o.categories = [
        {name: "numberOne", type: "1", show: true},
        {name: "numberTwo", type: "2", show: true},
        {name: "numberThree", type: "3", show: true}
    ];

    o.addCategory = function(category){
        // todo check category existence
        o.categories.push(category);
    };

    o.removeCategory = function(categoryName){
        for(var i=0;i< o.categories.length;i++){
            if(o.categories[i].name == categoryName)
                o.categories.splice(i,1);
        }
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
        $window.localStorage.removeItem('flapper-news-token');
    };

    return auth;
}]);
app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('quizHome', {
                url: '/quizHome',
                templateUrl: '/quizHome.html',
                controller: 'QuizHomeCtrl'
            });

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
                controller: 'QuestionCtrl'
            });

        $stateProvider
            .state('category', {
                url: '/category',
                templateUrl: '/category.html',
                controller: 'CategoryCtrl'
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

        }]);

function DialogController($scope, $mdDialog) {
    $scope.hide = function () {
        $mdDialog.hide();
    };

    $scope.cancel = function () {
        $mdDialog.cancel();
    };

    $scope.answer = function (answer) {
        $mdDialog.hide(answer);
    };
}

app.controller('QuestionCtrl',
    ['$scope', 'auth', '$mdDialog', '$mdMedia',
        function ($scope, auth, $mdDialog, $mdMedia) {
            $scope.showAdvanced = function (ev) {
                console.log('sinai is here.');
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
    ['$scope', 'auth','categories',
        function ($scope, auth,categories) {
            $scope.categories = categories.categories;

            $scope.currentType = "";

            $scope.filterByType = function (typeName) {
                $scope.currentType = typeName;
                for (var i = 0; i < $scope.categories.length; i++) {
                    $scope.categories[i].show = $scope.categories[i].type === typeName;
                }
            };

            $scope.sampleCategory = {
                name:"sampleCategory",
                type:"4",
                show:true
            };

            $scope.addCategory = categories.addCategory;

            $scope.removeCategory = categories.removeCategory;
        }]);

app.controller('QuizCtrl',
    ['$scope', 'auth',
        function ($scope, auth) {

        }]);

app.controller('ContactCtrl',
    ['$scope', 'auth',
        function ($scope, auth) {

        }]);

app.controller('NavCtrl',
    ['$scope', '$state', function ($scope, $state) {
        $scope.gotoState = function (state) {
            console.log(state);
            $state.go(state);
        }
    }]);

