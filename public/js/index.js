gamififcationApp.controller('navigationCtrl', function($scope, $http, $q, gamificationFactory, gamificationUtilities, $location, socket, $cookieStore, $ionicSideMenuDelegate, $ionicModal) {

    $scope.appHeader = "GAMIFICATION";

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

    $scope.availableGroupsToJoin = [];
    $scope.groupModel = null;
    $scope.selectedGroup = null;

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

    $scope.bArrayLastId = null;
    $scope.collectedGroupBadges = [];


    $scope.lastBadgeImgUrl = "";
    $scope.lastBadgeLabel = "";
    $scope.lastBadgeTitle = "";


    $scope.toggleLeftSideMenu = function() {
        $ionicSideMenuDelegate.toggleLeft();
    };

    /*
        First method called from "blank.js" if no user found
     */
    $scope.initIndexView = function() {
        /*
            little hack to remove extra characters returned from facebook login '_=_'
        */

        var v = window.location.href;
        if(v.substring(v.length-3, v.length) == '_=_') {
            window.location.href = v.substr(0, v.length-3);
        }
        else {
            /*
                if url formatted OK, get the user from the service.
                return: {"userName":"Jeremy Toussaint","userId":"100006460461762","avatar":"https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xfp1/t1.0-1/c15.0.50.50/p50x50/954801_10150002137498316_604636659114323291_n.jpg"}
             */
            gamificationFactory.doGetURL('/facebookUser').then(function (response) {
                /*
                    call $scope.retrieveUser(id) in "index.js"
                 */

                $scope.retrieveUser(response[0].userId);
            });
        }
    };

    /*
        retrieve local facebook user based on user id and facebook login
     */
    $scope.retrieveUser = function(id) {

        /*
            get student from service
            return : {"_id":"53b925040ac19c7317000001","admin":false,"avatar":"https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xfp1/t1.0-1/c15.0.50.50/p50x50/954801_10150002137498316_604636659114323291_n.jpg","badges":[],"classroom_id":null,"expertLevel":0,"facebookId":"100006460461762","firstName":"Jeremy","group_id":null,"lastName":"Toussaint"}
        */
        gamificationFactory.doGetURL('/student/facebookId/'+id).then(function (response) {
            $scope.username = response[0].firstName+' '+response[0].lastName;
            $scope.facebookId = response[0].facebookId;
            $scope.avatarUrl = response[0].avatar;
            $scope.userId = response[0]._id;
            $scope.groupId = response[0].group_id;
            $scope.classroomId = response[0].classroom_id;

            /*
                check whether the student belongs to a classroom
             */
            if($scope.classroomId == null || $scope.groupId == null) {
                /*
                    if not, list all available classroom
                 */
                $scope.retrieveClassrooms();
                if($cookieStore.get('readbadges') == null) {
                    console.log('--> setting badges cookie to 0 ');
                    $cookieStore.put('readbadges', 0);
                }
                window.location.href = '#/tab/userjoin';
                $scope.notReadyToNavigate = true;
            }
            else {
                $scope.notReadyToNavigate = false;
                $scope.changeMainTab(0);
                $scope.retrieveGroupURL();

                $scope.getAllActivities();
                $scope.retrieveCheckins();
                $scope.retrieveBadges(true);
            }
        });
    };

    /*
        Function to retrieve all classrooms
        returns: [{"_id":"5360f60b914f0a7a77000003","label":"Classroom 1"},{"_id":"5360f625914f0a3677000004","label":"Classroom 2"},{"_id":"5383429f75b9750a5f000001","label":"Test-10 June 2014"}]
     */
    $scope.retrieveClassrooms = function() {
        gamificationFactory.doGetURL('/classroom?nocache='+gamificationUtilities.getRandomUUID()).then(function (response) {
            $scope.classrooms = response[0];
        });
    }

    /*
        Function to assign the selected classroom
     */
    $scope.pickClassroom = function(croom) {
        $scope.selectedClass = croom._id;
    };

    /*
        Function to join a classroom
     */
    $scope.joinClassroom = function() {
        if($scope.selectedClass != null) {
            gamificationFactory.doPutURL('/classroom/'+$scope.selectedClass+'/addstudent/'+$scope.userId).then(function (response) {
                $scope.classroomId = $scope.selectedClass;
                $scope.availableGroupsToJoin = response[0].groups;
                window.location.href = '#/tab/userjoin2';
            });
        }
    };

    /*
     Function to assign the selected group
     */
    $scope.pickGroup = function(cgroup) {
        $scope.selectedGroup = cgroup._id;
    };

    /*
     Function to join a group
     */
    $scope.joinGroup = function() {
        if($scope.selectedGroup != null) {
            gamificationFactory.doPutURL('/group/'+$scope.selectedGroup+'/addstudent/'+$scope.userId).then(function (response) {
                $scope.postActivityJoinClass();
                $scope.retrieveUser($scope.facebookId);
            });
        }
    };

    /*
        Function to post a join message to the activity feed
     */
    $scope.postActivityJoinClass = function() {
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

    /*
        Function to send a "notif" message to node.js
     */
    $scope.notif = function() {
        socket.emit('notif');
        updateAllActivities();
    };

    /*
        Function to send a "badge" message to node.js
     */
    $scope.notifbadge = function() {
        console.log("--> sending badges notification");
        socket.emit('badge');
    };

    /*
        Function that receives notifications from node.js
     */
    socket.on('notify', function (data) {
        switch(data.message) {
            case "GAMIFICATION_UPDATE":
                console.log("--> updating activities");
                updateAllActivities();

                break;
            case "GAMIFICATION_BADGE":
                console.log("--> updating badges");
                $scope.retrieveBadges(true);
                break;
        }

    });

    /*
        Function to retrieve all existing activities for a classroom id, and assigned them to a dictionary
        returns:
        [
            {
                 _id: "53b934160ac19cfe78000001",
                 badgeId: null,
                 classroomId: "5360f60b914f0a7a77000003",
                 groupId: null,
                 label: "JOINED_GAMIFICATION",
                 ownerAvatar: "https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xfp1/t1.0-1/c15.0.50.50/p50x50/954801_10150002137498316_604636659114323291_n.jpg",
                 ownerName: "Jeremy Toussaint",
                 studentId: "100006460461762",
                 time: 1404646422,
                 type: "STUDENT",
                 url: null
            }
        ]
     */
    $scope.getAllActivities = function() {
        gamificationFactory.doGetURL('/activities/'+$scope.classroomId+'?nocache='+gamificationUtilities.getRandomUUID()).then(function (response) {
            response[0].forEach(function(activity) {
                $scope.activities_dico[activity.time] = activity;
                $scope.filterActivities();
            });
        });
    };

    /*
        Function to get only activity update (last 10)
    */
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

    /*
        Function to filter activities, between all, group, mine
    */
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

    /*
        Function to fetch the group URL
    */
    $scope.retrieveGroupURL = function() {
        gamificationFactory.doGetURL('/group/'+$scope.groupId+'?nocache='+gamificationUtilities.getRandomUUID()).then(function (response) {
            if(response[0].blogUrl != null) {
                $scope.groupblogUrl = response[0].blogUrl;
            }
        });
    };

    /*
        Function to retrieve the individual and group checkins
    */
    $scope.retrieveCheckins = function() {

        $scope.checkinBadgeValue = 0;
        /*
            Fetch the daily ones
        */
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

        /*
            Fetch the weekly ones
        */
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

    /*
        Function to retrieve the individual and group badges
    */
    $scope.retrieveBadges = function(overwriteGroupbadges) {

        console.log('--> $scope.retrieveBadges ');

        /*
            function to get the group badges
        */
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

    /*
        Function to reset the number of badges and update the cookie
    */
    $scope.reinitBadgeReadCounter = function() {
        $scope.badgeBadgeValue = 0;
        $cookieStore.put('readbadges', $scope.getTotalNumberOfBadges());
    };

    /*
        Function that returns the total number of badges (individual + group)
    */
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

                    console.log("--> updated quest - delivering badges if any");
                    $scope.deliverBadges(addcompletedgroupResponse[0].badges);

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



    /*
     Function to reload the current level when a task is completed
     */
    $scope.returnToLevels = function() {
        console.log("--> task is valid, add completed group");

        if($scope.oneTaskPending) {
            //make sure we don't run this again
            $scope.oneTaskPending = false;

            gamificationFactory.doPutURL('/level/'+$scope.activeLevelId+'/addcompletedgroup?nocache='+gamificationUtilities.getRandomUUID(), {groupId: $scope.groupId, deliverytype: 'AUTOMATIC'}).then(function (addcompletedgroupResponse) {
                $scope.unlockingCounter = 0;

                gamificationFactory.doPutURL('/group/'+$scope.groupId+'/updatelevelcount?nocache='+gamificationUtilities.getRandomUUID()).then(function (updatelevelcountResponse) {
                    console.log("--> completed levels: "+updatelevelcountResponse[0].levelcount);

                    switch(updatelevelcountResponse[0].levelcount) {
                        case 1:
                            console.log("--> 1 completed levels: "+addcompletedgroupResponse[0].badges.length);
                            addcompletedgroupResponse[0].badges.push("53fc2d3cea9dd81ba100000f");
                            console.log("--> 1 completed levels: "+addcompletedgroupResponse[0].badges.length);
                            break;
                        case 5:
                            console.log("--> 5 completed levels: "+addcompletedgroupResponse[0].badges.length);
                            addcompletedgroupResponse[0].badges.push("53fc2d5cea9dd888f7000010");
                            console.log("--> 5 completed levels: "+addcompletedgroupResponse[0].badges.length);
                            break;
                        case 10:
                            console.log("--> 10 completed levels: "+addcompletedgroupResponse[0].badges.length);
                            addcompletedgroupResponse[0].badges.push("53fc2d7aea9dd85f83000011");
                            console.log("--> 10 completed levels: "+addcompletedgroupResponse[0].badges.length);
                            break;
                        case 15:
                            console.log("--> 15 completed levels: "+addcompletedgroupResponse[0].badges.length);
                            addcompletedgroupResponse[0].badges.push("53fc2d98ea9dd8a52f000012");
                            console.log("--> 15 completed levels: "+addcompletedgroupResponse[0].badges.length);
                            break;
                        case 20:
                            console.log("--> 20 completed levels: "+addcompletedgroupResponse[0].badges.length);
                            addcompletedgroupResponse[0].badges.push("53fc2db7ea9dd874eb000013");
                            console.log("--> 20 completed levels: "+addcompletedgroupResponse[0].badges.length);
                            break;
                    };

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


            });
        }
        else {
            //$scope.readyToRefreshLevels($scope.objectsToUnlock.length);
            window.location.href = '#/tab/quests1';
        }
    };

    /*
     Function to deliver badges based on an array of ids
     */
    $scope.deliverBadges = function(bArray) {

        console.log("--> $scope.deliverBadges - badgesArray size: "+bArray.length);
        if(bArray.length > 0) {

            $scope.bArrayLastId = String(bArray.pop());

            gamificationFactory.doPutURL('/group/'+$scope.groupId+'/addbadge/'+$scope.bArrayLastId+'?nocache='+gamificationUtilities.getRandomUUID(), {deliverytype: 'AUTOMATIC'}).then(function (addBadgeResponse) {

                $scope.collectedGroupBadges = new Array();

                addBadgeResponse[0].badges.forEach(function(obj) {
                    $scope.collectedGroupBadges[String(obj['origin']._id)] = "Badge: "+obj['origin'].description;
                });

                for(var j=0; j < addBadgeResponse[0].students.length; j++) {
                    if((addBadgeResponse[0].students[j])._id == $scope.userId) {
                        $scope.badgesStudent = (addBadgeResponse[0].students[j]).badges;
                        break;
                    }
                }

                var data = {};

                data.label = $scope.collectedGroupBadges[$scope.bArrayLastId];

                $scope.showRecentBadge($scope.bArrayLastId);


                data.type = "GROUP";
                data.groupId = $scope.groupId;
                data.badgeId = $scope.bArrayLastId;
                data.classroomId = $scope.classroomId;
                data.ownerName = "Group: "+addBadgeResponse[0].label;

                gamificationFactory.doPostURL('/dactivity?nocache='+gamificationUtilities.getRandomUUID(), data).then(function(postActivityResponse) {


                    $scope.notif();
                });

                if(bArray.length > 0) {
                    $scope.deliverBadges(bArray);
                }
                else {
                    $scope.notifyBadges();
                }
            });
        }
    }

    /*
     Function to send badge notification and retrieve groups badges when all badges have been delivered
     */
    $scope.notifyBadges = function() {

        console.log("--> all badges delivered");
        $scope.notifbadge();
        $scope.retrieveBadges(true);
    };


    /*
     Function to update current level id and update whether it's last
     */
    $scope.setActiveLevelId = function(id, lastLevel) {
        $scope.activeLevelId = id;
        $scope.activeLevelIsLast = lastLevel;
        if(lastLevel) {
            console.log("--> last level, next will complete the quest");
        }
    };

    /*
     Function to change tabs
     */
    $scope.changeMainTab = function(ind) {
        switch(ind) {
            case 0:
                $scope.activityBadgeValue = 0;
                window.location.href = '#/tab/activities';
                $scope.appHeader = "ACTIVITIES";
                break;
            case 1:
                window.location.href = '#/tab/quests';
                $scope.appHeader = "QUESTS";
                break;
            case 2:
                window.location.href = '#/tab/checkins';
                $scope.appHeader = "CHECKINS";
                break;
            case 3:
                window.location.href = '#/tab/badges';
                $scope.appHeader = "BADGES";
                break;
            case 4:
                window.location.href = '#/tab/blogs';
                $scope.appHeader = "GROUPS";
                break;
            case 5:
                window.location.href = '#/tab/comment';
                $scope.appHeader = "COMMENT";
        }
    };

    /*
     Function to navigate to the checkins page
     */
    $scope.navigateToCheckin = function(ci) {
        $scope.activeCheckin = ci;
        window.location.href = '#/tab/checkins1';
    };

    /*
     Function to navigate to the blog url
     */
    $scope.navigateToBlog = function() {
        if($scope.groupblogUrl != null) {

            if($scope.groupblogUrl.substr(0, 4) != "http") {
                window.open("http://"+$scope.groupblogUrl,'_blank');
            }
            else {
                window.open($scope.groupblogUrl,'_blank');
            }


        }
    };

    /*
        Function to log out the current user (clear current facebook token)
    */
    $scope.logout = function() {
        gamificationFactory.doLogOut();
    };



    $scope.showRecentBadge = function(bId) {
        gamificationFactory.doGetURL('/badge/'+bId+'?nocache='+gamificationUtilities.getRandomUUID()).then(function (response) {

            $scope.lastBadgeImgUrl = getBadgeURL(response[0]._id);
            $scope.lastBadgeLabel = response[0].description;
            $scope.lastBadgeTitle = response[0].label;

            $scope.openModal();

        });
    };

    $ionicModal.fromTemplateUrl('my-modal.html', {
        scope: $scope,
        animation: 'slide-in-up',
        backdropClickToClose: true
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
    // Execute action on hide modal
    $scope.$on('modal.hidden', function() {
        // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function() {
        // Execute action
    });

    function getBadgeURL(tagid) {

        var p1 = "53fc27c9ea9dd81153000001";
        var p2 = "53fc2884ea9dd86bfd000002";
        var p3 = "53fc28b0ea9dd854d7000003";
        var p4 = "53fc28d2ea9dd850f8000004";
        var p5 = "53fc28f9ea9dd87a31000005";
        var p6 = "53fc2979ea9dd85f26000006";

        var p7 = "53fc2a62ea9dd80ab2000007";
        var p8 = "53fc2a92ea9dd8ccd4000008";
        var p9 = "53fc2ad4ea9dd8a288000009";
        var p10 = "53fc2b01ea9dd8ed2500000a";
        var p11 = "53fc2b3bea9dd8ef1e00000b";
        var p12 = "53fc2b73ea9dd8624600000c";
        var p13 = "53fc2badea9dd818d900000d";
        var p14 = "53fc2bdbea9dd829cd00000e";

        var g1 = "53fc2d3cea9dd81ba100000f";
        var g2 = "53fc2d5cea9dd888f7000010";
        var g3 = "53fc2d7aea9dd85f83000011";
        var g4 = "53fc2d98ea9dd8a52f000012";
        var g5 = "53fc2db7ea9dd874eb000013";

        var g6 = "53fc381dea9dd8ba24000014";
        var g7 = "53fc3842ea9dd8e1eb000015";
        var g8 = "53fc385aea9dd839b8000016";
        var g9 = "53fc38c9ea9dd8780900001a";
        var g10 = "53fc387fea9dd85825000017";
        var g11 = "53fc3897ea9dd8fc47000018";
        var g12 = "53fc38aeea9dd85ab1000019";

        switch(tagid) {

            case p1:
                return "img/badges/p1.png";
                break;

            case p2:
                return "img/badges/p2.png";
                break;

            case p3:
                return "img/badges/p3.png";
                break;

            case p4:
                return "img/badges/p4.png";
                break;

            case p5:
                return "img/badges/p5.png";
                break;

            case p6:
                return "img/badges/p6.png";
                break;

            case p7:
                return "img/badges/p7.png";
                break;

            case p8:
                return "img/badges/p8.png";
                break;

            case p9:
                return "img/badges/p9.png";
                break;

            case p10:
                return "img/badges/p10.png";
                break;

            case p11:
                return "img/badges/p11.png";
                break;

            case p12:
                return "img/badges/p12.png";
                break;

            case p13:
                return "img/badges/p13.png";
                break;

            case p14:
                return "img/badges/p14.png";
                break;

            case g1:
                return "img/badges/g1.png";
                break;

            case g2:
                return "img/badges/g2.png";
                break;

            case g3:
                return "img/badges/g3.png";
                break;

            case g4:
                return "img/badges/g4.png";
                break;

            case g5:
                return "img/badges/g5.png";
                break;

            case g6:
                return "img/badges/g6.png";
                break;

            case g7:
                return "img/badges/g7.png";
                break;

            case g8:
                return "img/badges/g8.png";
                break;

            case g9:
                return "img/badges/g9.png";
                break;

            case g10:
                return "img/badges/g10.png";
                break;

            case g11:
                return "img/badges/g11.png";
                break;

            case g12:
                return "img/badges/g12.png";
                break;

            default :
                return "";
            break;

        }


    };

});