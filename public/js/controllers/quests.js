gamififcationApp.controller('QuestsCtrl', function($scope, $ionicModal, $ionicPopup, $http, $q, gamificationFactory, gamificationUtilities) {

    if ($scope.userId == null) {
        $scope.initIndexView();
    }

    function initQuestView() {
        if ($scope.groupId != null) {
            gamificationFactory.doGetURL('/quest/bygroupid/'+$scope.groupId+'?nocache='+gamificationUtilities.getRandomUUID()).then(function (response) {
                $scope.quests = response[0];
            });
        }

    };

    initQuestView();
});


gamififcationApp.controller('Quests1Ctrl', function($scope, $location, $ionicModal, $ionicPopup, $http, $q, gamificationFactory, gamificationUtilities) {
    $scope.activeLevelIndex = 0;
    $scope.activeLevelId = null;
    $scope.levels = [];
    $scope.tasks = [];
    $scope.editing = false;
    $scope.urltext = "";

    if ($scope.userId == null) {
        $scope.initIndexView();
    }

    $scope.blogLevelsDynamicClass = function(lvl, ind) {
        if(lvl.locked == false) {
            if((ind+1) == $scope.activeLevelIndex) {
                return "button active";
            }
            else {
                return "button";
            }
        }
        else {
            if((ind+1) == $scope.activeLevelIndex) {
                return "button active icon-right ion-ios7-locked";
            }
            else {
                return "button icon-right ion-ios7-locked";
            }
        }
    };

    $scope.getTaskVisibility = function(tsk) {
        if(tsk.completedobjects.indexOf($scope.groupId) > -1) {
            return false;
        }
        else {
            return true;
        }

    };

    $scope.backToQuest = function() {
        window.location.href = '#/tab/quests';
    };

    $scope.unveilLevel = function(lvl) {
        var ele = $('#levelsNavigationBar').children();
        console.log('yo');
    };

    function initQuestView() {
        var reversedLevelsArray = $scope.sortedlevels.slice(0);
        reversedLevelsArray.reverse();

        for(var i=0; i<reversedLevelsArray.length; i++) {
            if(reversedLevelsArray[i].locked == false) {
                $scope.activeLevelIndex = reversedLevelsArray[i].order;
                $scope.activeLevelId = reversedLevelsArray[i]._id;
                break;
            }
        }

        gamificationFactory.doGetURL('/level/'+$scope.activeLevelId+'?nocache='+gamificationUtilities.getRandomUUID()).then(function (response) {
            $scope.tasks = gamificationUtilities.sortArrayByKey(response[0].tasks, 'order');
        });

        $scope.levels = $scope.sortedlevels.slice(0);
    };

    initQuestView();
});


gamififcationApp.controller('Quests2Ctrl', function($scope, gamificationFactory, gamificationUtilities) {
    $scope.taskCompleted = null;
    $scope.currentCompletedObjectId = null;
    $scope.hasBeenSubmitted = false;
    $scope.editing = false;

    if ($scope.userId == null) {
        $scope.initIndexView();
    }

    $scope.backToLevel = function() {
        window.location.href = '#/tab/quests1';
    };

    $scope.submitTaskIfComplete = function() {
        var el = $('#taskCompletedInput')[0];

        if(el.checked == false) {
            el.checked = true;
            $scope.validateTask();
        }
    };

    $scope.showUpdateButton = function() {
        if($scope.hasBeenSubmitted) {
            $scope.editing = true;
        }
    };

    $scope.updateCurrentTask = function() {
        var el = $('#urlTextInput')[0];


        if(el.value != "" && $scope.currentCompletedObjectId != null) {
            var data = {};
            data.text = el.value;

            gamificationFactory.doPutURL('/completedobject/'+$scope.currentCompletedObjectId+'?nocache='+gamificationUtilities.getRandomUUID(), data).then(function (response) {
                window.location.href = '#/tab/quests1';
            });
        }

    };

    function initQuestView() {

        for(var i=0; i < $scope.activeTask.completedobjects.length; i++) {
            if($scope.activeTask.completedobjects[i].groupId == $scope.groupId) {
                $scope.currentCompletedObjectId = $scope.activeTask.completedobjects[i]._id;
                $('#taskCompletedInput')[0].checked = true;
                $scope.hasBeenSubmitted = true;

                if($scope.activeTask.completedobjects[i].text != null) {
                    $scope.urltext = $scope.activeTask.completedobjects[i].text;
                }

                break;
            }
        }

    };

    initQuestView();
});
