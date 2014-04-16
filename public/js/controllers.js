angular.module('gamififcationApp.controllers', [])

    .controller('QuestsCtrl', function ($scope) {


    })

    .controller('CheckinsCtrl', function ($scope) {


    })

    .controller('BadgesCtrl', function ($scope) {


    })

    .controller('BlogsCtrl', function ($scope) {

    })

    .controller('BlankCtrl', function ($scope) {
        if ($scope.userId == null) {
            $scope.initIndexView();
        }

    })
