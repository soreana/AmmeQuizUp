/**
 * Created by sinaikashipazha on 5/10/16.
 */

var app = angular.module('dashboardApp', ['ui.router']);

app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state ('category',{
                url: '/category',
                templateUrl: '/category.html',
                controller: 'CategoryCtrl'
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

app.controller('',
    ['$scope','auth',
        function ($scope,auth) {
            
        }]);

app.controller('',
    ['$scope','auth',
        function ($scope,auth) {

        }]);

app.controller('',
    ['$scope','auth',
        function ($scope,auth) {

        }]);

app.controller('',
    ['$scope','auth',
        function ($scope,auth) {

        }]);

app.controller('',
    ['$scope','auth',
        function ($scope,auth) {

        }]);

app.controller('',
    ['$scope','auth',
        function ($scope,auth) {

        }]);
