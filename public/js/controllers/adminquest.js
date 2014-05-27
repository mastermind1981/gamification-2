gamificationAdminApp.controller('adminMainCtrl', function ($scope, $http, $q) {

    $scope.activeQuest = null;
    $scope.activeLevel = null;
    $scope.sortedlevels = [];
    $scope.sortedtasks = [];

    $scope.setSortedLevels = function (levels) {
        $scope.sortedlevels = levels;
    };

    $scope.setSortedTasks = function (tasks) {
        $scope.sortedtasks = tasks;
    };

    $scope.setActiveQuest = function (q) {
        $scope.activeQuest = q;
    };

    $scope.setActiveLevel = function (l) {
        $scope.activeLevel = l;
    };

});

gamificationAdminApp.controller('adminQuestCtrl', function ($scope, $http, $q, gamificationAdminFactory, gamificationAdminUtilities, $ionicModal) {

    $scope.newQuestObject = null;
    $scope.nextAvailableOrder = 0;
    $scope.islocked = true;
    $scope.questToEdit = null;
    $scope.reorderQuests = false;

    $ionicModal.fromTemplateUrl('templates/modal-addquest.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.questmodal = modal;
    });
    $scope.openQuestModal = function () {
        $scope.questmodal.show();
    };
    $scope.closeQuestModal = function () {
        $('#questLabelInput').val('');
        $('#questLockedInput').prop('checked', true);
        $scope.questToEdit = null;
        $scope.questmodal.hide();
    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
        $scope.questmodal.remove();
    });

    $scope.quests = [];
    $scope.initQuestView = function () {
        gamificationAdminFactory.doGetURL('/adminquest').then(function (response) {
            $scope.quests = response[0];

            if($scope.reorderQuests) {
                $scope.reorderQuests = false;

                for(var i=0; i<$scope.quests.length; i++) {
                    var data = {}
                    data.order = i+1;

                    gamificationAdminFactory.doPutURL('/quest/'+$scope.quests[i]._id+'?nocache='+gamificationAdminUtilities.getRandomUUID(), data).then(function (putResponse) {
                    });
                }
                $scope.initQuestView();
            }
        });

    };

    $scope.navigateToQuest = function (quest) {
        gamificationAdminFactory.doGetURL('/quest/' + quest._id + '?nocache=' + gamificationAdminUtilities.getRandomUUID()).then(function (response) {
            $scope.setActiveQuest(response[0]);
            window.location.href = '#/tab/quests1';
        });

    };

    $scope.addnewquest = function () {
        $scope.nextAvailableOrder = $scope.quests.length + 1;
        $scope.openQuestModal();
    };

    $scope.createNewQuest = function () {
        if($('#questLabelInput').val() != "" && $('#questLabelInput').val() != null) {
            gamificationAdminFactory.doPostURL('/quest?nocache=' + gamificationAdminUtilities.getRandomUUID()).then(function (postResponse) {
                $scope.questToEdit = postResponse[0];
                $scope.updateQuest();
            });
        }
    };

    $scope.updateQuest = function () {

        var data = {};
        data.label = $('#questLabelInput').val();
        data.order = $scope.nextAvailableOrder;
        data.locked = $('#questLockedInput').prop('checked');

        gamificationAdminFactory.doPutURL('/quest/'+$scope.questToEdit._id+'?nocache='+gamificationAdminUtilities.getRandomUUID(), data).then(function (putResponse) {
            $scope.closeQuestModal();
            $scope.initQuestView();
        });

    };

    $scope.editQuest = function (q) {
        $scope.questToEdit = q;
        $scope.openQuestModal();

        $scope.nextAvailableOrder = q.order;
        $('#questLabelInput').val(q.label);
        $('#questLockedInput').prop('checked', q.locked);

    };

    $scope.deleteQuest = function () {
        gamificationAdminFactory.doDeleteURL('/quest/' + $scope.questToEdit._id + '?nocache=' + gamificationAdminUtilities.getRandomUUID()).then(function (response) {

            if(response[1] != 200) {
                //show alert
            }

            $scope.reorderQuests = true;
            $scope.closeQuestModal();
            $scope.initQuestView();
        });
    };

    $scope.initQuestView();
});

