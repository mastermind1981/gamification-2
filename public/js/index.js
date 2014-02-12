gamififcationApp.controller('navigationCtrl', function($scope, $http, $q) {


    function requestHttpData(config) {
        var deferred = $q.defer();
        $http(config).success(function(data, status, textStatus, jqXHR) {
            deferred.resolve([data, status, textStatus, jqXHR]);
        }).error(function(data){
            alert( "Request failed: " + data.message  );
            deferred.reject();
        });
        return deferred.promise;
    }

    function getData(url) {
        var config = { method: "GET", url : url };
        return requestHttpData(config);
    }

    $scope.testVar = getData("/testobj");

});