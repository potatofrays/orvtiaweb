angular.module('userServices', [])

.factory('User', function($http) {
    var userFactory = {}; // Create the userFactory object

    // Register users in database
    userFactory.create = function(regData) {
        return $http.post('/api/police_users', regData);
    };

    // Check if username is available at registration
    userFactory.checkUsername = function(regData) {
        return $http.post('/api/checkusername', regData);
    };

    // Check if e-mail is available at registration
    userFactory.checkEmail = function(regData) {
        return $http.post('/api/checkemail', regData);
    };

    // Send user's username to e-mail
    userFactory.sendUsername = function(userData) {
        return $http.get('/api/resetusername/' + userData);
    };

    // Send password reset link to user's e-mail
    userFactory.sendPassword = function(resetData) {
        return $http.put('/api/resetpassword', resetData);
    };

    // Grab user's information from e-mail reset link
    userFactory.resetUser = function(token) {
        return $http.get('/api/resetpassword/' + token);
    };

    // Save user's new password
    userFactory.savePassword = function(regData) {
        return $http.put('/api/savepassword', regData);
    };

    // Provide the user with a new token
    userFactory.renewSession = function(police_username) {
        return $http.get('/api/renewToken/' + police_username);
    };

    // Get the current user's permission
    userFactory.getPermission = function() {
        return $http.get('/api/permission/');
    };

    // Get all the users from database
    userFactory.getUsers = function() {
        return $http.get('/api/management/');
    };

    // Get user to then edit
    userFactory.getUser = function(id) {
        return $http.get('/api/edit/' + id);
    };

    // Delete a user
    userFactory.deleteUser = function(police_username) {
        return $http.delete('/api/management/' + police_username);
    };

    // Edit a user
    userFactory.editUser = function(id) {
        return $http.put('/api/edit', id);
    };

    return userFactory; // Return userFactory object
});
