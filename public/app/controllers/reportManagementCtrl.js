angular.module('reportManagementController', ['reportServices'])

// Controller: report to control the management page and managing of report accounts
.controller('reportManagementCtrl', function(Report, $scope) {
    var app = this;

    app.loading = true; // Start loading icon on page load
    app.accessDenied = true; // Hide table while loading
    app.errorMsg = false; // Clear any error messages
    app.editReportAccess = false; // Clear access on load
    app.limit = 3; // Set a default limit to ng-repeat
    app.searchLimit = 0; // Set the default search page results limit to zero
    app.viewLoginBtn = false;

/*
    // Function: get all the reports from database
    function getReports() {
        // Runs function to get all the reports from database
        Report.getReports().then(function(data) {
            // Check if able to get data from database
            if (data.data.success) {
                // Check which permissions the logged in report has
                if (data.data.police_permission === 'main' || data.data.police_permission === 'station') {
                    app.police_reports = data.data.police_reports; // Assign reports from database to variable
                    app.loading = false; // Stop loading icon
                    app.accessDenied = false; // Show table
                    app.viewLoginBtn = false;
                    // Check if logged in report is an admin or moderator
                    if (data.data.police_permission === 'main') {
                        app.addWalkInAccess = false;
                        app.permissionAccess = true;
                        app.stationAccess = true;
                        app.mainAccess = true
                        app.viewAccess = true;
                        app.viewLoginBtn = false;
                    } else if (data.data.police_permission === 'station') {
                        app.addWalkInAccess = true;
                        app.editReportAccess = true; // Show edit button
                        app.permissionAccess = false;
                        app.viewAccess = false;
                        app.userAccess = true;
                        app.viewLoginBtn = false;
                        app.generateReportAccess = true;
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

    getReports(); // Invoke function to get reports from databases
*/

      function getFind(){
      Report.getFind().then(function(data){
         if (data.data.success) {
                // Check which permissions the logged in report has
                if (data.data.police_permission === 'main' || data.data.police_permission === 'station') {
                    app.police_reports = data.data.police_reports; // Assign reports from database to variable
                    app.loading = false; // Stop loading icon
                    app.accessDenied = false; // Show table
                    // Check if logged in report is an admin or moderator
                    if (data.data.police_permission === 'main') {
                      app.addWalkInAccess = false;
                      app.permissionAccess = true;
                      app.stationAccess = true;
                      app.mainAccess = true
                      app.viewAccess = true;
                    } else if (data.data.police_permission === 'station') {
                      app.addWalkInAccess = true;
                      app.editReportAccess = true; // Show edit button
                      app.permissionAccess = false;
                      app.viewAccess = false;
                      app.userAccess = true;
                      app.viewLoginBtn = false;
                      app.generateReportAccess = true;
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
    getFind();
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
.controller('editReportCtrl', function($scope, $routeParams, Report, $timeout) {
    var app = this;
    $scope.accidentTypeTab = 'active'; // Set the 'Accident Type' tab to the default active tab
    app.phase1 = true; // Set the 'Accident Type' tab to default view

    // Function: get the report that needs to be edited
    Report.getReport($routeParams.id).then(function(data) {
        // Check if the report's _id was found in database
        if (data.data.success) {
            $scope.newAccidentType = data.data.report.accident_type; // Display report's accident type in scope
            $scope.newAccidentCause = data.data.report.accident_cause; // Display report's accident cause in scope
            $scope.newCommitted = data.data.report.committed_at; // Display report's time and date in scope
            app.currentReport = data.data.report._id; // Get report's _id for update functions
        } else {
            app.errorMsg = data.data.message; // Set error message
            $scope.alert = 'alert alert-danger'; // Set class for message
        }
    });

    // Function: Set the accident type pill to active
    app.accidentTypePhase = function() {
      $scope.accidentTypeTab = 'active'; // Set accident Type class
      $scope.accidentCauseTab = 'default'; // CLear accident cause list to active
      $scope.committedAtTab = 'default'; // CLear committed at list to active
      app.phase1 = true; // Set accident Type tab to active
      app.phase2 = false; // Set accident cause tab to inactive
      app.phase3 = false; // Set thoroughfare tab to inactive
      app.errorMsg = false; // CLear error message
    };
    // Function: Set the accident cause pill to active
    app.accidentCausePhase = function() {
      $scope.accidentTypeTab = 'default'; // CLear accident type list to active
      $scope.accidentCauseTab = 'active'; // Set accident cause class
      $scope.committedAtTab = 'default'; // CLear committed at list to active
      app.phase1 = false; // Set accident Type tab to inactive
      app.phase2 = true; // Set accident cause tab to active
      app.phase3 = false; // Set committed at tab to inactive
      app.errorMsg = false; // CLear error message
    };
    // Function: Set the accident cause pill to active
    app.committedAtPhase = function() {
      $scope.accidentTypeTab = 'default'; // Clear accident type list to active
      $scope.accidentCauseTab = 'default'; // CLear accident cause list to active
      $scope.committedAtTab = 'active'; // Set committed at class
      app.phase1 = false; // Set accident Type tab to inactive
      app.phase2 = false; // Set accident cause tab to inactive
      app.phase3 = true; // Set committed at tab to active
      app.errorMsg = false; // CLear error message
    };
    // Function: Update the Accident Type
    app.updateAccidentType = function(newAccidentType, valid) {
        app.errorMsg = false; // Clear any error messages
        app.disabled = true; // Disable form while processing
        // Check if the Accident Type being submitted is valid
        if (valid) {
            var userObject = {}; // Create a report object to pass to function
            userObject._id = app.currentReport; // Get _id to search database
            userObject.accident_type = $scope.newAccidentType; // Set the new name to the report
            // Runs function to update the report's name
            Report.editReport(userObject).then(function(data) {
                // Check if able to edit the report's name
                if (data.data.success) {
                    $scope.alert = 'alert alert-success'; // Set class for message
                    app.successMsg = data.data.message; // Set success message
                    // Function: After two seconds, clear and re-enable
                    $timeout(function() {
                        app.accidentTypeForm.accident_type.$setPristine(); // Reset Accident Type form
                        app.accidentTypeForm.accident_type.$setUntouched(); // Reset Accident Type form
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
    // Function: Update the Accident Cause's name
    app.updateAccidentCause = function(newAccidentCause, valid) {
        app.errorMsg = false; // Clear any error messages
        app.disabled = true; // Disable form while processing
        // Check if the Accident Cause being submitted is valid
        if (valid) {
            var userObject = {}; // Create a report object to pass to function
            userObject._id = app.currentReport; // Get _id to search database
            userObject.accident_cause = $scope.newAccidentCause; // Set the new Accident Cause to the Accident Cause
            // Runs function to update the report's name
            Report.editReport(userObject).then(function(data) {
                // Check if able to edit the report's name
                if (data.data.success) {
                    $scope.alert = 'alert alert-success'; // Set class for message
                    app.successMsg = data.data.message; // Set success message
                    // Function: After two seconds, clear and re-enable
                    $timeout(function() {
                        app.accidentCauseForm.accident_cause.$setPristine(); // Reset Accident Cause form
                        app.accidentCauseForm.accident_cause.$setUntouched(); // Reset Accident Cause form
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
    // Function: Update the Accident Cause's name
    app.updateCommittedAt = function(newCommitted, valid) {
        app.errorMsg = false; // Clear any error messages
        app.disabled = true; // Disable form while processing
        // Check if the Accident Cause being submitted is valid
        if (valid) {
            var userObject = {}; // Create a report object to pass to function
            userObject._id = app.currentReport; // Get _id to search database
            userObject.committed_at = $scope.newCommitted; // Set the new time and date reported to the time and date reported
            // Runs function to update the time and date reported
            Report.editReport(userObject).then(function(data) {
                // Check if able to edit the time and date reported
                if (data.data.success) {
                    $scope.alert = 'alert alert-success'; // Set class for message
                    app.successMsg = data.data.message; // Set success message
                    // Function: After two seconds, clear and re-enable
                    $timeout(function() {
                        app.committedAtForm.committed_at.$setPristine(); // Reset time and date reported form
                        app.committedAtForm.committed_at.$setUntouched(); // Rese ttime and date reportedform
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
})
// Controller: Used to edit reports
.controller('editPeopleInvolvedCtrl', function($scope, $routeParams, Report, $timeout) {
    var app = this;
    $scope.nameTab = 'active'; // Set the 'name' tab to the default active tab
    app.phase1 = true; // Set the 'name' tab to default view
    // Function: get the people involved that needs to be edited
    Report.getPeopleInvolved($routeParams.id).then(function(data) {
        // Check if the people involve's _id was found in database
        if (data.data.success) {
            $scope.newPeopleInvolvedName = data.data.people.people_involved_name; // Display name in scope
            $scope.newPeopleInvolvedAge = data.data.people.people_involved_age; // Display age in scope
            $scope.newPeopleInvolvedGender = data.data.people.people_involved_gender; // Display gender in scope
            $scope.newPeopleInvolvedCitizenship = data.data.people.people_involved_citizenship; // Display citizenship in scope
            $scope.newPeopleInvolvedStatus = data.data.people.people_involved_status; // Display status in scope
            app.currentReport = data.data.people._id; // Get report's _id for update functions
        } else {
            app.errorMsg = data.data.message; // Set error message
            $scope.alert = 'alert alert-danger'; // Set class for message
        }
    });

    // Function: Set the accident type pill to active
    app.namePhase = function() {
      $scope.nameTab = 'active'; // Set name class
      $scope.ageTab = 'default'; // CLear age list to active
      $scope.genderTab = 'default'; // CLear gender list to active
      $scope.citizenshipTab = 'default'; // CLear citizenship list to active
      $scope.statusTab = 'default'; // CLear status list to active
      app.phase1 = true; // Set name tab to active
      app.phase2 = false; // Set age tab to inactive
      app.phase3 = false; // Set gender tab to inactive
      app.phase4 = false; // Set citizenship tab to inactive
      app.phase5 = false; // Set status tab to inactive
      app.errorMsg = false; // CLear error message
    };
    // Function: Set the accident type pill to active
    app.agePhase = function() {
      $scope.nameTab = 'default'; // CLear name list to active
      $scope.ageTab = 'active'; // Set age class
      $scope.genderTab = 'default'; // CLear gender list to active
      $scope.citizenshipTab = 'default'; // CLear citizenship list to active
      $scope.statusTab = 'default'; // CLear status list to active
      app.phase1 = false; // Set name tab to inactive
      app.phase2 = true; // Set age tab to active
      app.phase3 = false; // Set gender tab to inactive
      app.phase4 = false; // Set citizenship tab to inactive
      app.phase5 = false; // Set status tab to inactive
      app.errorMsg = false; // CLear error message
    };
    // Function: Set the accident type pill to active
    app.genderPhase = function() {
      $scope.nameTab = 'default'; // CLear name list to active
      $scope.ageTab = 'default'; // CLear age list to active
      $scope.genderTab = 'active'; // Set gender class
      $scope.citizenshipTab = 'default'; // CLear citizenship list to active
      $scope.statusTab = 'default'; // CLear status list to active
      app.phase1 = false; // Set name tab to inactive
      app.phase2 = false; // Set age tab to inactive
      app.phase3 = true; // Set gender tab to active
      app.phase4 = false; // Set citizenship tab to inactive
      app.phase5 = false; // Set status tab to inactive
      app.errorMsg = false; // CLear error message
    };
    // Function: Set the accident type pill to active
    app.citizenshipPhase = function() {
      $scope.nameTab = 'default'; // CLear name list to active
      $scope.ageTab = 'default'; // CLear age list to active
      $scope.genderTab = 'default'; // CLear gender list to active
      $scope.citizenshipTab = 'active'; //Set citizenship class
      $scope.statusTab = 'default'; // CLear status list to active
      app.phase1 = false; // Set name tab to inactive
      app.phase2 = false; // Set age tab to inactive
      app.phase3 = false; // Set gender tab to inactive
      app.phase4 = true; // Set citizenship tab to active
      app.phase5 = false; // Set status tab to inactive
      app.errorMsg = false; // CLear error message
    };
    // Function: Set the accident type pill to active
    app.statusPhase = function() {
      $scope.nameTab = 'default'; // Clear name list to active
      $scope.ageTab = 'default'; // CLear age list to active
      $scope.genderTab = 'default'; // CLear gender list to active
      $scope.citizenshipTab = 'default'; // CLear citizenship list to active
      $scope.statusTab = 'active'; // Set status class
      app.phase1 = false; // Set name tab to inactive
      app.phase2 = false; // Set age tab to inactive
      app.phase3 = false; // Set gender tab to inactive
      app.phase4 = false; // Set citizenship tab to inactive
      app.phase5 = true; // Set status tab to active
      app.errorMsg = false; // CLear error message
    };
    // Function: Update the name
    app.updateName = function(newPeopleInvolvedName, valid) {
        app.errorMsg = false; // Clear any error messages
        app.disabled = true; // Disable form while processing
        // Check if the Accident Type being submitted is valid
        if (valid) {
            var userObject = {}; // Create a people involve object to pass to function
            userObject._id = app.currentReport; // Get _id to search database
            userObject.people_involved_name = $scope.newPeopleInvolvedName; // Set the new name to the report
            // Runs function to update the name
            Report.editPeopleInvolved(userObject).then(function(data) {
                // Check if able to edit the name
                if (data.data.success) {
                    $scope.alert = 'alert alert-success'; // Set class for message
                    app.successMsg = data.data.message; // Set success message
                    // Function: After two seconds, clear and re-enable
                    $timeout(function() {
                        app.nameForm.people_involved_name.$setPristine(); // Reset Name form
                        app.nameForm.people_involved_name.$setUntouched(); // Reset Name form
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
    // Function: Update the Age
    app.updateAge = function(newPeopleInvolvedAge, valid) {
        app.errorMsg = false; // Clear any error messages
        app.disabled = true; // Disable form while processing
        // Check if the Accident Type being submitted is valid
        if (valid) {
            var userObject = {}; // Create a people involved object to pass to function
            userObject._id = app.currentReport; // Get _id to search database
            userObject.people_involved_age = $scope.newPeopleInvolvedAge; // Set the new age to the people involved
            // Runs function to update the age
            Report.editPeopleInvolved(userObject).then(function(data) {
                // Check if able to edit the age
                if (data.data.success) {
                    $scope.alert = 'alert alert-success'; // Set class for message
                    app.successMsg = data.data.message; // Set success message
                    // Function: After two seconds, clear and re-enable
                    $timeout(function() {
                        app.ageForm.people_involved_age.$setPristine(); // Reset Age form
                        app.ageForm.people_involved_age.$setUntouched(); // Reset Age form
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
    // Function: Update the Gender
    app.updateGender = function(newPeopleInvolvedGender, valid) {
        app.errorMsg = false; // Clear any error messages
        app.disabled = true; // Disable form while processing
        // Check if the Accident Type being submitted is valid
        if (valid) {
            var userObject = {}; // Create a report object to pass to function
            userObject._id = app.currentReport; // Get _id to search database
            userObject.people_involved_gender = $scope.newPeopleInvolvedGender; // Set the new name to the report
            // Runs function to update the gender
            Report.editPeopleInvolved(userObject).then(function(data) {
                // Check if able to edit the gender
                if (data.data.success) {
                    $scope.alert = 'alert alert-success'; // Set class for message
                    app.successMsg = data.data.message; // Set success message
                    // Function: After two seconds, clear and re-enable
                    $timeout(function() {
                        app.genderForm.people_involved_gender.$setPristine(); // Reset Gender form
                        app.genderForm.people_involved_gender.$setUntouched(); // Reset Gender form
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
    // Function: Update the Citizenship
    app.updateCitizenship = function(newPeopleInvolvedCitizenship, valid) {
        app.errorMsg = false; // Clear any error messages
        app.disabled = true; // Disable form while processing
        // Check if the Accident Type being submitted is valid
        if (valid) {
            var userObject = {}; // Create a report object to pass to function
            userObject._id = app.currentReport; // Get _id to search database
            userObject.people_involved_citizenship = $scope.newPeopleInvolvedCitizenship; // Set the new name to the report
            // Runs function to update the citizenship
            Report.editPeopleInvolved(userObject).then(function(data) {
                // Check if able to edit the citizenship
                if (data.data.success) {
                    $scope.alert = 'alert alert-success'; // Set class for message
                    app.successMsg = data.data.message; // Set success message
                    // Function: After two seconds, clear and re-enable
                    $timeout(function() {
                        app.citizenshipForm.people_involved_citizenship.$setPristine(); // Reset citizenship form
                        app.citizenshipForm.people_involved_citizenship.$setUntouched(); // Reset citizenship form
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
    // Function: Update the status
    app.updateStatus = function(newPeopleInvolvedStatus, valid) {
        app.errorMsg = false; // Clear any error messages
        app.disabled = true; // Disable form while processing
        // Check if the Accident Type being submitted is valid
        if (valid) {
            var userObject = {}; // Create a report object to pass to function
            userObject._id = app.currentReport; // Get _id to search database
            userObject.people_involved_status = $scope.newPeopleInvolvedStatus; // Set the new status to the people involved
            // Runs function to update the status
            Report.editPeopleInvolved(userObject).then(function(data) {
                // Check if able to edit the status
                if (data.data.success) {
                    $scope.alert = 'alert alert-success'; // Set class for message
                    app.successMsg = data.data.message; // Set success message
                    // Function: After two seconds, clear and re-enable
                    $timeout(function() {
                        app.statusForm.people_involved_status.$setPristine(); // Reset status form
                        app.statusForm.people_involved_status.$setUntouched(); // Reset status form
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
