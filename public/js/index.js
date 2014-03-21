gamififcationApp.controller('navigationCtrl', function($scope, $http, $q, gamificationFactory, $location) {

    $scope.username = "";
    $scope.facebookId = "";
    $scope.avatarUrl = "";

    initView();

    function initView() {
        gamificationFactory.doGetURL('/facebookUser').then(function (response) {
            $scope.username = response[0].userName;
            $scope.avatarUrl = response[0].avatar;
            $scope.facebookId = response[0].userId;
        });
    };

    $scope.logout = function() {
        gamificationFactory.doLogOut();
    };

    $scope.gotoAbout = function() {
        window.location.href = '/about.html';
    };
});