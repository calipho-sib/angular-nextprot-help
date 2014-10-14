(function (ng, undefined) {
    'use strict';
    ng.module('npHelp')
        .factory('rdfHelp', ['$resource','settings',
        function($resource, settings) {
            var $dao={
                rdfHelp:$resource(settings.baseUrl + '/nextprot-api/rdf/help/type/all.json')   
            }
            

            var Help=function(){
                this.rdfHelp={}
            }

            Help.prototype.query=function(){
                return $dao.rdfHelp.query(null, function (data) {
                    angular.extend(this,data);
                }); 
            }
 
            return new Help()
        }

    ]);
})(angular);
