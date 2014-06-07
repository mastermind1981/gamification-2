gamififcationApp.controller('BlogsCtrl', function($scope, $ionicModal, $ionicPopup, $http, $q, gamificationFactory, gamificationUtilities) {

    $scope.blogGroups = null;

    $scope.navigateToBlog = function(grp) {
        if(grp.blogUrl != null) {

            if(grp.blogUrl.substr(0, 4) != "http") {
                window.open("http://"+grp.blogUrl,'_blank');
            }
            else {
                window.open(grp.blogUrl,'_blank');
            }
        }

    };

    $scope.getStudentList = function(students) {
        studentList = "";

        for(var i in students){
            studentList = studentList + students[i].firstName + " | ";
        }

        return studentList.substr(0, studentList.length-3);
    };


    function retrieveBlogs() {

        gamificationFactory.doGetURL('/group/classroom/'+$scope.classroomId+'?nocache='+gamificationUtilities.getRandomUUID()).then(function (response) {
            $scope.blogGroups = response[0];
        });

    };

    if ($scope.userId == null) {
        $scope.initIndexView();
    }
    else {
        retrieveBlogs();
    }
});

