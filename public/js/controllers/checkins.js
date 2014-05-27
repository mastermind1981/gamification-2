gamififcationApp.controller('CheckinsCtrl', function($scope, $ionicModal, $ionicPopup, $http, $q, gamificationFactory, gamificationUtilities) {

    if ($scope.userId == null) {
        $scope.initIndexView();
    }
});

gamififcationApp.controller('Checkins1Ctrl', function($scope, $ionicModal, $ionicPopup, $http, $q, gamificationFactory, gamificationUtilities) {

    $scope.backToCheckins = function() {
        $scope.changeMainTab(2);
    };

    $scope.validateCheckin = function() {

        if(!$scope.activeCheckin.completed) {

            var formValid = true;

            if($scope.activeCheckin.isnotificationitem) {

                $scope.textToSend = $('#checkinTextarea').val();

                if($scope.textToSend != "") {

                    gamificationFactory.doPostURL('/activity?nocache='+gamificationUtilities.getRandomUUID()).then(function(response) {
                        var data = {};
                        data.studentId = $scope.facebookId;
                        data.label = $scope.textToSend;
                        data.type = "STUDENT";
                        data.groupId = $scope.groupId;
                        data.classroomId = $scope.classroomId;

                        gamificationFactory.doPutURL('/activity/'+response[0]._id+'?nocache='+gamificationUtilities.getRandomUUID(), data).then(function (response) {
                            $scope.notif();

                        });
                    });

                }
                else {
                    formValid = false;
                    $ionicPopup.alert({
                        title: 'No text provided',
                        content: 'Please provide a valid text for your message'
                    });
                }
            }

            var data = {};
            data.userId = $scope.userId;
            data.text = "";

            if(formValid) {
                gamificationFactory.doPutURL('/checklistitem/'+$scope.activeCheckin._id+'/addcompletedstudent?nocache='+gamificationUtilities.getRandomUUID(), data).then(function (response) {
                    $scope.retrieveCheckins();
                    $scope.changeMainTab(2);
                });
            }
        }
    };

    if ($scope.userId == null) {
        $scope.initIndexView();
    }
});