gamificationAdminApp.controller('adminQuest1Ctrl', function ($scope, $location, $ionicModal, $ionicPopup, $http, $q, gamificationAdminFactory, gamificationAdminUtilities) {

    $scope.newLevelObject = null;
    $scope.nextAvailableOrder = 0;
    $scope.islocked = true;
    $scope.levelToEdit = null;
    $scope.levels = [];
    $scope.reorderLevels = false;

    $ionicModal.fromTemplateUrl('templates/modal-addlevel.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.levelmodal = modal;
    });

    $scope.openLevelModal = function () {
        $scope.levelmodal.show();
    };

    $scope.closeLevelModal = function () {
        $scope.levelToEdit = null;
        $('#levelLabelInput').val('');
        $('#levelLockedInput').prop('checked', true);
        $scope.levelmodal.hide();
    };

    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
        $scope.levelmodal.remove();
    });

    $scope.backToQuest = function () {
        window.location.href = '#/tab/quests';
    };

    $scope.initLevelView = function() {
        gamificationAdminFactory.doGetURL('/quest/' + $scope.activeQuest._id + '?nocache=' + gamificationAdminUtilities.getRandomUUID()).then(function (response) {
            $scope.setActiveQuest(response[0]);
            if ($scope.activeQuest.levels.length > 0) {
                $scope.setSortedLevels(gamificationAdminUtilities.sortArrayByKey($scope.activeQuest.levels, 'order'));
            }
            else {
                $scope.setSortedLevels([]);
            }

            $scope.levels = $scope.sortedlevels.slice(0);

            if($scope.reorderLevels) {
                $scope.reorderLevels = false;

                for(var i=0; i<$scope.levels.length; i++) {
                    var data = {}
                    data.order = i+1;

                    gamificationAdminFactory.doPutURL('/level/'+$scope.levels[i]._id+'?nocache='+gamificationAdminUtilities.getRandomUUID(), data).then(function (putResponse) {
                    });
                }
                $scope.initLevelView();
            }
        });
    };

    $scope.navigateToLevel = function (level) {
        gamificationAdminFactory.doGetURL('/level/' + level._id + '?nocache=' + gamificationAdminUtilities.getRandomUUID()).then(function (response) {
            $scope.setActiveLevel(response[0]);


            if ($scope.activeLevel.tasks.length > 0) {
                $scope.setSortedTasks(gamificationAdminUtilities.sortArrayByKey($scope.activeLevel.tasks, '_id'));
            }
            else {
                $scope.setSortedTasks([]);
            }
            window.location.href = '#/tab/quests2';
        });

    };

    $scope.addnewlevel = function () {
        $scope.nextAvailableOrder = $scope.levels.length + 1;
        $scope.openLevelModal();
    };

    $scope.createNewLevel = function () {
        if($('#levelLabelInput').val() != "" && $('#levelLabelInput').val() != null) {
            gamificationAdminFactory.doPostURL('/level?nocache=' + gamificationAdminUtilities.getRandomUUID()).then(function (postResponse) {
                if(postResponse[1] == 200) {
                    $scope.levelToEdit = postResponse[0];
                    gamificationAdminFactory.doPutURL('/quest/'+$scope.activeQuest._id+'/addlevel/'+$scope.levelToEdit._id+'?nocache='+gamificationAdminUtilities.getRandomUUID(), null).then(function (putResponse) {
                        $scope.updateLevel();
                    });

                }
            });
        }
    };

    $scope.updateLevel = function () {

        var data = {};
        data.label = $('#levelLabelInput').val();
        data.order = $scope.nextAvailableOrder;
        data.locked = $('#levelLockedInput').prop('checked');

        gamificationAdminFactory.doPutURL('/level/'+$scope.levelToEdit._id+'?nocache='+gamificationAdminUtilities.getRandomUUID(), data).then(function (putResponse) {
            $scope.closeLevelModal();
            $scope.initLevelView();
        });

    };

    $scope.editLevel = function (l) {
        $scope.levelToEdit = l;
        $scope.openLevelModal();

        $scope.nextAvailableOrder = l.order;
        $('#levelLabelInput').val(l.label);
        $('#levelLockedInput').prop('checked', l.locked);

    };

    $scope.deleteLevel = function () {

        gamificationAdminFactory.doPutURL('/quest/'+$scope.activeQuest._id+'/removelevel/'+$scope.levelToEdit._id+'?nocache='+gamificationAdminUtilities.getRandomUUID(), null).then(function (putResponse) {
            gamificationAdminFactory.doDeleteURL('/level/' + $scope.levelToEdit._id + '?nocache=' + gamificationAdminUtilities.getRandomUUID()).then(function (response) {

                if(response[1] != 200) {
                    //show alert
                }

                $scope.reorderLevels = true;
                $scope.closeLevelModal();
                $scope.initLevelView();
            });


        });
    };

    if ($scope.activeQuest == null) {
        window.location.href = '#/tab/quests';
    }
    else {
        $scope.initLevelView();
    }
});

