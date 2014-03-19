gamififcationApp.controller('adminCtrl', function($scope, $http, $q, gamificationFactory, $location) {

    $scope.classrooms = [];
    $scope.selectedClassGroups = [];
    $scope.students = [];

    initView();

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

    function initView() {
        gamificationFactory.doGetURL('/classroom').then(function (response) {
            $scope.classrooms = response[0];
            $scope.changeClassroom(0);
        });
    };

    $scope.changeClassroom = function(ind) {
        $scope.selectedClassGroups = ($scope.classrooms[ind].groups).sort(sortByProperty('label'));
        $scope.students = ($scope.classrooms[ind].students).sort(sortByProperty('lastName'));
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
});