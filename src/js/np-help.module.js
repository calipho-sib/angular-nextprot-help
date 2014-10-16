(function (ng) {
    'use strict';
    ng.module('npHelp',['ngRoute']).constant('settings', {
    	baseUrl:window.BASE_SERVER,
    	helpUrl:window.HELP_URL||'/nextprot-api/rdf/help/type/all.json',
    	home:window.HOME||'home.md'
    })

		.config(function($routeProvider, $locationProvider, $provide) {
			// Use the bang prefix for Google ajax crawlability
			// https://developers.google.com/webmasters/ajax-crawling/docs/specification?csw=1


			// Hashbang in HTML5 Mode
			$locationProvider.html5Mode(false);
			$locationProvider.hashPrefix('!');

			$routeProvider
				.when('/', { templateUrl: "html/np-help.intro.html" })
				.when('/:entity', { templateUrl: "html/np-help.element.html"})
				.otherwise({ redirectTo: '/' });
			
		});    
})(angular);
