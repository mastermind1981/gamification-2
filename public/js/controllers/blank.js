gamififcationApp.controller('BlankCtrl', function($scope) {
    /*
        First tab loaded, if ther's no userid present, call $scope.initIndexView() in "index.js"
     */

    if ($scope.userId == null) {
        $scope.initIndexView();
    }
});

