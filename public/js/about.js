gamififcationApp.controller('aboutCtrl', function($scope, $http, $q, gamificationFactory, $location) {

    initView();

    function initView() {
        $scope.par = $location.search()['par'];

    };
});