gamificationAdminApp.controller('adminQuest2Ctrl', function ($scope, $location, $ionicModal, $ionicPopup, $http, $q, gamificationAdminFactory, gamificationAdminUtilities) {
    $scope.newTaskObject = null;
    $scope.nextAvailableOrder = 0;
    $scope.islocked = true;
    $scope.taskToEdit = null;
    $scope.tasks = [];
    $scope.reorderTasks = false;

    $ionicModal.fromTemplateUrl('templates/modal-addtask.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.taskmodal = modal;
    });

    $scope.openTaskModal = function () {
        $scope.taskmodal.show();
    };

    $scope.closeTaskModal = function () {
        $scope.taskToEdit = null;
        $('#taskLabelInput').val('');
        $('#taskIntroductionInput').val('');
        $('#taskBlogurlInput').prop('checked', false);
        $scope.taskmodal.hide();
    };

    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
        $scope.taskmodal.remove();
    });

    $scope.backToLevel = function () {
        window.location.href = '#/tab/quests1';
    };

    $scope.initTaskView = function() {
        gamificationAdminFactory.doGetURL('/level/' + $scope.activeLevel._id + '?nocache=' + gamificationAdminUtilities.getRandomUUID()).then(function (response) {
            $scope.setActiveLevel(response[0]);

            if ($scope.activeLevel.tasks.length > 0) {
                $scope.setSortedTasks(gamificationAdminUtilities.sortArrayByKey($scope.activeLevel.tasks, 'order'));
            }
            else {
                $scope.setSortedTasks([]);
            }

            $scope.tasks = $scope.sortedtasks.slice(0);

            if($scope.reorderTasks) {
                $scope.reorderTasks = false;

                for(var i=0; i<$scope.tasks.length; i++) {
                    var data = {}
                    data.order = i+1;

                    gamificationAdminFactory.doPutURL('/task/'+$scope.tasks[i]._id+'?nocache='+gamificationAdminUtilities.getRandomUUID(), data).then(function (putResponse) {
                    });
                }
                $scope.initTaskView();
            }
        });
    };

    $scope.addnewtask = function () {
        $scope.nextAvailableOrder = $scope.tasks.length + 1;
        $scope.openTaskModal();
    };

    $scope.createNewTask = function () {
        if($('#taskLabelInput').val() != "" && $('#taskLabelInput').val() != null && $('#taskIntroductionInput').val() != null) {
            gamificationAdminFactory.doPostURL('/task?nocache=' + gamificationAdminUtilities.getRandomUUID()).then(function (postResponse) {
                if(postResponse[1] == 200) {
                    $scope.taskToEdit = postResponse[0];
                    gamificationAdminFactory.doPutURL('/level/'+$scope.activeLevel._id+'/addtask/'+$scope.taskToEdit._id+'?nocache='+gamificationAdminUtilities.getRandomUUID(), null).then(function (putResponse) {
                        $scope.updateTask();
                    });

                }
            });
        }
    };

    $scope.updateTask = function () {

        var data = {};
        data.label = $('#taskLabelInput').val();
        data.order = $scope.nextAvailableOrder;
        data.isblogurltask = $('#taskBlogurlInput').prop('checked');
        data.introduction = $('#taskIntroductionInput').val();

        gamificationAdminFactory.doPutURL('/task/'+$scope.taskToEdit._id+'?nocache='+gamificationAdminUtilities.getRandomUUID(), data).then(function (putResponse) {
            $scope.closeTaskModal();
            $scope.initTaskView();
        });

    };

    $scope.editTask = function (l) {
        $scope.taskToEdit = l;
        $scope.openTaskModal();

        $scope.nextAvailableOrder = l.order;
        $('#taskLabelInput').val(l.label);
        $('#taskBlogurlInput').prop('checked', l.isblogurltask);
        $('#taskIntroductionInput').val(l.introduction);

    };

    $scope.deleteTask = function () {

        gamificationAdminFactory.doPutURL('/level/'+$scope.activeLevel._id+'/removetask/'+$scope.taskToEdit._id+'?nocache='+gamificationAdminUtilities.getRandomUUID(), null).then(function (putResponse) {

            gamificationAdminFactory.doDeleteURL('/task/' + $scope.taskToEdit._id + '?nocache=' + gamificationAdminUtilities.getRandomUUID()).then(function (response) {

                if(response[1] != 200) {
                    //show alert
                }

                $scope.reorderTasks = true;
                $scope.closeTaskModal();
                $scope.initTaskView();
            });


        });



    };

    if ($scope.activeQuest == null) {
        window.location.href = '#/tab/quests';
    }
    else {
        $scope.initTaskView();
    }
});