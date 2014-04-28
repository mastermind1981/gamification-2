var gamififcationApp = angular.module('gamififcationApp', ['ionic'])

   .config(function($stateProvider, $urlRouterProvider) {

            $stateProvider

                // setup an abstract state for the tabs directive
                .state('tab', {
                    url: "/tab",
                    abstract: true,
                    templateUrl: "templates/tabs.html"
                })

                // Each tab has its own nav history stack:
                .state('tab.blank', {
                    url: '/blank',
                    views: {
                        'tab-blogs': {
                            templateUrl: 'templates/tab-blank.html',
                            controller: 'BlankCtrl'
                        }
                    }
                })

                .state('tab.activities', {
                    url: '/activities',
                    views: {
                        'tab-activities': {
                            templateUrl: 'templates/tab-activities.html',
                            controller: 'ActivitiesCtrl'
                        }
                    }
                })

                .state('tab.quests', {
                    url: '/quests',
                    views: {
                        'tab-quests': {
                            templateUrl: 'templates/tab-quests.html',
                            controller: 'QuestsCtrl'
                        }
                    }
                })

                .state('tab.quests1', {
                    url: '/quests1',
                    views: {
                        'tab-quests': {
                            templateUrl: 'templates/tab-quests1.html',
                            controller: 'Quests1Ctrl'
                        }
                    }
                })

                .state('tab.quests2', {
                    url: '/quests2',
                    views: {
                        'tab-quests': {
                            templateUrl: 'templates/tab-quests2.html',
                            controller: 'Quests2Ctrl'
                        }
                    }
                })

                .state('tab.checkins', {
                    url: '/checkins',
                    views: {
                        'tab-checkins': {
                            templateUrl: 'templates/tab-checkins.html',
                            controller: 'CheckinsCtrl'
                        }
                    }
                })

                .state('tab.badges', {
                    url: '/badges',
                    views: {
                        'tab-badges': {
                            templateUrl: 'templates/tab-badges.html',
                            controller: 'BadgesCtrl'
                        }
                    }
                })

                .state('tab.blogs', {
                    url: '/blogs',
                    views: {
                        'tab-blogs': {
                            templateUrl: 'templates/tab-blogs.html',
                            controller: 'BlogsCtrl'
                        }
                    }
                })

                .state('tab.userjoin', {
                    url: '/userjoin',
                    views: {
                        'tab-blogs': {
                            templateUrl: 'templates/tab-userjoin.html'
                        }
                    }
                })



            // if none of the above states are matched, use this as the fallback
            $urlRouterProvider.otherwise('/tab/blank');

        });


document.documentElement.requestFullscreen();