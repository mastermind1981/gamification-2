gamififcationApp.controller('CheckinsCtrl', function($scope, $ionicModal, $ionicPopup, $http, $q, gamificationFactory, gamificationUtilities) {

    if ($scope.userId == null) {
        $scope.initIndexView();
    }
});

gamififcationApp.controller('Checkins1Ctrl', function($scope, $ionicModal, $ionicPopup, $http, $q, gamificationFactory, gamificationUtilities) {

    $scope.backToCheckins = function() {
        $scope.changeMainTab(2);
    };

    $scope.validateCheckin = function() {

        if(!$scope.activeCheckin.completed) {
            var data = {};
            data.userId = $scope.userId;
            data.text = "";

            gamificationFactory.doPutURL('/checklistitem/'+$scope.activeCheckin._id+'/addcompletedstudent?nocache='+gamificationUtilities.getRandomUUID(), data).then(function (response) {
                $scope.retrieveCheckins();
                $scope.changeMainTab(2);
            });
        }
    };

    if ($scope.userId == null) {
        $scope.initIndexView();
    }
});