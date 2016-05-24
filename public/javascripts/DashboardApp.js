/**
 * Created by AmooQuizGroup
 */

var app = angular.module('dashboardApp', ['ui.router']);

app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state ('quizHome',{
                url: '/quizHome',
                templateUrl: '/quizHome.html',
                controller: 'QuizHomeCtrl'
            });
        
        $stateProvider
            .state('profile',{
                url: '/profile',
                templateUrl: '/profile.html',
                controller: 'ProfileCtrl'
            });

        $stateProvider
            .state('question',{
                url: '/question',
                templateUrl: '/question.html',
                controller: 'QuestionCtrl'
            });

        $stateProvider
            .state ('category',{
            url: '/category',
            templateUrl: '/category.html',
            controller: 'CategoryCtrl'
        });

        $stateProvider
            .state('quiz',{
                url: '/quiz',
                templateUrl: '/quiz.html',
                controller: 'QuizCtrl'
            });
        
        $stateProvider
            .state('contact',{
                url: '/contact',
                templateUrl: '/contact.html',
                controller: 'ContactCtrl'
            });

    }

]);

app.controller('QuizHomeCtrl',
    ['$scope','auth',
        function ($scope,auth) {
            
        }]);

app.controller('ProfileCtrl',
    ['$scope','auth',
        function ($scope,auth) {

        }]);

app.controller('QuestionCtrl',
    ['$scope','auth',
        function ($scope,auth) {

        }]);

app.controller('CategoryCtrl',
    ['$scope','auth',
        function ($scope,auth) {

        }]);

app.controller('QuizCtrl',
    ['$scope','auth',
        function ($scope,auth) {

        }]);

app.controller('ContactCtrl',
    ['$scope','auth',
        function ($scope,auth) {

        }]);

app.controller('NavCtrl',
    ['$scope','$state',function($scope,$state){
        $scope.gotoState = function( state ){
            console.log(state);
            $state.go(state);
        }
    }]);

