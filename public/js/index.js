gamififcationApp.controller('navigationCtrl', function($scope, $http, $q, gamificationData, $location) {

    $scope.first_name = "";
    $scope.last_name = "";
    $scope.facebookId = "";

    initIndexView();

    function initIndexView() {
        console.log("initialising index ....");
        var url = 'https://graph.facebook.com/me?access_token='+$location.search()['at'];
        gamificationData.doGetURL(url).then(function (response) {
            $scope.first_name = response[0].first_name;
            $scope.last_name = response[0].last_name;
            $scope.facebookId = response[0].id;
        });
    };

    $scope.logout = function() {
        console.log("login out ....");
        window.location.href = '/logout';
    };
});