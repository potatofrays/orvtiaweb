angular.module('resetController', ['userServices'])
// Controller: usernameCtrl is used to send the user his/her username to e-mail if forgotten
.controller('usernameCtrl', function( User, $scope) {

    app = this;

    // Function to send username to e-mail provided
    app.sendUsername = function(userData, valid) {
        app.errorMsg = false; // Clear errorMsg when user submits
        app.loading = true; // Start loading icon while processing
        app.disabled = true; // Disable form while processing

        // Only perform function if form is valid
        if (valid) {
            // Runs function to send username to e-mail provided
            User.sendUsername(app.userData.police_email).then(function(data) {
                app.loading = false; // Stop loading icon
                // Check if username was sent successfully to e-mail
                if (data.data.success) {
                    $scope.alert = 'alert alert-success'; // Set success message class
                    app.successMsg = data.data.message; // If success, grab message from JSON object
                } else {
                    app.disabled = false; // Enable form to allow user to retry
                    $scope.alert = 'alert alert-danger'; // Set alert class
                    app.errorMsg = data.data.message; // If error, grab message from JSON object
                }
            });
        } else {
            app.disabled = false; // Enable form to allow user to retry
            app.loading = false; // Stop loading icon
            $scope.alert = 'alert alert-danger'; // Set alert class
            app.errorMsg = 'Please enter a valid e-mail'; // Let user know form is not valid
        }
    };
})

// Controller: passwordCtrl is used to send a password reset link to the user
.controller('passwordCtrl', function(User, $scope) {

    app = this;

    // Function to send reset link to e-mail associated with username
    app.sendPassword = function(resetData, valid) {
        app.errorMsg = false; // Clear errorMsg
        app.loading = true; // Start loading icon
        app.disabled = true; // Disable form while processing

        // Check if form is valid
        if (valid) {
            // Runs function to send reset link to e-mail associated with username
            User.sendPassword(app.resetData).then(function(data) {
                app.loading = false; // Stop loading icon
                // Check if reset link was sent
                if (data.data.success) {
                    $scope.alert = 'alert alert-success'; // Set success message class
                    app.successMsg = data.data.message; // Grab success message from JSON object
                } else {
                    $scope.alert = 'alert alert-danger'; // Set success message class
                    app.disabled = false; // Enable form to allow user to resubmit
                    app.errorMsg = data.data.message; // Grab error message from JSON object
                }
            });
        } else {
            app.disabled = false; // Enable form to allow user to resubmit
            app.loading = false; // Stop loading icon
            $scope.alert = 'alert alert-danger'; // Set success message class
            app.errorMsg = 'Please enter a valid username'; // Let user know form is not valid
        }
    };
})

// Controller resetCtrl is used to save change user's password
.controller('resetCtrl', function(User, $routeParams, $scope, $timeout, $location) {

    app = this;
    app.hide = true; // Hide form until token can be verified to be valid

    // Function to check if token is valid and get the user's info from database (runs on page load)
    User.resetUser($routeParams.token).then(function(data) {
        // Check if user was retrieved
        if (data.data.success) {
            app.hide = false; // Show form
            $scope.alert = 'alert alert-success'; // Set success message class
            app.successMsg = 'Please enter a new password'; // Let user know they can enter new password
            $scope.police_username = data.data.user.police_username; // Save username in scope for use in savePassword() function

        } else {
            $scope.alert = 'alert alert-danger'; // Set success message class
            app.errorMsg = data.data.message; // Grab error message from JSON object
        }
    });

    // Function to save user's new password to database
    app.savePassword = function(regData, valid, confirmed) {
        app.errorMsg = false; // Clear errorMsg when user submits
        app.successMsg = false;
        app.disabled = true; // Disable form while processing
        app.loading = true; // Enable loading icon

        // Check if form is valid and passwords match
        if (valid && confirmed) {
            app.regData.police_username = $scope.police_username; // Grab username from $scope

            // Run function to save user's new password to database
            User.savePassword(app.regData).then(function(data) {
                app.loading = false; // Stop loading icon
                // Check if password was saved to database
                if (data.data.success) {
                    $scope.alert = 'alert alert-success'; // Set success message class
                    app.successMsg = data.data.message; // Grab success message from JSON object and redirect
                    // Redirect to login page after 2000 milliseconds (2 seconds)
                    $timeout(function() {
                        $location.path('/management');
                    }, 2000);
                } else {
                    $scope.alert = 'alert alert-danger'; // Set success message class
                    app.disabled = false; // Enable form to allow user to resubmit
                    app.errorMsg = data.data.message; // Grab error message from JSON object
                }
            });
        } else {
            $scope.alert = 'alert alert-danger'; // Set success message class
            app.loading = false; // Stop loading icon
            app.disabled = false; // Enable form to allow user to resubmit
            app.errorMsg = 'Please ensure form is filled out properly'; // Let user know form is not valid
        }
    };
});
