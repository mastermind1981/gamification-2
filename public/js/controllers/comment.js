gamififcationApp.controller('CommentCtrl', function($scope, $ionicModal, $ionicPopup, $http, $q, gamificationFactory, gamificationUtilities) {

    $scope.postMessage = function() {
        var formValid = true;
        var messageObject = {};

        if($('#commActivitiesFeedTextarea').val() != "") {
            messageObject.label = $('#commActivitiesFeedTextarea').val();
        }
        else {
            formValid = false;
            $ionicPopup.alert({
                title: 'Pas de texte présent',
                content: "Veuillez écrire un message avant d'envoyer"
            });
        }

        if($('#commActivitiesFeedTextinput').val() != "") {

            var correctURL = $('#commActivitiesFeedTextinput').val();
            console.log("--> activity: old url: "+correctURL);
            if(correctURL.substr(0, 4) != "http") {
                correctURL = "http://" + correctURL;
                console.log("--> activity: new url: "+correctURL);
            }

            if(gamificationUtilities.checkValidURL(correctURL)) {
                messageObject.url = correctURL;
            }
            else {
                formValid = false;
                $ionicPopup.alert({
                    title: 'URL Format Error',
                    content: "Veuillez entrer une URL valide avant d'envoyer"
                });
            }

        }

        if(formValid) {
            gamificationFactory.doPostURL('/activity?nocache='+gamificationUtilities.getRandomUUID()).then(function(response) {
                var data = {};
                data.studentId = $scope.facebookId;
                data.label = messageObject.label;
                data.type = "STUDENT";
                data.url = messageObject.url;
                data.groupId = $scope.groupId;
                data.classroomId = $scope.classroomId;

                gamificationFactory.doPutURL('/activity/'+response[0]._id+'?nocache='+gamificationUtilities.getRandomUUID(), data).then(function (response) {
                    $scope.notif();
                    $scope.showMessageOKAlert();

                });
            });
        }

    };

    // An alert dialog
    $scope.showMessageOKAlert = function() {
        $ionicPopup.alert({
            title: 'Message OK',
            content: 'Votre message a été envoyé à votre class.'
        }).then(function(res) {
            $('#commActivitiesFeedTextarea').val('');
            $('#commActivitiesFeedTextinput').val('');
            $scope.changeMainTab(0);
        });
    };

    $ionicModal.fromTemplateUrl('modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
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

    if ($scope.userId == null) {
        $scope.initIndexView();
    }
});