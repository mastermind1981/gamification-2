angular.module('gamififcationApp.controllers', [])

    .controller('QuestsCtrl', function ($scope) {
        if ($scope.userId == null) {
            $scope.initIndexView();
        }

    })

    .controller('CheckinsCtrl', function ($scope) {
        if ($scope.userId == null) {
            $scope.initIndexView();
        }

    })

    .controller('BadgesCtrl', function ($scope) {
        if ($scope.userId == null) {
            $scope.initIndexView();
        }

    })

    .controller('BlogsCtrl', function ($scope) {
        if ($scope.userId == null) {
            $scope.initIndexView();
        }

    })
