(function (ng) {
    'use strict';
    ng.module('npHelp',['ngRoute']).constant('settings', {
    	baseUrl:window.BASE_SERVER,
    	helpUrl:window.HELP_URL||'/nextprot-api/rdf/help/type/all.json',
    	home:window.HOME||'home.md'
    });  
})(angular);
