gamififcationApp.controller('BlogsCtrl', function($scope, $ionicModal, $ionicPopup, $http, $q, gamificationFactory, gamificationUtilities) {

    $scope.blogGroups = null;
    $scope.groupStats = [];

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

    $scope.generateStats = function() {
        gamificationFactory.doGetURL('/queststats/'+$scope.classroomId+'?nocache='+gamificationUtilities.getRandomUUID()).then(function (response) {
            $scope.groupStats = response[0];
        });
    };

    $scope.getQuestProgress = function(quest) {
        var total = 0;
        for(var i=0; i<quest.levels.length; i++) {
            if(quest.levels[i].completed == 1) {
                total = total + (100/quest.levels.length);
            }
            else {
                for(var j=0; j<quest.levels[i].tasks.length; j++) {
                    if(quest.levels[i].tasks[j].completed == 1) {
                        total = total + (100/(quest.levels[i].tasks.length*quest.levels.length));
                    }
                }
            }
        }

        console.log('--> total: '+total);
        return total.toFixed(2);
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
        //retrieveBlogs();
        $scope.generateStats();
    }
});

gamififcationApp.directive('myQueststat', function(gamificationUtilities) {
    return {
        restrict: 'AEC',
        transclude: false,
        scope: {
            currentQuest: '=item'
        },
        link: function(scope) {
            scope.pourcent = 0;
            scope.levelmax = "";

            if(scope.currentQuest.completed == 1) {
                scope.pourcent = 100;
                scope.levelmax = "       ";
            }
            else {
                scope.directiveSortedlevels = gamificationUtilities.sortArrayByKey(scope.currentQuest.levels, 'order');

                for(var i=0; i<scope.directiveSortedlevels.length; i++) {

                    if(scope.directiveSortedlevels[i].completed != 1) {
                        scope.levelmax = 'Level '+(parseInt(scope.directiveSortedlevels[i].order));

                        for(var j=0; j<scope.directiveSortedlevels[i].tasks.length; j++) {
                            if(scope.directiveSortedlevels[i].tasks[j].completed == 1) {
                                scope.pourcent = scope.pourcent + (100/(scope.directiveSortedlevels[i].tasks.length));
                            }
                        }
                        break;
                    }
                }
            }

        },
        templateUrl: 'templates/directive-queststat.html'
    };
});
