(function (ng, undefined) {
    'use strict';
    ng.module('npHelp')
        .factory('rdfHelp', ['$resource','settings',
        function($resource, settings) {
            console.log(settings,(settings.baseUrl||'') + settings.helpUrl)
            var $dao={
                rdfHelp:$resource((settings.baseUrl||'') + settings.helpUrl)   
            }
            

            var Help=function(){
            }

            Help.prototype.query=function(){
                var self=this;
                return $dao.rdfHelp.query(null, function (data) {
                    angular.extend(self,data);
                }); 
            }
 
            return new Help()
        }

    ]); 
})(angular);
