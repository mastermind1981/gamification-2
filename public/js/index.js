gamififcationApp.controller('navigationCtrl', function($scope, $http, $q, gamificationFactory, $location) {

    $scope.username = "";
    $scope.userId = "";
    $scope.facebookId = "";
    $scope.avatarUrl = "";
    $scope.isStudentAssigned = false;
    $scope.classrooms = [];
    $scope.classModel = "";
    $scope.selectedClass = null;

    $scope.activePages =
        [   { name: 'blank.html', url: 'blank.html'},
            { name: 'activities.html', url: 'activities.html'},
            { name: 'quests.html', url: 'quests.html'} ];
    $scope.activePage = $scope.activePages[0];

    initView();

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
                $scope.activePage = $scope.activePages[1];
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
                $scope.activePage = $scope.activePages[1];
            });
        }
    };

    $scope.pickClassroom = function(croom) {
        $scope.selectedClass = croom._id;
    };
});