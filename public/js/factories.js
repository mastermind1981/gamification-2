gamififcationApp.factory('gamificationFactory', function ($http, $q) {

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
        var config = { method: "GET", url : url, data : {} };
        return requestHttpData(config);
    }

    function postData(url, data) {
        var config = { method: "POST", url : url, data : data };
        return requestHttpData(config);
    }

    function deleteData(url, data) {
        var config = { method: "DELETE", url : url, data : data };
        return requestHttpData(config);
    }

    function putData(url, data) {
        var config = { method: "PUT", url : url, data : data };
        return requestHttpData(config);
    }

    var getURLObject = function(url) {
        return getData(url);
    };

    var logout = function() {
        return window.location.href = '/logout';
    };

    return {
        doLogOut: logout,
        doGetURL: getURLObject
    }
});