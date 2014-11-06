(function (ng) {'use strict';
    var defaultSettings={
        helpUrl:'/nextprot-api/rdf/help/type/all.json',
        root:'',
        pages:['faq','home','entity/']
    }
    ng.module('npHelp',['ngRoute']).constant('settings', angular.extend(defaultSettings,npHelpSettings));  
})(angular);
