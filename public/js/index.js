gamififcationApp.controller('navigationCtrl', function($scope, $http, $q) {

    $scope.testVar = "hello";

        function requestHttpData(config) {
        var deferred = $q.defer();
        $http(config).success(function(data, status, textStatus, jqXHR) {
            deferred.resolve([data, status, textStatus, jqXHR]);
            $scope.testVar = data;
        }).error(function(data){
            alert( "Request failed: " + data.message  );
            deferred.reject();
        });
        return deferred.promise;
    }

    $scope.getData = function(url) {
        var config = { method: "GET", url : url };
        return requestHttpData(config);
    }
});