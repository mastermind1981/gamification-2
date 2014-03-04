gamififcationApp.controller('fCtrl', function($scope, $http, $q, gamificationFactory, $location) {

    initView();

    function initView() {
        $scope.at = $location.search()['at'];
        if($scope.at != undefined) {
            console.log("initialising f ....");
        }
        else {
            console.log("no access token ....");
            gamificationFactory.doLogOut();
        }
    };
});