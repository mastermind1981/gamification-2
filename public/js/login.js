angular.module('gamififcationAppLogin', ['ionic'])

    .run(function($ionicPlatform) {
        $ionicPlatform.ready(function() {
            if(window.StatusBar) {
                StatusBar.styleDefault();
            }
        });
    })