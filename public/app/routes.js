var app = angular.module('appRoutes', ['ngRoute'])
// Configure Routes; 'authenticated = true' means the user must be logged in to access the route
.config(function($routeProvider, $locationProvider) {

    // AngularJS Route Handler
    $routeProvider

    // Route: Home
        .when('/', {
        templateUrl: 'app/views/pages/home.html',
        authenticated: false
    })

    // Route: About Us (for testing purposes)
    .when('/about', {
        templateUrl: 'app/views/pages/about.html'
    })

    // Route: User Registration
    .when('/register', {
        templateUrl: 'app/views/pages/users/register.html',
        controller: 'regCtrl',
        controllerAs: 'register',
        authenticated: true
    })

    // Route: User Login
    .when('/login', {
        templateUrl: 'app/views/pages/users/login.html',
        authenticated: false
    })

    // Route: User Profile
    .when('/profile', {
        templateUrl: 'app/views/pages/users/profile.html',
        authenticated: true
    })
    // Route: Send Username to E-mail
    .when('/resetusername', {
        templateUrl: 'app/views/pages/users/reset/username.html',
        controller: 'usernameCtrl',
        controllerAs: 'username',
        authenticated: true
    })

    // Route: Send Password Reset Link to User's E-mail
    .when('/resetpassword', {
        templateUrl: 'app/views/pages/users/reset/password.html',
        controller: 'passwordCtrl',
        controllerAs: 'password',
        authenticated: true
    })

    // Route: User Enter New Password & Confirm
    .when('/reset/:token', {
        templateUrl: 'app/views/pages/users/reset/newpassword.html',
        controller: 'resetCtrl',
        controllerAs: 'reset',
        authenticated: false
    })

    // Route: Manage User Accounts
    .when('/management', {
        templateUrl: 'app/views/pages/management/management.html',
        controller: 'managementCtrl',
        controllerAs: 'management',
        authenticated: true,
        police_permission: ['main', 'station']
    })

    // Route: Edit a User
    .when('/edit/:id', {
        templateUrl: 'app/views/pages/management/edit.html',
        controller: 'editCtrl',
        controllerAs: 'edit',
        authenticated: true,
        police_permission: ['main', 'station']
    })
    // Route: User Registration
    .when('/reportManagement', {
        templateUrl: 'app/views/pages/report/reportManagement.html',
        controller: 'reportManagementCtrl',
        controllerAs: 'reportManagement',
        authenticated: true
    })
    // Route: User Registration
    .when('/citizenReportManagement', {
        templateUrl: 'app/views/pages/report/citizenReportManagement.html',
        controller: 'citizenReportManagementCtrl',
        controllerAs: 'citizenReportManagement',
        authenticated: true
    })
    // Route: User Registration
    .when('/dashboard', {
        templateUrl: 'app/views/pages/dashboard.html',
        controller: 'reportManagementCtrl',
        controllerAs: 'reportManagement',
        authenticated: true
    })
    // Route: Edit a User
    .when('/editReport/:id', {
        templateUrl: 'app/views/pages/report/editReport.html',
        controller: 'editReportCtrl',
        controllerAs: 'editReport',
        authenticated: true,
        police_permission: ['main', 'station']
    })
    // Route: Edit a People Involve
    .when('/editPeopleInvolved/:id', {
        templateUrl: 'app/views/pages/report/editPeopleInvolved.html',
        controller: 'editPeopleInvolvedCtrl',
        controllerAs: 'editPeopleInvolved',
        authenticated: true,
        police_permission: ['main', 'station']
    })
    // Route: Edit a User
    .when('/editCitizenReport/:id', {
        templateUrl: 'app/views/pages/report/editCitizenReport.html',
        controller: 'editCitizenReportCtrl',
        controllerAs: 'editCitizenReport',
        authenticated: true,
        police_permission: ['main', 'station']
    })
    .otherwise({ redirectTo: '/' }); // If user tries to access any other route, redirect to home page

    $locationProvider.html5Mode({ enabled: true, requireBase: false }); // Required to remove AngularJS hash from URL (no base is required in index file)
});

// Run a check on each route to see if user is logged in or not (depending on if it is specified in the individual route)
app.run(['$rootScope', 'Auth', '$location', 'User', function($rootScope, Auth, $location, User) {

    // Check each time route changes
    $rootScope.$on('$routeChangeStart', function(event, next, current) {

        // Only perform if user visited a route listed above
        if (next.$$route !== undefined) {
            // Check if authentication is required on route
            if (next.$$route.authenticated === true) {
                // Check if authentication is required, then if permission is required
                if (!Auth.isLoggedIn()) {
                    event.preventDefault(); // If not logged in, prevent accessing route
                    $location.path('/'); // Redirect to home instead
                } else if (next.$$route.police_permission) {
                    // Function: Get current user's permission to see if authorized on route
                    User.getPermission().then(function(data) {
                        // Check if user's permission matches at least one in the array
                        if (next.$$route.police_permission[0] !== data.data.police_permission) {
                            if (next.$$route.police_permission[1] !== data.data.police_permission) {
                                event.preventDefault(); // If at least one role does not match, prevent accessing route
                                $location.path('/dashboard'); // Redirect to dashboard instead
                            }
                        }
                    });
                }
            } else if (next.$$route.authenticated === false) {
                // If authentication is not required, make sure is not logged in
                if (Auth.isLoggedIn()) {
                    event.preventDefault(); // If user is logged in, prevent accessing route
                    $location.path('/dashboard'); // Redirect to profile instead
                }
            }
        }
    });
}]);
