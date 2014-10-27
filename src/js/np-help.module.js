(function (ng) {
    'use strict';
    ng.module('npHelp',['ngRoute']).constant('settings', {
    	baseUrl:window.BASE_SERVER,
    	helpUrl:window.HELP_URL||'/nextprot-api/rdf/help/type/all.json',
    	root:window.ROOT||'doc',
        pages:window.PAGES
    });  
})(angular);
