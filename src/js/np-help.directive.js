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
        }])

        .directive("markdown", function ($compile, $http) {
            var converter = new Showdown.converter();
            return {
                restrict: 'E',
                replace: true,
                link: function (scope, element, attrs) {
                    if ("src" in attrs) {
                        $http.get(attrs.src).then(function(data) {
                            element.html(converter.makeHtml(data.data));
                        });
                    } else {
                        element.html(converter.makeHtml(element.text()));
                    }
                }
            };
        })

        .filter('trusted', ['$sce', function ($sce) {
            return function(url) {
                return $sce.trustAsResourceUrl(url);
            };
        }])

        .filter('cleanType', ['$sce', function ($sce) {
            return function(type) {
                if(!type)return type;
                return type.substring(1);
            };
        }]);        


})(angular);
