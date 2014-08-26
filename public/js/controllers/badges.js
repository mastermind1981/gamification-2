gamififcationApp.controller('BadgesCtrl', function($scope, gamificationFactory, gamificationUtilities) {

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

    $scope.badge1Count = 0;
    $scope.badge2Count = 0;
    $scope.badge3Count = 0;
    $scope.badge4Count = 0;
    $scope.badge5Count = 0;
    $scope.badge6Count = 0;
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
    $scope.g13show = false;
    $scope.g14show = false;

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
        });
    };


    if ($scope.userId == null) {
        $scope.initIndexView();
    }
    else {
        $scope.reinitBadgeReadCounter();
        $scope.scanbadges();
    }
});

