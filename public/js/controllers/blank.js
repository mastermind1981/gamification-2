gamififcationApp.controller('BlankCtrl', function($scope, $ionicModal, $ionicPopup, $http, $q, gamificationFactory, gamificationUtilities) {
    if ($scope.userId == null) {
        $scope.initIndexView();
    }
});

