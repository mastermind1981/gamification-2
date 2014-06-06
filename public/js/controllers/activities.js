gamififcationApp.controller('ActivitiesCtrl', function($scope, $ionicModal, $ionicPopup, $http, $q, gamificationFactory, gamificationUtilities) {
    $scope.activityMenuModel = 0;
    $scope.activityBadgeValue = 0;
    $scope.groupStats = [];

    $scope.getMessageAvatar = function(mess) {
        if(mess.ownerAvatar != null) {
         return mess.ownerAvatar
        }
        else {
            return "img/group.png";
        }
    }

    $scope.getFormattedLabel = function(lab) {
        switch(lab) {
            case 'JOINED_GAMIFICATION':
                return 'Joined gamification';
                break;
            case 'NEW_BADGE':
                return 'New badge';
                break;
            default:
                return lab;
        }
    }

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

            if(gamificationUtilities.checkValidURL($('#commActivitiesFeedTextinput').val())) {
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
                data.classroomId = $scope.classroomId;

                gamificationFactory.doPutURL('/activity/'+response[0]._id+'?nocache='+gamificationUtilities.getRandomUUID(), data).then(function (response) {
                    $scope.notif();
                    $scope.showMessageOKAlert();

                });
            });
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
            $scope.activityMenuModel = 0;
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
        var total = 0;
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

        console.log('--> total: '+total);
        return total.toFixed(2);
    };

    $scope.navigateToActivity = function(message) {
        if(message.label != 'JOINED_GAMIFICATION'  && message.url != null) {
            window.open(message.url,'_blank');
        }
    };

    if ($scope.userId == null) {
        $scope.initIndexView();
    }
});


gamififcationApp.directive('myQueststat', function() {
    return {
        restrict: 'AEC',
        transclude: false,
        scope: {
            currentQuest: '=item'
        },
        link: function(scope) {
            scope.pourcent = 0;
            scope.levelmax = "";

            if(scope.currentQuest.completed == 1) {
                scope.pourcent = 100;
                scope.levelmax = "       ";
            }
            else {
                for(var i=0; i<scope.currentQuest.levels.length; i++) {
                    if(scope.currentQuest.levels[i].completed != 1) {
                        scope.levelmax = 'Level '+(parseInt(scope.currentQuest.levels[i].order)-1);

                        for(var j=0; j<scope.currentQuest.levels[i].tasks.length; j++) {
                            if(scope.currentQuest.levels[i].tasks[j].completed == 1) {
                                scope.pourcent = scope.pourcent + (100/(scope.currentQuest.levels[i].tasks.length));
                            }
                        }
                        break;
                    }
                }
            }

        },
        templateUrl: 'templates/directive-queststat.html'
    };
});