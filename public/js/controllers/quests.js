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
    $scope.levels = [];
    $scope.tasks = [];
    $scope.editing = false;
    $scope.urltext = "";
    $scope.levelmin = 0;
    $scope.pourcent = 0;
    $scope.levelmax = 0;

    $scope.backToQuest = function() {
        window.location.href = '#/tab/quests';
    };

    $scope.unveilLevel = function(lvl) {
        if(lvl.hasaccess) {
            $scope.activeLevelIndex = lvl.order;
            $scope.setActiveLevelId(lvl._id);

            loadCurrentLevel();
        }


    };

    $scope.isTaskComplete = function(arr) {

        for(var i=0; i<arr.length; i++) {
            if(arr[i].groupId == $scope.groupId) {
                return true;
                break;
            }
        }

        return false;
    };

    function initQuestView() {
        var reversedLevelsArray = $scope.sortedlevels.slice(0);
        reversedLevelsArray.reverse();

        for(var i=0; i<reversedLevelsArray.length; i++) {
            if(reversedLevelsArray[i].hasaccess) {
                $scope.activeLevelIndex = reversedLevelsArray[i].order;

                if(i < 1) {
                    $scope.setActiveLevelId(reversedLevelsArray[i]._id, true);
                }
                else {
                    $scope.setActiveLevelId(reversedLevelsArray[i]._id, false);
                }

                break;
            }
        }

        $scope.levels = $scope.sortedlevels.slice(0);

        loadCurrentLevel();

    };

    function loadCurrentLevel() {
        gamificationFactory.doGetURL('/level/'+$scope.activeLevelId+'?nocache='+gamificationUtilities.getRandomUUID()).then(function (response) {

            if(response[0].tasks != null) {
                $scope.tasks = gamificationUtilities.sortArrayByKey(response[0].tasks, 'order');
                $scope.setObjectsToUnlock(response[0].idstounlock);

                var numberOfCompletedTasks = 0;
                $scope.levelmax = $scope.tasks.length;
                $scope.levelmin = 0;
                //find out which are completed by current group
                for(var i=0; i < $scope.tasks.length; i++) {
                    if($scope.isTaskComplete($scope.tasks[i].completedobjects)) {
                        $scope.tasks[i].complete = true;
                        $scope.levelmin++;
                        numberOfCompletedTasks++;
                    }
                    else {
                        $scope.tasks[i].complete = false;
                    }
                }

                $scope.pourcent = (($scope.levelmin*100)/$scope.levelmax)

                if(numberOfCompletedTasks == $scope.tasks.length-1) {
                    console.log("--> last task, next will complete the level");
                    $scope.setOneTaskPending(true);
                }
                else {
                    $scope.setOneTaskPending(false);
                }
            }
        });
    }

    if ($scope.userId == null) {
        $scope.initIndexView();
    }
    else {
        initQuestView();
    }
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
        var validTask = true;

        if($scope.activeTask.isblogurltask) {

            var correctURL = $('#urlTextInput').val();
            console.log("--> activity: old url: "+correctURL);
            if(correctURL.substr(0, 4) != "http") {
                correctURL = "http://" + correctURL;
                console.log("--> activity: new url: "+correctURL);
            }


            if(gamificationUtilities.checkValidURL(correctURL) && $('#urlTextInput').val() != '') {
                validTask = true;
            }
            else {
                validTask = false;
            }
        }

        if(el.checked == false && validTask) {
            el.checked = true;

            var data = {};
            data.groupId = $scope.groupId;
            if($scope.activeTask.isblogurltask) {
                data.blogUrl = $('#urlTextInput').val();
            }

            data.text = $('#urlTextInput').val();

            console.log("--> task is valid, add completed group. Text provided: "+data.text);
            gamificationFactory.doPutURL('/task/'+$scope.activeTask._id+'/addcompletedgroup?nocache='+gamificationUtilities.getRandomUUID(), data).then(function (response) {

                if($scope.activeTask.isblogurltask) {
                    $scope.retrieveGroupURL();
                }

                $scope.returnToLevels();
            });
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

            var validTask = true;
            if($scope.activeTask.isblogurltask) {

                var correctURL = el.value;
                console.log("--> activity: old url: "+correctURL);
                if(correctURL.substr(0, 4) != "http") {
                    correctURL = "http://" + correctURL;
                    console.log("--> activity: new url: "+correctURL);
                }


                if(gamificationUtilities.checkValidURL(correctURL) && $('#urlTextInput').val() != '') {
                    validTask = true;
                }
                else {
                    validTask = false;
                }
            }

            if(validTask) {
                var data = {};
                data.text = el.value;
                if($scope.activeTask.isblogurltask) {
                    data.isblogurltask = true;
                    data.blogUrl = el.value;
                }

                gamificationFactory.doPutURL('/completedobject/'+$scope.currentCompletedObjectId+'?nocache='+gamificationUtilities.getRandomUUID(), data).then(function (response) {

                    if($scope.activeTask.isblogurltask) {
                        $scope.retrieveGroupURL();
                    }

                    window.location.href = '#/tab/quests1';
                });
            }


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

    if ($scope.userId == null) {
        $scope.initIndexView();
    }
    else {
        initQuestView();
    }

});
