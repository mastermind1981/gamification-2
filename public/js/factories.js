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

    var putURLObject = function(url, data) {
        return putData(url, data);
    };

    var postURLObject = function(url, data) {
        return postData(url, data);
    };

    var logout = function() {
        return window.location.href = '/logout';
    };

    return {
        doLogOut: logout,
        doGetURL: getURLObject,
        doPutURL: putURLObject,
        doPostURL: postURLObject
    }
});

gamififcationApp.factory('gamificationUtilities', function ($http) {

    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    };

    var getRandomUUID = function() {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    };

    var sortByKey = function(array, key) {
        return array.sort(function(a, b) {
            var x = a[key]; var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    };

    return {
        getRandomUUID: getRandomUUID,
        sortArrayByKey: sortByKey
    }
});