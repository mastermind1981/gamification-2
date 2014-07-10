gamififcationApp.controller('CheckinsCtrl', function($scope, $ionicModal, $ionicPopup, $http, $q, gamificationFactory, gamificationUtilities) {

    if ($scope.userId == null) {
        $scope.initIndexView();
    }
});

gamififcationApp.controller('Checkins1Ctrl', function($scope, $ionicModal, $ionicPopup, $http, $q, gamificationFactory, gamificationUtilities) {

    $scope.hardcodedCheckinBadges = ['53be5c1d9c9505cedd00000a', '53be5c6c9c9505975100000b' ]
    $scope.retrievedBadges = [];

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

                    switch(response[0].checklistcount) {
                        case 5:
                            console.log("--> 5 completed checkins");
                            $scope.deliverCheckinBadges(response[0]._id, $scope.hardcodedCheckinBadges[0]);
                            break;
                        case 10:
                            console.log("--> 10 completed checkins");
                            $scope.deliverCheckinBadges(response[0]._id, $scope.hardcodedCheckinBadges[1]);
                            break;
                        case 15:

                            break;
                        case 20:

                            break;
                    };

                    $scope.retrieveCheckins();
                    $scope.changeMainTab(2);
                });
            }
        }
    };

    /*
     Function to deliver badges based on an array of ids
     */
    $scope.deliverCheckinBadges = function(uid, bid) {

        gamificationFactory.doPutURL('/student/'+uid+'/addbadge/'+bid+'?nocache='+gamificationUtilities.getRandomUUID(), null).then(function (response) {

            var data = {};
            data.studentId = response[0].facebookId;

            for(var i=0; i<$scope.retrievedBadges.length; i++) {
                if($scope.retrievedBadges[i]._id == bid) {
                    data.label = "Badge: "+$scope.retrievedBadges[i].label;
                    break;
                }
            }

            data.type = "STUDENT";
            data.groupId = response[0].group_id;
            data.classroomId = response[0].classroom_id;

            gamificationFactory.doPostURL('/activity?nocache='+gamificationUtilities.getRandomUUID()).then(function(postactresponse) {

                gamificationFactory.doPutURL('/activity/'+postactresponse[0]._id+'?nocache='+gamificationUtilities.getRandomUUID(), data).then(function (response) {
                    $scope.notif();
                    $scope.notifyBadges();
                });
            });
        });
    };

    function initCheckinsView() {
        gamificationFactory.doGetURL('/checkinbadge').then(function (response) {
            $scope.retrievedBadges = response[0];
        });
    };

    if ($scope.userId == null) {
        $scope.initIndexView();
    }
    else {
        initCheckinsView();
    }

});