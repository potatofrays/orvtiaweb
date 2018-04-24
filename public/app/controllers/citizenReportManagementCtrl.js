angular.module('citizenReportManagementController', ['citizenReportServices'])

// Controller: report to control the management page and managing of report accounts
.controller('citizenReportManagementCtrl', function(Citizen_Report, $scope) {
    var app = this;

    app.loading = true; // Start loading icon on page load
    app.accessDenied = true; // Hide table while loading
    app.errorMsg = false; // Clear any error messages
    app.editCitizenReportAccess = false; // Clear access on load
    app.limit = 3; // Set a default limit to ng-repeat
    app.searchLimit = 0; // Set the default search page results limit to zero

    // Function: get all the reports from database
    function getCitizenReports() {
        // Runs function to get all the reports from database
        Citizen_Report.getCitizenReports().then(function(data) {
            // Check if able to get data from database
            if (data.data.success) {
                // Check which permissions the logged in report has
                if (data.data.police_permission === 'main' || data.data.police_permission === 'station') {
                    app.citizen_reports = data.data.citizen_reports; // Assign reports from database to variable
                    app.loading = false; // Stop loading icon
                    app.accessDenied = false; // Show table
                    // Check if logged in report is an admin or moderator
                    if (data.data.police_permission === 'main') {
                        app.viewAccess = true;
                    } else if (data.data.police_permission === 'station') {;
                    }
                } else {
                    app.errorMsg = 'Insufficient Permissions'; // Reject edit and delete options
                    app.loading = false; // Stop loading icon
                }
            } else {
                app.errorMsg = data.data.message; // Set error message
                app.loading = false; // Stop loading icon
            }
        });
    }

    getCitizenReports(); // Invoke function to get reports from databases

    // Function: Show more results on page
    app.showMore = function(number) {
        app.showMoreError = false; // Clear error message
        // Run functio only if a valid number above zero
        if (number > 0) {
            app.limit = number; // Change ng-repeat filter to number requested by report
        } else {
            app.showMoreError = 'Please enter a valid number'; // Return error if number not valid
        }
    };

    // Function: Show all results on page
    app.showAll = function() {
        app.limit = undefined; // Clear ng-repeat limit
        app.showMoreError = false; // Clear error message
    };


    // Function: Perform a basic search function
    app.search = function(searchKeyword, number) {
        // Check if a search keyword was provided
        if (searchKeyword) {
            // Check if the search keyword actually exists
            if (searchKeyword.length > 0) {
                app.limit = 0; // Reset the limit number while processing
                $scope.searchFilter = searchKeyword; // Set the search filter to the word provided by the report
                app.limit = number; // Set the number displayed to the number entered by the report
            } else {
                $scope.searchFilter = undefined; // Remove any keywords from filter
                app.limit = 0; // Reset search limit
            }
        } else {
            $scope.searchFilter = undefined; // Reset search limit
            app.limit = 0; // Set search limit to zero
        }
    };

    // Function: Clear all fields
    app.clear = function() {
        $scope.number = 'Clear'; // Set the filter box to 'Clear'
        app.limit = 0; // Clear all results
        $scope.searchKeyword = undefined; // Clear the search word
        $scope.searchFilter = undefined; // Clear the search filter
        app.showMoreError = false; // Clear any errors
    };

})

// Controller: Used to edit reports
.controller('editCitizenReportCtrl', function($scope, $routeParams, Citizen_Report, $timeout) {
    var app = this;
    $scope.reportCredibilityTab = 'active'; // Set the 'Accident Type' tab to the default active tab
    app.phase1 = true; // Set the 'Accident Type' tab to default view

    // Function: get the report that needs to be edited
    Citizen_Report.getCitizenReport($routeParams.id).then(function(data) {
        // Check if the report's _id was found in database
        if (data.data.success) {
            $scope.newReportCredibility = data.data.report.citizen_report_credibility; // Display report's choices in scope
            app.currentReport = data.data.report._id; // Get report's _id for update functions
        } else {
            app.errorMsg = data.data.message; // Set error message
            $scope.alert = 'alert alert-danger'; // Set class for message
        }
    });

    // Function: Set the Report Credibility pill to active
    app.reportCredibilityPhase = function() {
      $scope.reportCredibilityTab = 'active'; // Set Report Credibility class
      app.phase1 = true; // Set Report Credibility to inactive
      app.errorMsg = false; // CLear error message
    };
    app.updateReportCredibility = function(newReportCredibility, valid) {
        app.errorMsg = false; // Clear any error messages
        app.disabled = true; // Disable form while processing
        // Check if the Report Credibility being submitted is valid
        if (valid) {
            var userObject = {}; // Create a report object to pass to function
            userObject._id = app.currentReport; // Get _id to search database
            userObject.citizen_report_credibility = $scope.newReportCredibility; // Set the report credibilty to the report
            // Runs function to update the report's name
            Citizen_Report.editCitizenReport(userObject).then(function(data) {
                // Check if able to edit the report's name
                if (data.data.success) {
                    $scope.alert = 'alert alert-success'; // Set class for message
                    app.successMsg = data.data.message; // Set success message
                    // Function: After two seconds, clear and re-enable
                    $timeout(function() {
                        app.reportCredibilityForm.citizen_report_credibility.$setPristine(); // Reset Accident Type form
                        app.reportCredibilityForm.citizen_report_credibility.$setUntouched(); // Reset Accident Type form
                        app.successMsg = false; // Clear success message
                        app.disabled = false; // Enable form for editing
                    }, 2000);
                } else {
                    $scope.alert = 'alert alert-danger'; // Set class for message
                    app.errorMsg = data.data.message; // Clear any error messages
                    app.disabled = false; // Enable form for editing
                }
            });
        } else {
            $scope.alert = 'alert alert-danger'; // Set class for message
            app.errorMsg = 'Please ensure form is filled out properly'; // Set error message
            app.disabled = false; // Enable form for editing
        }
    };
});
