(function (ng) {'use strict';
    var defaultSettings={
        zenEdit:false,              // fullscreen edit on github
        helpPath: 'rdfhelp.json',
        helpTitle: 'Main articles',
        root: '',               // specify a URI prefix
        githubRepo: '/',
        githubApi:'http://dev-api.nextprot.org',
        githubEditPage : "https://github.com/calipho-sib/nextprot-docs/edit/master/",
        githubToken : null

    }
    ng.module('npHelp',['ngRoute']).constant('settings', angular.extend(defaultSettings,npHelpSettings||{}));  
})(angular);
