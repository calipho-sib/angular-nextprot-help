(function (ng, undefined) {'use strict';
	angular.module('main', ['ngResource','npHelp'])

	.config(function($routeProvider, $locationProvider, $provide) {
		// Use the bang prefix for Google ajax crawlability
		// https://developers.google.com/webmasters/ajax-crawling/docs/specification?csw=1


		// Hashbang in HTML5 Mode
		$locationProvider.html5Mode(true);
		$locationProvider.hashPrefix('!');

		$routeProvider
			.when('/entity/:entity', { templateUrl: "html/np-help.element.html"})
	    .when('/blog/:year?/:month?/:day?/:title?', {templateUrl: 'html/np-help.doc.html'})
	    .when('/docs/:article', {templateUrl: 'html/np-help.doc.html'})
    	.otherwise({ redirectTo: '/' });
		
	});


	angular.module('main').run(function ($log,gitHubContent) {
  	$log.info("init githubdoc");
  	gitHubContent.initialize();
	});

})(angular);
