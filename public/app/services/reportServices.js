angular.module('reportServices', [])

.factory('Report', function($http) {
    var reportFactory = {}; // Create the reportFactory object

    // Get all the report from database
    reportFactory.getReports = function() {
        return $http.get('/api/reportManagement/');
    };
    reportFactory.getFind = function(){
        return $http.get('/api/findReport/');
    };
    // Get police report to then edit
    reportFactory.getReport = function(id) {
        return $http.get('/api/editReport/' + id);
    };
    // Edit a police report
    reportFactory.editReport = function(id) {
        return $http.put('/api/editReport', id);
    };
    // Get police report to then edit
    reportFactory.getPeopleInvolved = function(id) {
        return $http.get('/api/editPeopleInvolved/' + id);
    };
    // Edit a police report
    reportFactory.editPeopleInvolved = function(id) {
        return $http.put('/api/editPeopleInvolved', id);
    };

      return reportFactory; // Return reportFactory object
  });
