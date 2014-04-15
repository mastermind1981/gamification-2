gamififcationApp.controller('navigationCtrl', function($scope, $http, $q, gamificationFactory, gamificationUtilities, $location) {

    $scope.username = "";
    $scope.groupId = null;
    $scope.userId = null;
    $scope.facebookId = "";
    $scope.avatarUrl = "";
    $scope.isStudentAssigned = false;
    $scope.hasJustJoinedClassroom = false;

    $scope.classrooms = [];
    $scope.classModel = "";
    $scope.selectedClass = null;

    $scope.activityBadgeValue = 0;

    $scope.latestActivities = [];
    $scope.activities_all = {};
    $scope.activities_group = [];
    $scope.activities_my = [];

    $scope.domain = "intermedia-prod03.uio.no";
    $scope.connection = null;
    $scope.password = "gami";
    $scope.participants = null;
    $scope.room = "gamification";

    /* ** All the XMPP business ** */
    function enableMessaging() {
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
    };

    $scope.$on('gamififcationApp.connected', function() {
        console.log("connected");
        $scope.chatMode = true;
        $scope.joined = false;
        $scope.participants = {};
        $scope.connection.addHandler($scope.on_presence, null, "presence");
        $scope.connection.addHandler($scope.on_public_message, null, "message", "groupchat");
        $scope.connection.send($pres({to: $scope.room + "@conference."+$scope.domain+"/"+$scope.facebookId }).c('x', {xmlns: $scope.NS_MUC}));

        //create a MUC room on the fly
        /*$scope.connection.muc.init($scope.connection);
        var d = $pres({from: $scope.nickname+"@"+$scope.domain, to: "gamification@conference."+$scope.domain+"/"+$scope.nickname}).c('x',{xmlns: $scope.NS_MUC});
        $scope.connection.send(d.tree());
        $scope.connection.muc.createInstantRoom("gamification@conference."+$scope.domain); */

    });

    $scope.$on('gamififcationApp.disconnected', function() {
        console.log("disconnected");
        enableMessaging();
    });

    $scope.on_presence = function(presence) {
        console.log(presence);
        $scope.joined = true;

        if($scope.hasJustJoinedClassroom) {
            $scope.hasJustJoinedClassroom = false;

        }

        return true;
    };

    $scope.postActivity = function() {
        gamificationFactory.doPostURL('/activity?nocache='+gamificationUtilities.getRandomUUID()).then(function(response) {

            var data = {};
            data.studentId = $scope.facebookId;
            data.label = "JOINED GAMIFICATION";
            data.type = "STUDENT";
            data.groupId = $scope.groupId;

            gamificationFactory.doPutURL('/activity/'+response[0]._id+'?nocache='+gamificationUtilities.getRandomUUID(), data).then(function (response) {
                $scope.notifyMessaging();
            });


        });
    }

    $scope.on_public_message = function(message) {

        if(message.firstElementChild.innerHTML == "GAMIFICATION UPDATE") {
            console.log("updating activities");
            updateAllActivities();

            if($location.$$path != '/tab/activities') {
                console.log(true)
                $scope.activityBadgeValue = $scope.activityBadgeValue + 1;
            }
        }

        return true;
    };

    $scope.notifyMessaging = function() {
        $scope.connection.send($msg({to: $scope.room+ "@conference."+$scope.domain, type: "groupchat"}).c('body').t('GAMIFICATION UPDATE'));
    };

    function getAllActivities() {
        gamificationFactory.doGetURL('/activity?nocache='+gamificationUtilities.getRandomUUID()).then(function (response) {
            response[0].forEach(function(activity) {
                $scope.activities_all[activity.time] = activity
            });
            filterActivities();
        });
    };

    function filterActivities() {
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

    function updateAllActivities() {
        gamificationFactory.doGetURL('/newactivities?nocache='+gamificationUtilities.getRandomUUID()).then(function (response) {
            response[0].forEach(function(activity) {
                $scope.activities_all[activity.time] = activity
            });
            filterActivities();
        });
    };
    /* ** end XMPP business ** */

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

            if(response[0].classroom_id == null) {
                $scope.isStudentAssigned = true;
                $scope.retrieveClassrooms();
            }
            else {
                $scope.isStudentAssigned = false;
                enableMessaging();
            }
        });
    };

    $scope.logout = function() {
        gamificationFactory.doLogOut();
    };

    $scope.gotoAbout = function() {
        window.location.href = '/about.html';
    };

    $scope.joinClassroom = function() {
        if($scope.selectedClass != null) {
            gamificationFactory.doPutURL('/classroom/'+$scope.selectedClass+'/addstudent/'+$scope.userId).then(function (response) {
                $scope.isStudentAssigned = false;
                $scope.hasJustJoinedClassroom = true;
                enableMessaging();
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
    }
});