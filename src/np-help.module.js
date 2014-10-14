(function (ng) {
    'use strict';
    ng.module('npHelp',[]).constant('settings', {
    	baseUrl:window.BASE_SERVER||'http://localhost:3000'
    });
})(angular);
