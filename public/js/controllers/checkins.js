gamififcationApp.controller('CheckinsCtrl', function($scope, $ionicModal, $ionicPopup, $http, $q, gamificationFactory, gamificationUtilities) {

    if ($scope.userId == null) {
        $scope.initIndexView();
    }
});

gamififcationApp.controller('Checkins1Ctrl', function($scope, $ionicModal, $ionicPopup, $http, $q, gamificationFactory, gamificationUtilities) {

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
                            $scope.deliverCheckinBadges(response[0]._id, "53fc27c9ea9dd81153000001");
                            break;
                        case 10:
                            console.log("--> 10 completed checkins");
                            $scope.deliverCheckinBadges(response[0]._id, "53fc2884ea9dd86bfd000002");
                            break;
                        case 20:
                            console.log("--> 20 completed checkins");
                            $scope.deliverCheckinBadges(response[0]._id, "53fc28b0ea9dd854d7000003");
                            break;
                        case 40:
                            console.log("--> 40 completed checkins");
                            $scope.deliverCheckinBadges(response[0]._id, "53fc28d2ea9dd850f8000004");
                            break;
                        case 70:
                            console.log("--> 70 completed checkins");
                            $scope.deliverCheckinBadges(response[0]._id, "53fc28f9ea9dd87a31000005");
                            break;
                        case 100:
                            console.log("--> 100 completed checkins");
                            $scope.deliverCheckinBadges(response[0]._id, "53fc2979ea9dd85f26000006");
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

            $scope.showRecentBadge(bid);

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