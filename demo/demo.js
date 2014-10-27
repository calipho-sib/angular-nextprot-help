(function (ng, undefined) {'use strict';
	angular.module('main', ['ngResource','npHelp'])

	.config(function($routeProvider, $locationProvider, $provide) {
		// Use the bang prefix for Google ajax crawlability
		// https://developers.google.com/webmasters/ajax-crawling/docs/specification?csw=1


		// Hashbang in HTML5 Mode
		$locationProvider.html5Mode(false);
		$locationProvider.hashPrefix('!');

		$routeProvider
			.when('/', { templateUrl: "html/np-help.md.html" })
			.when('/faq', { templateUrl: "html/np-help.md.html" })
			.when('/entity/:entity', { templateUrl: "html/np-help.element.html"})
			.otherwise({ redirectTo: '/' });
		
	});  	
})(angular);
