(function (ng, undefined) {
    'use strict';
    ng.module('np-help')
        .controller('ng.help.factory', ['$scope', '$parse', '$filter', '$attrs', 
        function($scope, $parse, $filter, $attrs) {
            var baseUrl=""
            var $rdf_help_get_resource = $resource(baseUrl + '/nextprot-api/rdf/help/type/all.json');

            
            $rdf_help_get_resource.query(null, function (data) {
                service.rdfHelp = data;
            });

        }])
        .directive('stTable', function () {
            return {
                restrict: 'A',
                controller: 'stTableController',
                link: function (scope, element, attr, ctrl) {
                }
            };
        });
})(angular);
