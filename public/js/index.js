gamififcationApp.controller('navigationCtrl', function($scope, $http, $q, gamificationFactory, gamificationUtilities, $location, socket, $cookieStore) {

    $scope.username = "";
    $scope.groupId = null;
    $scope.userId = null;
    $scope.facebookId = "";
    $scope.classroomId = "";
    $scope.avatarUrl = "";
    $scope.groupblogUrl = null;

    $scope.notReadyToNavigate = true;

    $scope.classrooms = [];
    $scope.classModel = null;
    $scope.selectedClass = null;

    $scope.activityBadgeValue = 0;

    $scope.latestActivities = [];
    $scope.activities_dico = {};
    $scope.activities_all = [];
    $scope.activities_group = [];
    $scope.activities_my = [];

    $scope.quests = [];
    $scope.activeQuest = null;
    $scope.activeTask = null;
    $scope.oneTaskPending = false;
    $scope.sortedlevels = [];
    $scope.activeLevelId = null;
    $scope.objectsToUnlock = [];
    $scope.activeLevelIsLast = false;

    $scope.dailyci = null;
    $scope.weeklyci = null;
    $scope.dailyciProgress = 0;
    $scope.weeklyciProgress = 0;
    $scope.checkinBadgeValue = 0;
    $scope.activeCheckin = null;

    $scope.badgesGroup = null;
    $scope.badgesStudent = null;
    $scope.badgeBadgeValue = 0;

    //$scope.domain = "intermedia-prod03.uio.no";
    //$scope.connection = null;
    //$scope.password = "gami";
    //$scope.participants = null;
    //$scope.room = "gamification";


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
                console.log("--> updating activities");
                updateAllActivities();

                break;
            case "GAMIFICATION_BADGE":
                console.log("--> updating badges");
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

    $scope.navigateToBlog = function() {
        if($scope.groupblogUrl != null) {

            if($scope.groupblogUrl.substr(0, 4) != "http") {
                window.open("http://"+$scope.groupblogUrl,'_blank');
            }
            else {
                window.open($scope.groupblogUrl,'_blank');
            }


        }
    }

    $scope.postActivity = function() {
        gamificationFactory.doPostURL('/activity?nocache='+gamificationUtilities.getRandomUUID()).then(function(response) {

            var data = {};
            data.studentId = $scope.facebookId;
            data.label = "JOINED_GAMIFICATION";
            data.type = "STUDENT";
            data.groupId = $scope.groupId;
            data.classroomId = $scope.classroomId;

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
        gamificationFactory.doGetURL('/activities/'+$scope.classroomId+'?nocache='+gamificationUtilities.getRandomUUID()).then(function (response) {
            response[0].forEach(function(activity) {
                $scope.activities_dico[activity.time] = activity;
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

        if($location.$$path != '/tab/activities') {
            $scope.activityBadgeValue = $scope.activityBadgeValue + 1;
        }

        gamificationFactory.doGetURL('/newactivities/'+$scope.classroomId+'?nocache='+gamificationUtilities.getRandomUUID()).then(function (response) {
            response[0].forEach(function(activity) {
                $scope.activities_dico[activity.time] = activity;
                $scope.filterActivities();
            });
        });
    };

    $scope.filterActivities = function() {

        $scope.activities_all = [];
        for(var j in $scope.activities_dico) {
            $scope.activities_all.push($scope.activities_dico[j]);
        }

        $scope.activities_my = [];
        $scope.activities_group = [];

        for(var i in $scope.activities_dico) {
            if(($scope.activities_dico[i]).studentId == $scope.facebookId) {
                $scope.activities_my.push($scope.activities_dico[i]);
            }

            if(($scope.activities_dico[i]).groupId == $scope.groupId) {
                $scope.activities_group.push($scope.activities_dico[i]);
            }
        }

        $scope.activities_all.reverse();
        $scope.activities_my.reverse();
        $scope.activities_group.reverse();
    };


    $scope.retrieveClassrooms = function() {
        gamificationFactory.doGetURL('/classroom?nocache='+gamificationUtilities.getRandomUUID()).then(function (response) {
            $scope.classrooms = response[0];
        });
    }

    $scope.retrieveGroup = function() {
        gamificationFactory.doGetURL('/group/'+$scope.groupId+'?nocache='+gamificationUtilities.getRandomUUID()).then(function (response) {
            if(response[0].blogUrl != null) {



                $scope.groupblogUrl = response[0].blogUrl;
            }
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
                $scope.retrieveGroup();

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
        console.log("--> quest hasaccess "+quest.hasaccess);
        if(quest.hasaccess) {
            window.location.href = '#/tab/quests';
            gamificationFactory.doGetURL('/quest/'+quest._id+'/bygroupid/'+$scope.groupId+'?nocache='+gamificationUtilities.getRandomUUID()).then(function (response) {
                $scope.activeQuest = response[0];
                $scope.sortedlevels = [];
                if($scope.activeQuest.levels.length > 0) {
                    $scope.sortedlevels = gamificationUtilities.sortArrayByKey($scope.activeQuest.levels, 'order');
                    window.location.href = '#/tab/quests1';
                }
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
        console.log("--> setOneTaskPending: "+b);
        $scope.oneTaskPending = b;
    };

    $scope.setObjectsToUnlock = function(arr) {
        $scope.objectsToUnlock = arr;
    };

    $scope.readyToRefreshLevels = function(count) {
        console.log("--> refreshing levels");

        if(count == $scope.objectsToUnlock.length) {
            console.log("--> all objects have been unlocked");

            if($scope.activeLevelIsLast) {
                $scope.activeLevelIsLast = false;

                gamificationFactory.doPutURL('/quest/'+$scope.activeQuest._id+'/addcompletedgroup?nocache='+gamificationUtilities.getRandomUUID(), {groupId: $scope.groupId, deliverytype: 'AUTOMATIC'}).then(function (addcompletedgroupResponse) {

                    console.log("--> updated quest - delivering badges if any");
                    $scope.deliverBadges(addcompletedgroupResponse[0].badges);

                    $scope.unlockingQuestCounter = 0;
                    if($scope.activeQuest.idstounlock.length > 0) {

                        $scope.activeQuest.idstounlock.forEach(function(obj) {

                            switch(obj['type']) {
                                case "LEVEL":
                                    console.log("--> quest: "+$scope.activeQuest._id+' unlocking level: '+obj['unid']);
                                    gamificationFactory.doPutURL('/level/'+obj['unid']+'/unlockfor/'+$scope.groupId+'?nocache='+gamificationUtilities.getRandomUUID()).then(function (unlockLevelResponse) {
                                        $scope.unlockingQuestCounter++;
                                        $scope.readyToRefreshQuests($scope.unlockingQuestCounter);
                                    });
                                    break;
                                case "QUEST":
                                    console.log("--> quest: "+$scope.activeQuest._id+' unlocking quest: '+obj['unid']);
                                    gamificationFactory.doPutURL('/quest/'+obj['unid']+'/unlockfor/'+$scope.groupId+'?nocache='+gamificationUtilities.getRandomUUID()).then(function (unlockQuestResponse) {
                                        $scope.unlockingQuestCounter++;
                                        $scope.readyToRefreshQuests($scope.unlockingQuestCounter);
                                    });
                                    break;
                            };
                        });
                    }
                    else {
                        $scope.changeMainTab(1);
                    }


                });
            }
            else {
                $scope.navigateToQuest($scope.activeQuest);
            }
        }
        else {
            console.log("--> not all objects have been unlocked, let's wait one more time");
        }
    };

    $scope.readyToRefreshQuests = function(count) {
        if(count == $scope.activeQuest.idstounlock.length) {
            $scope.changeMainTab(1);
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
        console.log("--> task is valid, add completed group");

        if($scope.oneTaskPending) {
            //make sure we don't run this again
            $scope.oneTaskPending = false;

            gamificationFactory.doPutURL('/level/'+$scope.activeLevelId+'/addcompletedgroup?nocache='+gamificationUtilities.getRandomUUID(), {groupId: $scope.groupId, deliverytype: 'AUTOMATIC'}).then(function (addcompletedgroupResponse) {
                $scope.unlockingCounter = 0;

                if($scope.objectsToUnlock.length > 0) {
                    console.log("--> let's unlock items for completed level: "+$scope.activeLevelId);

                    $scope.objectsToUnlock.forEach(function(obj) {

                        switch(obj['type']) {
                            case "LEVEL":
                                console.log("--> level: "+$scope.activeLevelId+' unlocking level: '+obj['unid']);
                                gamificationFactory.doPutURL('/level/'+obj['unid']+'/unlockfor/'+$scope.groupId+'?nocache='+gamificationUtilities.getRandomUUID()).then(function (unlockLevelResponse) {
                                    $scope.unlockingCounter++;
                                    $scope.readyToRefreshLevels($scope.unlockingCounter);
                                });
                                break;
                            case "QUEST":
                                console.log("--> level: "+$scope.activeLevelId+' unlocking quest: '+obj['unid']);
                                gamificationFactory.doPutURL('/quest/'+obj['unid']+'/unlockfor/'+$scope.groupId+'?nocache='+gamificationUtilities.getRandomUUID()).then(function (unlockQuestResponse) {
                                    $scope.unlockingCounter++;
                                    $scope.readyToRefreshLevels($scope.unlockingCounter);
                                });
                                break;
                        };
                    });
                }
                else {
                    console.log("--> nothing to unlock for completed level");
                    $scope.readyToRefreshLevels($scope.unlockingCounter);
                }


                console.log("--> updated level - delivering badges if any");
                $scope.deliverBadges(addcompletedgroupResponse[0].badges);
            });
        }
        else {
            //$scope.readyToRefreshLevels($scope.objectsToUnlock.length);
            window.location.href = '#/tab/quests1';
        }
    };

    $scope.deliverBadges = function(badgesArray) {
        for(var i=0; i < badgesArray.length; i++) {

            gamificationFactory.doPutURL('/group/'+$scope.groupId+'/addbadge/'+badgesArray[i]+'?nocache='+gamificationUtilities.getRandomUUID(), {groupId: $scope.groupId, deliverytype: 'AUTOMATIC'}).then(function (addBadgeResponse) {

                $scope.collectedGroupBadges = addBadgeResponse[0].badges;

                for(var i=0; i < addBadgeResponse[0].students.length; i++) {

                    if((addBadgeResponse[0].students[i])._id == $scope.userId) {
                        $scope.badgesStudent = (addBadgeResponse[0].students[i]).badges;
                        break;
                    }
                }

                gamificationFactory.doPostURL('/activity?nocache='+gamificationUtilities.getRandomUUID()).then(function(postActivityResponse) {

                    var data = {};
                    $scope.collectedGroupBadges.forEach(function(obj) {
                        if(obj['origin']._id == badgesArray[i]) {
                            data.label = "Badge: "+obj['origin'].description;
                        }
                    });
                    //data.label = "NEW_BADGE";
                    data.type = "GROUP";
                    data.groupId = $scope.groupId;
                    data.badgeId = badgesArray[i];
                    data.classroomId = $scope.classroomId;

                    gamificationFactory.doPutURL('/activity/'+postActivityResponse[0]._id+'?nocache='+gamificationUtilities.getRandomUUID(), data).then(function (putActivityResponse) {
                        $scope.notif();
                    });
                });

                $scope.retrieveBadges();
                $scope.notifyBadges(i);
            });
        }
    }

    $scope.setActiveLevelId = function(id, lastLevel) {
        $scope.activeLevelId = id;
        $scope.activeLevelIsLast = lastLevel;
        if(lastLevel) {
            console.log("--> last level, next will complete the quest");
        }
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