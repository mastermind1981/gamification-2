gamififcationApp.controller('BadgesCtrl', function($scope, gamificationFactory, gamificationUtilities, socket) {

    $scope.p1show = false;
    $scope.p2show = false;
    $scope.p3show = false;
    $scope.p4show = false;
    $scope.p5show = false;
    $scope.p6show = false;
    $scope.p7show = false;
    $scope.p8show = false;
    $scope.p9show = false;
    $scope.p10show = false;
    $scope.p11show = false;
    $scope.p12show = false;
    $scope.p13show = false;
    $scope.p14show = false;

    $scope.badge7Count = 0;
    $scope.badge8Count = 0;
    $scope.badge9Count = 0;
    $scope.badge10Count = 0;
    $scope.badge11Count = 0;
    $scope.badge12Count = 0;
    $scope.badge13Count = 0;
    $scope.badge14Count = 0;

    $scope.g1show = false;
    $scope.g2show = false;
    $scope.g3show = false;
    $scope.g4show = false;
    $scope.g5show = false;
    $scope.g6show = false;
    $scope.g7show = false;
    $scope.g8show = false;
    $scope.g9show = false;
    $scope.g10show = false;
    $scope.g11show = false;
    $scope.g12show = false;

    var p1 = "53fc27c9ea9dd81153000001";
    var p2 = "53fc2884ea9dd86bfd000002";
    var p3 = "53fc28b0ea9dd854d7000003";
    var p4 = "53fc28d2ea9dd850f8000004";
    var p5 = "53fc28f9ea9dd87a31000005";
    var p6 = "53fc2979ea9dd85f26000006";

    var p7 = "53fc2a62ea9dd80ab2000007";
    var p8 = "53fc2a92ea9dd8ccd4000008";
    var p9 = "53fc2ad4ea9dd8a288000009";
    var p10 = "53fc2b01ea9dd8ed2500000a";
    var p11 = "53fc2b3bea9dd8ef1e00000b";
    var p12 = "53fc2b73ea9dd8624600000c";
    var p13 = "53fc2badea9dd818d900000d";
    var p14 = "53fc2bdbea9dd829cd00000e";

    var g1 = "53fc2d3cea9dd81ba100000f";
    var g2 = "53fc2d5cea9dd888f7000010";
    var g3 = "53fc2d7aea9dd85f83000011";
    var g4 = "53fc2d98ea9dd8a52f000012";
    var g5 = "53fc2db7ea9dd874eb000013";

    var g6 = "53fc381dea9dd8ba24000014";
    var g7 = "53fc3842ea9dd8e1eb000015";
    var g8 = "53fc385aea9dd839b8000016";
    var g9 = "53fc38c9ea9dd8780900001a";
    var g10 = "53fc387fea9dd85825000017";
    var g11 = "53fc3897ea9dd8fc47000018";
    var g12 = "53fc38aeea9dd85ab1000019";

    socket.on('notify', function (data) {
        switch(data.message) {
            case "GAMIFICATION_BADGE":
                console.log("--> updating badges");
                $scope.scanbadges();
                break;
        }

    });


    $scope.scanbadges = function() {
        console.log('--> scanning badges ... ');

        /*
         function to get the group badges
         */
        gamificationFactory.doGetURL('/group/'+$scope.groupId+'?nocache='+gamificationUtilities.getRandomUUID()).then(function (response) {
            $scope.badgesGroup = response[0].badges;

            for(var i=0; i < response[0].students.length; i++) {

                if((response[0].students[i])._id == $scope.userId) {
                    $scope.badgesStudent = (response[0].students[i]).badges;
                    break;
                }
            }

            console.log('--> update from server received ... ');

            toggleBadges($scope.badgesGroup, $scope.badgesStudent);
        });
    };

    function toggleBadges(gBadges, sBadges) {

        for(var i=0; i<gBadges.length; i++) {

            console.log('--> group badge: '+gBadges[i]);

            switch(gBadges[i].origin._id) {

                case g1:
                    $scope.g1show = true;
                    break;

                case g2:
                    $scope.g2show = true;
                    break;

                case g3:
                    $scope.g3show = true;
                    break;

                case g4:
                    $scope.g4show = true;
                    break;

                case g5:
                    $scope.g5show = true;
                    break;

                case g6:
                    $scope.g6show = true;
                    break;

                case g7:
                    $scope.g7show = true;
                    break;

                case g8:
                    $scope.g8show = true;
                    break;

                case g9:
                    $scope.g9show = true;
                    break;

                case g10:
                    $scope.g10show = true;
                    break;

                case g11:
                    $scope.g11show = true;
                    break;

                case g12:
                    $scope.g12show = true;
                    break;
            }

        }

        for(var j=0; j<sBadges.length; j++) {

            console.log('--> student badge: '+sBadges[j]);

            switch(sBadges[j].origin._id) {

                case p1:
                    $scope.p1show = true;
                    break;

                case p2:
                    $scope.p2show = true;
                    break;

                case p3:
                    $scope.p3show = true;
                    break;

                case p4:
                    $scope.p4show = true;
                    break;

                case p5:
                    $scope.p5show = true;
                    break;

                case p6:
                    $scope.p6show = true;
                    break;

                case p7:
                    $scope.p7show = true;
                    $scope.badge7Count = sBadges[j].count;
                    break;

                case p8:
                    $scope.p8show = true;
                    $scope.badge8Count = sBadges[j].count;
                    break;

                case p9:
                    $scope.p9show = true;
                    $scope.badge9Count = sBadges[j].count;
                    break;

                case p10:
                    $scope.p10show = true;
                    $scope.badge10Count = sBadges[j].count;
                    break;

                case p11:
                    $scope.p11show = true;
                    $scope.badge11Count = sBadges[j].count;
                    break;

                case p12:
                    $scope.p12show = true;
                    $scope.badge12Count = sBadges[j].count;
                    break;

                case p13:
                    $scope.p13show = true;
                    $scope.badge13Count = sBadges[j].count;
                    break;

                case p14:
                    $scope.p14show = true;
                    $scope.badge14Count = sBadges[j].count;
                    break;
            }
        }


    }


    if ($scope.userId == null) {
        $scope.initIndexView();
    }
    else {
        $scope.reinitBadgeReadCounter();
        $scope.scanbadges();
    }
});

