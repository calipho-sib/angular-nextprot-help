(function (ng, undefined) {
    'use strict';
    ng.module('npHelp')
        .directive('rdfHelp', [function () {
            return {
                restrict: 'A',
                transclude: true,
                replace: true,
                templateUrl: 'np-help.template.html',
                link: function (scope, element, attr, ctrl) {
                }
            };
        }]);
})(angular);
