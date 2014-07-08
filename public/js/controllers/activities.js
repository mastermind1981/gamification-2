gamififcationApp.controller('ActivitiesCtrl', function($scope, $ionicModal, $ionicPopup, $http, $q, gamificationFactory, gamificationUtilities) {
    $scope.activityMenuModel = 0;
    $scope.activityBadgeValue = 0;

    $scope.getMessageAvatar = function(mess) {
        if(mess.ownerAvatar != null) {
         return mess.ownerAvatar
        }
        else {
            return "img/group.png";
        }
    };

    $scope.getFormattedLabel = function(lab) {
        switch(lab) {
            case 'JOINED_GAMIFICATION':
                return 'Joined gamification';
                break;
            case 'NEW_BADGE':
                return 'New badge';
                break;
            default:
                return lab;
        }
    };

    $scope.navigateToActivity = function(message) {
        if(message.label != 'JOINED_GAMIFICATION'  && message.url != null) {
            window.open(message.url,'_blank');
        }
    };

    if ($scope.userId == null) {
        $scope.initIndexView();
    }
});