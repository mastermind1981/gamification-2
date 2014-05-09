gamififcationApp.controller('adminCtrl', function($scope, $http, $q, gamificationFactory, $location, gamificationUtilities, $cookieStore) {

    $scope.classrooms = [];
    $scope.selectedClassGroups = [];
    $scope.students = [];
    $scope.lastKnownIndex = 0;

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

    $scope.initView = function() {
        gamificationFactory.doGetURL('/classroom').then(function (response) {
            $scope.classrooms = response[0];

            if($scope.classrooms.length > 0) {
                $scope.changeClassroom($scope.lastKnownIndex);
            }
        });
    };

    $scope.changeClassroom = function(ind) {

        if(ind == $scope.lastKnownIndex) {
            $scope.classrooms[ind].active = true;

            gamificationFactory.doGetURL('/classroom/'+$scope.classrooms[ind]._id).then(function (response) {
                $scope.selectedClassGroups = (response[0].groups).sort(sortByProperty('label'));
                $scope.students = (response[0].students).sort(sortByProperty('lastName'));
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

    $scope.selectChange = function(student, grpInd) {
        gamificationFactory.doPutURL('/group/'+$scope.selectedClassGroups[grpInd]._id+'/addstudent/'+student._id).then(function (response) {
            console.log(response[0]);
        });

    };

    $scope.checkSelectedTab = function(tabIndex) {
        $scope.changeClassroom(tabIndex);
    };

    $scope.addNewClassroom = function() {
        gamificationFactory.doPostURL('/classroom').then(function (response) {
            if(response[1] == 200) {
                gamificationFactory.doPutURL('/classroom/'+response[0]._id, {label: (gamificationUtilities.getRandomUUID()).substr(0, 10)}).then(function (response) {
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

    $scope.initView();
});