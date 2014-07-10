gamificationAdminApp.controller('adminBadgesCtrl', function($scope, $http, $q, gamificationAdminFactory, $location, gamificationAdminUtilities, $cookieStore, $ionicPopup, socket) {

    $scope.classrooms = [];
    $scope.allbadges = [];
    $scope.classroombadges = [];
    $scope.selectedClassGroups = [];
    $scope.students = [];
    $scope.lastKnownIndex = 0;
    $scope.deliverObject = {};
    $scope.readyForDelivering = true;

    $scope.notif = function() {
        socket.emit('notif');
        socket.emit('badge');
    };

    function sortByProperty(property) {
        'use strict';
        return function (a, b) {
            var sortStatus = 0;
            if (a[property] < b[property]) {
                sortStatus = -1;
            } else if (a[property] > b[property]) {
                sortStatus = 1;
            }

            return sortStatus;
        };
    };

    $scope.initBadgeView = function() {
        console.log('badge initialized');

        gamificationAdminFactory.doGetURL('/teacherbadge').then(function (response) {
            $scope.allbadges = response[0];

            gamificationAdminFactory.doGetURL('/classroom').then(function (response) {
                $scope.classrooms = response[0];

                if($scope.classrooms.length > 0) {
                    $scope.changeClassroom($scope.lastKnownIndex);
                }
            });
        });
    };

    $scope.changeClassroom = function(ind) {

        if(ind == $scope.lastKnownIndex) {
            $scope.classrooms[ind].active = true;

            gamificationAdminFactory.doGetURL('/classroom/'+$scope.classrooms[ind]._id).then(function (response) {
                $scope.selectedClassGroups = (response[0].groups).sort(sortByProperty('label'));
                $scope.students = (response[0].students).sort(sortByProperty('lastName'));

                $scope.classroombadges = [];
                for(var i=0; i < (response[0].teacherbadge).length; i++) {
                    for(var j=0; j < $scope.allbadges.length; j++) {
                        if($scope.allbadges[j]._id == (response[0].teacherbadge)[i]) {
                            $scope.classroombadges.push($scope.allbadges[j]);
                        }
                    }
                }
            });

        }
        else {
            $scope.lastKnownIndex = ind;
            $scope.initView();
        }
    };

    $scope.getGroupSelectedStatus = function(student, group) {
       if(student.group_id == group._id) {
           return group.label;
       }
       else {
           return "";
       }
    };

    $scope.selectChange = function(ind, bid) {
        if($scope.readyForDelivering) {
            $scope.deliverObject = {};
            $scope.deliverObject.uid = ind;
            $scope.deliverObject.bid = bid;
        }
    };

    $scope.deliverBadge = function(badge) {
        if($scope.deliverObject.bid == badge._id) {
            $scope.readyForDelivering = false;
            gamificationAdminFactory.doPutURL('/student/'+$scope.deliverObject.uid+'/addbadge/'+badge._id+'?nocache='+gamificationAdminUtilities.getRandomUUID(), null).then(function (response) {
                var data = {};
                data.studentId = response[0].facebookId;
                data.label = "Badge: "+badge.label;
                data.type = "STUDENT";
                data.groupId = response[0].group_id;
                data.classroomId = response[0].classroom_id;

                gamificationAdminFactory.doPostURL('/activity?nocache='+gamificationAdminUtilities.getRandomUUID()).then(function(postactresponse) {

                    gamificationAdminFactory.doPutURL('/activity/'+postactresponse[0]._id+'?nocache='+gamificationAdminUtilities.getRandomUUID(), data).then(function (response) {
                        $scope.notif();
                    });
                });

                $scope.showMessageOKAlert(response[0].lastName, response[0].firstName);
            });
        }
    };

    $scope.showMessageOKAlert = function(ln, fn) {
        $ionicPopup.alert({
            title: 'Badge delivery OK',
            content: 'The badge has been delivered to '+ln+' '+fn
        }).then(function(res) {
            $scope.deliverObject = {};
            $scope.readyForDelivering = true;
        });
    };

    $scope.checkSelectedTab = function(tabIndex) {
        $scope.changeClassroom(tabIndex);
    };

    $scope.addNewClassroom = function() {
        gamificationAdminFactory.doPostURL('/classroom').then(function (response) {
            if(response[1] == 200) {
                gamificationAdminFactory.doPutURL('/classroom/'+response[0]._id, {label: (gamificationAdminUtilities.getRandomUUID()).substr(0, 10)}).then(function (response) {
                    if(response[1] == 200) {
                        $scope.initView();
                    }
                    else {
                        //something wrong happened when updating the label of a classroom. Do what?
                    }
                });
            }
            else {
                //something wrong happened when creating a classroom. Do what?
            }
        });
    };

    $scope.whatClassIsIt = function(cls, ind) {
        if(ind == $scope.lastKnownIndex) {
            return "button active";
        }
        else {
            return "button";
        }
    };

    $scope.initBadgeView();
});