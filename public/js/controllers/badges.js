gamififcationApp.controller('BadgesCtrl', function($scope) {

    if ($scope.userId == null) {
        $scope.initIndexView();
    }
    else {
        $scope.reinitBadgeReadCounter();
    }
});

