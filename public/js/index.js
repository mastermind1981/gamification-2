gamififcationApp.controller('navigationCtrl', function($scope, $http, $q, gamificationFactory, $location) {

    $scope.first_name = "";
    $scope.last_name = "";
    $scope.facebookId = "";

    initView();

    function initView() {
        $scope.at = $location.search()['at'];

        if($scope.at != undefined) {
            console.log("initialising index ....");

            var url = 'https://graph.facebook.com/me?access_token='+$scope.at;
            gamificationFactory.doGetURL(url).then(function (response) {
                $scope.first_name = response[0].first_name;
                $scope.last_name = response[0].last_name;
                $scope.facebookId = response[0].id;

                getGraphics();
            });
        }
        else {
            gamificationFactory.doLogOut();
        }
    };

    function getGraphics() {
        var url = 'https://graph.facebook.com/'+$scope.facebookId+'?fields=cover,picture&access_token='+$scope.at;

        gamificationFactory.doGetURL(url).then(function (response) {
            console.log("graphics received ....");
            $scope.cover = response[0].cover.source;
            $scope.avatar = response[0].picture.data.url;
        });
    };

    $scope.logout = function() {
        gamificationFactory.doLogOut();
    };
});