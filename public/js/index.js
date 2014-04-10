gamififcationApp.controller('navigationCtrl', function($scope, $http, $q, gamificationFactory, $location) {

    $scope.username = "";
    $scope.userId = "";
    $scope.facebookId = "";
    $scope.avatarUrl = "";
    $scope.isStudentAssigned = false;
    $scope.classrooms = [];
    $scope.classModel = "";
    $scope.selectedClass = null;
    $scope.currentNavigationTab = 0;
    $scope.navModel = 1;

    $scope.activities_all = [];

    $scope.domain = "intermedia-prod03.uio.no";
    $scope.connection = null;
    $scope.password = "gami";
    $scope.participants = null;
    $scope.room = "gamification";

    $scope.activePages =
        [   { name: 'blank.html', url: 'blank.html'},
            { name: 'activities.html', url: 'activities.html'},
            { name: 'quests.html', url: 'quests.html'},
            { name: 'checkins.html', url: 'checkins.html'},
            { name: 'badges.html', url: 'badges.html'},
            { name: 'blogs.html', url: 'blogs.html'} ];
    navigateToTab($scope.currentNavigationTab);

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

        navigateToTab(1);
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
    });

    $scope.on_presence = function(presence) {
        console.log(presence);
        $scope.joined = true;
        return true;
    };

    $scope.on_public_message = function(message) {
        console.log(message);

        $scope.$apply(function() {
            $scope.activities_all.push(message);
        });

        return true;
    };

    $scope.sendMessage = function() {

        if($scope.chatText != null) {
            $scope.connection.send($msg({to: $scope.room+ "@conference."+$scope.domain, type: "groupchat"}).c('body').t($scope.chatText));
        }
    };
    /* ** end XMPP business ** */

    initView();

    function navigateToTab(num) {
        $scope.currentNavigationTab = num;
        $scope.activePage = $scope.activePages[num];
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

    function initView() {
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
                enableMessaging();
            });
        }
    };

    $scope.pickClassroom = function(croom) {
        $scope.selectedClass = croom._id;
    };

    $scope.changeNavigationMenu = function(num) {
        if(num != null && num != $scope.currentNavigationTab) {
            navigateToTab(num);
        }
    };
});