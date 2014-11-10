(function (ng, undefined) {'use strict';
    ng.module('npHelp')
        .directive('rdfHelp', [function () {
            return {
                restrict: 'A',
                transclude: true,
                templateUrl: 'html/np-help.element.html',
                link: function (scope, element, attr, ctrl) {
                }
            };
        }])

        .directive("markdown", ['$compile', '$http', '$parse', '$timeout', 
          function ($compile, $http, $parse, $timeout) {
            var converter = new Showdown.converter();
            return {
                restrict: 'E',
                scope:{
                    mdSrc:'@'
                },
                replace: true,
                link: function (scope, element, attrs) {
                    var opts=$parse(attrs.markdownOpts||{})
                    var initSrc=attrs.mdSrc;
                    if (initSrc) {
                        attrs.$observe('mdSrc', function(mdSrc,a){
                            // if(mdSrc==initSrc){
                            //     return;
                            // }

                            $http.get(attrs.mdSrc).then(function(data) {
                                element.html(converter.makeHtml(data.data));
                            },function(data){
                                if(opts.silent){
                                    return element.hide();
                                }
                                element.html(data)
                            });

                        });
                    } else {
                        element.html(converter.makeHtml(element.text()));
                    }

                }
            };
        }])

        .filter('trusted', ['$sce', function ($sce) {
            return function(url) {
                return $sce.trustAsResourceUrl(url);
            };
        }])

        .filter('cleanType', ['$sce', function ($sce) {
            return function(type,tolower) {
                if(!type|| typeof type==='object')
                    return type;
                type=type.replace(':','');
                if(tolower)
                    type=type.toLowerCase()
                return type;
            };
        }]);        


})(angular);
