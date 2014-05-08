gamififcationApp.controller('navigationCtrl', function($scope, $http, $q, gamificationFactory, gamificationUtilities, $location, socket, $cookieStore) {

    $scope.username = "";
    $scope.groupId = null;
    $scope.userId = null;
    $scope.facebookId = "";
    $scope.classroomId = "";
    $scope.avatarUrl = "";

    $scope.notReadyToNavigate = true;

    $scope.classrooms = [];
    $scope.classModel = null;
    $scope.selectedClass = null;

    $scope.activityBadgeValue = 0;

    $scope.latestActivities = [];
    $scope.activities_all = {};
    $scope.activities_group = [];
    $scope.activities_my = [];

    $scope.quests = [];
    $scope.activeQuest = null;
    $scope.activeTask = null;
    $scope.oneTaskPending = false;
    $scope.sortedlevels = [];
    $scope.activeLevelId = null;
    $scope.objectsToUnlock = [];

    $scope.dailyci = null;
    $scope.weeklyci = null;
    $scope.dailyciProgress = 0;
    $scope.weeklyciProgress = 0;
    $scope.checkinBadgeValue = 0;
    $scope.activeCheckin = null;

    $scope.badgesToAward = 0;
    $scope.badgesGroup = null;
    $scope.badgesStudent = null;
    $scope.badgeBadgeValue = 0;

    $scope.domain = "intermedia-prod03.uio.no";
    $scope.connection = null;
    $scope.password = "gami";
    $scope.participants = null;
    $scope.room = "gamification";


    //console.log($cookieStore.get('user'));
    //$cookieStore.put('user', "shito");  parseInt('123.45')
    //console.log($cookieStore.get('user'));

    $scope.notif = function() {
        socket.emit('notif');
        updateAllActivities();
    };

    $scope.notifbadge = function() {
        console.log("--> sending badges notification");
        socket.emit('badge');
    };

    socket.on('notify', function (data) {
        switch(data.message) {
            case "GAMIFICATION_UPDATE":
                console.log("updating activities");
                updateAllActivities();

                if($location.$$path != '/tab/activities') {
                    console.log(true);
                    $scope.activityBadgeValue = $scope.activityBadgeValue + 1;
                }
                break;
            case "GAMIFICATION_BADGE":
                console.log("updating badges");
                $scope.retrieveBadges();
                break;
        }

    });


    /* ** All the XMPP business ** */
    /*function enableMessaging() {
        $scope.connection = new Strophe.Connection('http://intermedia-prod03.uio.no/bosh');

        $scope.connection._hitError = function (reqStatus) {
            console.log(reqStatus, this.errors);
        };

        $scope.connection.connect($scope.facebookId+'@'+$scope.domain, $scope.password, function (status) {
            if (status === Strophe.Status.CONNECTED) {
                $scope.nickname = $scope.facebookId;

                $scope.$broadcast('gamififcationApp.connected');
            } else if (status === Strophe.Status.DISCONNECTED) {
                $scope.$broadcast('gamififcationApp.disconnected');
            }
        });

        //navigateToTab(1);

        //$urlRouterProvider.otherwise('/tab/activities');
        getAllActivities();
    };*/

//    $scope.$on('gamififcationApp.connected', function() {
//        console.log("connected");
//        $scope.chatMode = true;
//        $scope.joined = false;
//        $scope.participants = {};
//        $scope.connection.addHandler($scope.on_presence, null, "presence");
//        $scope.connection.addHandler($scope.on_public_message, null, "message", "groupchat");
//        $scope.connection.send($pres({to: $scope.room + "@conference."+$scope.domain+"/"+$scope.facebookId }).c('x', {xmlns: $scope.NS_MUC}));
//
//        //create a MUC room on the fly
//        /*$scope.connection.muc.init($scope.connection);
//        var d = $pres({from: $scope.nickname+"@"+$scope.domain, to: "gamification@conference."+$scope.domain+"/"+$scope.nickname}).c('x',{xmlns: $scope.NS_MUC});
//        $scope.connection.send(d.tree());
//        $scope.connection.muc.createInstantRoom("gamification@conference."+$scope.domain); */
//
//    });
//
//    $scope.$on('gamififcationApp.disconnected', function() {
//        console.log("disconnected");
//        enableMessaging();
//    });
//
//    $scope.on_presence = function(presence) {
//        console.log(presence);
//        $scope.joined = true;
//
//        return true;
//    };

    $scope.postActivity = function() {
        gamificationFactory.doPostURL('/activity?nocache='+gamificationUtilities.getRandomUUID()).then(function(response) {

            var data = {};
            data.studentId = $scope.facebookId;
            data.label = "JOINED_GAMIFICATION";
            data.type = "STUDENT";
            data.groupId = $scope.groupId;

            gamificationFactory.doPutURL('/activity/'+response[0]._id+'?nocache='+gamificationUtilities.getRandomUUID(), data).then(function (response) {
                $scope.notif();
            });


        });
    }

//    $scope.on_public_message = function(message) {
//
//        if(message.firstElementChild.innerHTML == "GAMIFICATION UPDATE") {
//            console.log("updating activities");
//            updateAllActivities();
//
//            if($location.$$path != '/tab/activities') {
//                console.log(true)
//                $scope.activityBadgeValue = $scope.activityBadgeValue + 1;
//            }
//        }
//
//        return true;
//    };
//
//    $scope.notifyMessaging = function() {
//        $scope.connection.send($msg({to: $scope.room+ "@conference."+$scope.domain, type: "groupchat"}).c('body').t('GAMIFICATION UPDATE'));
//    };

    $scope.getAllActivities = function() {
        gamificationFactory.doGetURL('/activity?nocache='+gamificationUtilities.getRandomUUID()).then(function (response) {
            response[0].forEach(function(activity) {
                $scope.activities_all[activity.time] = activity
                $scope.filterActivities();
            });
        });
    };


    $scope.retrieveCheckins = function() {

        $scope.checkinBadgeValue = 0;

        gamificationFactory.doGetURL('/checklistitem/daily/byclassid/'+$scope.classroomId+'/'+$scope.userId+'?nocache='+gamificationUtilities.getRandomUUID()).then(function (response) {
            $scope.dailyci = response[0];
            $scope.dailyciProgress = 0;

            for(var i in $scope.dailyci) {
                if(!$scope.dailyci[i].completed) {
                    $scope.checkinBadgeValue = $scope.checkinBadgeValue + 1;
                }
                else {
                    $scope.dailyciProgress = $scope.dailyciProgress + (100/$scope.dailyci.length);
                }
            }
        });

        gamificationFactory.doGetURL('/checklistitem/weekly/byclassid/'+$scope.classroomId+'/'+$scope.userId+'?nocache='+gamificationUtilities.getRandomUUID()).then(function (response) {
            $scope.weeklyci = response[0];
            $scope.weeklyciProgress = 0;

            for(var i in $scope.weeklyci) {
                if(!$scope.weeklyci[i].completed) {
                    $scope.checkinBadgeValue = $scope.checkinBadgeValue + 1;
                }
                else {
                    $scope.weeklyciProgress = $scope.weeklyciProgress + (100/$scope.weeklyci.length);
                }
            }
        });


    };

    $scope.retrieveBadges = function() {

        if($cookieStore.get('readbadges') == null) {
            $cookieStore.put('readbadges', 0);
        }

        gamificationFactory.doGetURL('/group/'+$scope.groupId+'?nocache='+gamificationUtilities.getRandomUUID()).then(function (response) {
            $scope.badgesGroup = response[0].badges;

            for(var i=0; i < response[0].students.length; i++) {

                if((response[0].students[i])._id == $scope.userId) {
                    $scope.badgesStudent = (response[0].students[i]).badges;
                    break;
                }
            }

            console.log('--> new number of badges: '+$scope.getTotalNumberOfBadges());

            if($location.$$path != '/tab/badges') {
                $scope.badgeBadgeValue = $scope.getTotalNumberOfBadges() - parseInt($cookieStore.get('readbadges'));
            }
        });
    };

    $scope.getTotalNumberOfBadges = function() {
        var totalNumber = 0;

        for(var i=0; i < $scope.badgesGroup.length; i++) {
            totalNumber = totalNumber + $scope.badgesGroup[i].count;
        }

        for(var j=0; j < $scope.badgesStudent.length; j++) {
            totalNumber = totalNumber + $scope.badgesStudent[j].count;
        }

        return totalNumber;
    };

    $scope.reinitBadgeReadCounter = function() {
        $scope.badgeBadgeValue = 0;
        $cookieStore.put('readbadges', $scope.getTotalNumberOfBadges());
    };


    function updateAllActivities() {
        gamificationFactory.doGetURL('/newactivities?nocache='+gamificationUtilities.getRandomUUID()).then(function (response) {
            response[0].forEach(function(activity) {
                $scope.activities_all[activity.time] = activity
                $scope.filterActivities();
            });
        });
    };

    $scope.filterActivities = function() {
        $scope.activities_my = [];
        $scope.activities_group = [];

        for(var i in $scope.activities_all) {
            if(($scope.activities_all[i]).studentId == $scope.facebookId) {
                $scope.activities_my.push($scope.activities_all[i]);
            }

            if(($scope.activities_all[i]).groupId == $scope.groupId) {
                $scope.activities_group.push($scope.activities_all[i]);
            }
        }
    };


    $scope.retrieveClassrooms = function() {
        gamificationFactory.doGetURL('/classroom').then(function (response) {
            $scope.classrooms = response[0];
        });
    }

    $scope.retrieveUser = function(id) {
        gamificationFactory.doGetURL('/student/facebookId/'+id).then(function (response) {
            $scope.username = response[0].firstName+' '+response[0].lastName;
            $scope.facebookId = response[0].facebookId;
            $scope.avatarUrl = response[0].avatar;
            $scope.userId = response[0]._id;
            $scope.groupId = response[0].group_id;
            $scope.classroomId = response[0].classroom_id;

            if(response[0].classroom_id == null) {
                $scope.retrieveClassrooms();
                window.location.href = '#/tab/userjoin';
                $scope.notReadyToNavigate = true;
            }
            else {
                $scope.notReadyToNavigate = false;
                $scope.changeMainTab(0);

                $scope.getAllActivities();
                $scope.retrieveCheckins();
                $scope.retrieveBadges();
            }
        });
    };

    $scope.logout = function() {
        gamificationFactory.doLogOut();
    };

    $scope.joinClassroom = function() {
        if($scope.selectedClass != null) {
            gamificationFactory.doPutURL('/classroom/'+$scope.selectedClass+'/addstudent/'+$scope.userId).then(function (response) {
                $scope.retrieveUser($scope.facebookId);
                $scope.postActivity();
            });
        }
    };

    $scope.pickClassroom = function(croom) {
        $scope.selectedClass = croom._id;
    };

    $scope.initIndexView = function() {
        /* little hack to remove extra characters returned from facebook login '_=_' */
        var v = window.location.href;
        if(v.substring(v.length-3, v.length) == '_=_') {
            window.location.href = v.substr(0, v.length-3);
        }
        else {
            gamificationFactory.doGetURL('/facebookUser').then(function (response) {
                $scope.retrieveUser(response[0].userId);
            });
        }

    };

    $scope.navigateToQuest = function(quest) {
        if(quest.locked == false) {
            gamificationFactory.doGetURL('/quest/'+quest._id+'?nocache='+gamificationUtilities.getRandomUUID()).then(function (response) {
                $scope.activeQuest = response[0];
                $scope.sortedlevels = gamificationUtilities.sortArrayByKey($scope.activeQuest.levels, 'order');
                window.location.href = '#/tab/quests1';
            });
        }
    };

    $scope.navigateToTask = function(task) {
        gamificationFactory.doGetURL('/task/'+task._id+'?nocache='+gamificationUtilities.getRandomUUID()).then(function (response) {
            $scope.activeTask = response[0];
            window.location.href = '#/tab/quests2';
        });
    };

    $scope.setOneTaskPending = function(b) {
        $scope.oneTaskPending = b;
    };

    $scope.setObjectsToUnlock = function(arr) {
        $scope.objectsToUnlock = arr;
    };

    $scope.readyToRefreshLevels = function(count) {
        if(count == $scope.objectsToUnlock.length) {
            $scope.navigateToQuest($scope.activeQuest);
        }
    };

    $scope.notifyBadges = function(count) {
        if(count == $scope.badgesToAward) {
            console.log("--> all badges delivered");
            $scope.notifbadge();
            console.log('--> new number of badges: '+$scope.getTotalNumberOfBadges());

            if($location.$$path != '/tab/badges') {
                $scope.badgeBadgeValue = $scope.getTotalNumberOfBadges() - parseInt($cookieStore.get('readbadges'));
            }
        }
    };

    $scope.returnToLevels = function() {
        if($scope.oneTaskPending) {
            //unlock next level
            var data = {};
            data.groupId = $scope.groupId;

            gamificationFactory.doPutURL('/level/'+$scope.activeLevelId+'/addcompletedgroup?nocache='+gamificationUtilities.getRandomUUID(), data).then(function (response) {
                $scope.unlockingCounter = 0;
                $scope.objectsToUnlock.forEach(function(obj) {

                    switch(obj['type']) {
                        case "LEVEL":
                            gamificationFactory.doPutURL('/level/'+obj['unid']+'/unlock?nocache='+gamificationUtilities.getRandomUUID()).then(function (response) {
                                $scope.unlockingCounter++;
                                $scope.readyToRefreshLevels($scope.unlockingCounter);
                            });
                            break;
                        case "QUEST":
                            gamificationFactory.doPutURL('/quest/'+obj['unid']+'/unlock?nocache='+gamificationUtilities.getRandomUUID()).then(function (response) {
                                $scope.unlockingCounter++;
                                $scope.readyToRefreshLevels($scope.unlockingCounter);
                            });
                            break;
                    };
                });

                console.log("--> updated level - delivering badges if any");
                $scope.badgesToAward = response[0].badges.length;
                for(var i=0; i < $scope.badgesToAward; i++) {
                    gamificationFactory.doPutURL('/group/'+$scope.groupId+'/addbadge/'+response[0].badges[i]+'?nocache='+gamificationUtilities.getRandomUUID(), data).then(function (res) {
                        $scope.badgesGroup = res[0].badges;

                        for(var i=0; i < res[0].students.length; i++) {

                            if((res[0].students[i])._id == $scope.userId) {
                                $scope.badgesStudent = (res[0].students[i]).badges;
                                break;
                            }
                        }

                        $scope.notifyBadges(i);
                    });
                }


            });
        }
        else {
            $scope.readyToRefreshLevels($scope.objectsToUnlock.length);
        }
    };

    $scope.setActiveLevelId = function(id) {
        $scope.activeLevelId = id;
    };

    $scope.changeMainTab = function(ind) {
        switch(ind) {
            case 0:
                $scope.activityBadgeValue = 0;
                window.location.href = '#/tab/activities';
                break;
            case 1:
                window.location.href = '#/tab/quests';
                break;
            case 2:
                window.location.href = '#/tab/checkins';
                break;
            case 3:
                window.location.href = '#/tab/badges';
                break;
            case 4:
                window.location.href = '#/tab/blogs';
                break;
        }
    };

    $scope.navigateToCheckin = function(ci) {
        $scope.activeCheckin = ci;
        window.location.href = '#/tab/checkins1';
    };
});