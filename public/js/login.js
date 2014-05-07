var gamififcationAppLogin = angular.module('gamififcationAppLogin', ['ionic']);

gamififcationAppLogin.controller('loginCtrl', function($scope, $window) {

    $scope.checkIfMobile = function() {
        if ($window.document.activeElement.clientWidth < 700) {
            return true;
        }
        else {
            return false;
        }
    }
});