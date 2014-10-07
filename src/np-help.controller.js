(function (ng, undefined) {
    'use strict';
    ng.module('np-help')
        .controller('stTableController', ['$scope', '$parse', '$filter', '$attrs', function StTableController($scope, $parse, $filter, $attrs) {

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
