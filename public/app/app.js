angular.module('userApp', ['appRoutes', 'userControllers', 'userServices', 'ngAnimate', 'mainController', 'authServices', 'resetController', 'managementController','reportServices','reportManagementController', 'addCtrl','headerCtrl', 'geolocation', 'gservice','citizenReportServices',
'citizenReportManagementController'])

.config(function($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptors');

  });
