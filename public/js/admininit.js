var gamificationAdminApp = angular.module('gamificationAdminApp', ['ionic', 'ngCookies'])

   .config(function($stateProvider, $urlRouterProvider) {

            $stateProvider

                // setup an abstract state for the tabs directive
                .state('tab', {
                    url: "/tab",
                    abstract: true,
                    templateUrl: "templates/admintabs.html"
                })

                // Each tab has its own nav history stack:
                .state('tab.groups', {
                    url: '/groups',
                    views: {
                        'tab-groups': {
                            templateUrl: 'templates/admin-groups.html',
                            controller: 'adminGroupCtrl'
                        }
                    }
                })

                // Each tab has its own nav history stack:
                .state('tab.quests', {
                    url: '/quests',
                    views: {
                        'tab-quests': {
                            templateUrl: 'templates/admin-quests.html',
                            controller: 'adminQuestCtrl'
                        }
                    }
                })

                .state('tab.quests1', {
                    url: '/quests1',
                    views: {
                        'tab-quests': {
                            templateUrl: 'templates/admin-quests1.html',
                            controller: 'adminQuest1Ctrl'
                        }
                    }
                })

                .state('tab.quests2', {
                    url: '/quests2',
                    views: {
                        'tab-quests': {
                            templateUrl: 'templates/admin-quests2.html',
                            controller: 'adminQuest2Ctrl'
                        }
                    }
                })

                // Each tab has its own nav history stack:
                .state('tab.badges', {
                    url: '/badges',
                    views: {
                        'tab-quests': {
                            templateUrl: 'templates/admin-badges.html',
                            controller: 'adminBadgesCtrl'
                        }
                    }
                })

            // if none of the above states are matched, use this as the fallback
            $urlRouterProvider.otherwise('/tab/groups');

        });


