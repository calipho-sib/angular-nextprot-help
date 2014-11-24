(function (ng) {'use strict';
    var defaultSettings={
        zenEdit:false,              // fullscreen edit on github
    	helpTitle:'Main articles',
        helpPath:'/nextprot-api/rdf/help/type/all.json',
        root:'',
        githubRepo:'aerobatic/markdown-content',
        githubApi:'https://api.github.com/repos/',
        githubToken:'2e36ce76cfb03358f0a38630007840e7cb432a24'
    }
    ng.module('npHelp',['ngRoute']).constant('settings', angular.extend(defaultSettings,npHelpSettings));  
})(angular);
