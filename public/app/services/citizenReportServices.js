angular.module('citizenReportServices', [])

.factory('Citizen_Report', function($http) {
    var citizenReportFactory = {}; // Create the reportFactory object

    // Get all the citizen report from database
    citizenReportFactory.getCitizenReports = function() {
        return $http.get('/api/citizenReportManagement/');
    };
    // Get citizen report to then edit
    citizenReportFactory.getCitizenReport = function(id) {
        return $http.get('/api/editCitizenReport/' + id);
    };
    // Edit a citizen report
    citizenReportFactory.editCitizenReport = function(id) {
        return $http.put('/api/editCitizenReport', id);
    };

      return citizenReportFactory; // Return reportFactory object
  });
