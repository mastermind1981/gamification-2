gamififcationApp.controller('ActivitiesCtrl', function($scope, $ionicModal, $ionicPopup, $http, $q, gamificationFactory, gamificationUtilities) {
    $scope.activityMenuModel = 0;
    $scope.activityBadgeValue = 0;
    $scope.groupStats = [];

    $scope.postMessage = function() {
        var formValid = true;
        var messageObject = {};

        if($('#commActivitiesFeedTextarea').val() != "") {
            messageObject.label = $('#commActivitiesFeedTextarea').val();
        }
        else {
            formValid = false;
            $ionicPopup.alert({
                title: 'No text provided',
                content: 'Please provide a valid text for your message'
            });
        }

        if($('#commActivitiesFeedTextinput').val() != "") {

            if(isValidURL($('#commActivitiesFeedTextinput').val())) {
                messageObject.url = $('#commActivitiesFeedTextinput').val();
            }
            else {
                formValid = false;
                $ionicPopup.alert({
                    title: 'URL Format Error',
                    content: 'Please check the format of your URL before submitting'
                });
            }

        }

        if(formValid) {
            gamificationFactory.doPostURL('/activity?nocache='+gamificationUtilities.getRandomUUID()).then(function(response) {
                var data = {};
                data.studentId = $scope.facebookId;
                data.label = messageObject.label;
                data.type = "STUDENT";
                data.url = messageObject.url;
                data.groupId = $scope.groupId;

                gamificationFactory.doPutURL('/activity/'+response[0]._id+'?nocache='+gamificationUtilities.getRandomUUID(), data).then(function (response) {
                    $scope.notif();
                    $scope.showMessageOKAlert();

                });
            });
        }

    };

    function isValidURL(url) {
        var myRegExp =/^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i;

        console.log('test: '+url);
        if (!myRegExp.test(url)){
            return false;
        }else{
            return true;
        }
    };

    // An alert dialog
    $scope.showMessageOKAlert = function() {
        $ionicPopup.alert({
            title: 'Message OK',
            content: 'Your message has been delivered to your class.'
        }).then(function(res) {
            $('#commActivitiesFeedTextarea').val('');
            $('#commActivitiesFeedTextinput').val('');
        });
    };

    $ionicModal.fromTemplateUrl('modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });
    $scope.openModal = function() {
        $scope.modal.show();
    };
    $scope.closeModal = function() {
        $scope.modal.hide();
    };

    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });

    $scope.generateStats = function() {
        gamificationFactory.doGetURL('/queststats/'+$scope.classroomId+'?nocache='+gamificationUtilities.getRandomUUID()).then(function (response) {
            $scope.groupStats = response[0];
        });
    };

    $scope.getQuestProgress = function(quest) {
        total = 0;
        for(var i=0; i<quest.levels.length; i++) {
            if(quest.levels[i].completed == 1) {
                total = total + (100/quest.levels.length);
            }
            else {
                for(var j=0; j<quest.levels[i].tasks.length; j++) {
                    if(quest.levels[i].tasks[j].completed == 1) {
                        total = total + (100/(quest.levels[i].tasks.length*quest.levels.length));
                    }
                }
            }
        }
        return total.toFixed(2);
    };

    $scope.navigateToActivity = function(message) {
        if(message.label != 'JOINED GAMIFICATION'  && message.url != null) {
            window.open(message.url,'_blank');
        }
    };

    if ($scope.userId == null) {
        $scope.initIndexView();
    }
});

