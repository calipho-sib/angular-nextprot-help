(function (ng) {
    'use strict';
    ng.module('npHelp',['ngRoute']).constant('settings', {
    	baseUrl:window.BASE_SERVER,
    	helpUrl:window.HELP_URL||'/nextprot-api/rdf/help/type/all.json',
    	home:window.HOME||'home.md'
    })

		.config(function($routeProvider, $locationProvider, $provide) {
			// Use the bang prefix for Google ajax crawlability
			// https://developers.google.com/webmasters/ajax-crawling/docs/specification?csw=1


			// Hashbang in HTML5 Mode
			$locationProvider.html5Mode(false);
			$locationProvider.hashPrefix('!');

			$routeProvider
				.when('/', { templateUrl: "html/np-help.intro.html" })
				.when('/:entity', { templateUrl: "html/np-help.element.html"})
				.otherwise({ redirectTo: '/' });
			
		});    
})(angular);

(function (ng, undefined) {'use strict';

    ng.module('npHelp').controller('HelpCtrl', ['$scope', '$location','rdfHelp','settings','$routeParams', 
        function ($scope, $location, rdfHelp, settings, $routeParams) {
            
            $scope.settings=settings;

            //
            // update entity documentation 
            $scope.$on('$routeChangeStart', function(event, next, current) { 
                if(next&&next.params&&next.params.entity){
                    $scope.entity=$scope.getActiveElement(next.params.entity)
                    $scope.entityName=next.params.entity;
                }
            });  

            $scope.getActiveElement=function(entity){
                for (var i in $scope.rdfHelp){
                    if($scope.rdfHelp[i].typeName===':'+entity){
                        return $scope.rdfHelp[i];
                    }
                }
            }

            $scope.isActiveElement=function(name){
                return $scope.entityName===name
            }  

            $scope.rdfHelp=rdfHelp.query()


            if($location.path()!=='/'){
                $scope.rdfHelp.$promise.then(function(){
                    $scope.entity=$scope.getActiveElement($location.path().substring(1))
                })                
            }
        }
    ]);
})(angular);

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

angular.module('npHelp').run(['$templateCache', function ($templateCache) {
	$templateCache.put('html/np-help.element.html', '<div class="row offset1"> <div class="row"> <section id="{{entity.typeName}}"> <h2> {{entity.typeName.replace(\':\',\'\')}}  <div ng-if="entity.values.length> 0" class="btn-group"> <button class="btn dropdown-toggle" data-toggle="dropdown">Values<span class="caret"></span> </button> <ul class="dropdown-menu"> <li ng-repeat="value in entity.values"><a href="">{{value}}</a></li> </ul> </div> <span class="badge badge-info">{{entity.instanceCount}}</span> </h2> <div class="row"> <blockquote>{{entity.rdfsComment}}</blockquote> <div class="col-xs-12 col-md-5 vertical-middle text-center"> <div ng-repeat="parent in entity.parentTriples | filter : rdfHelp.triples.predicate"> <p><code><a href="#!/{{parent.subjectType|cleanType}}" class="text-info">{{parent.subjectType}}</a></code> &nbsp;<span class="next-arrow">&gt;</span> <code class="text-warning">{{parent.predicate}}</code><span class="next-arrow">&gt;</span> </p> </div> </div> <div class="col-xs-12 col-md-7 form-inline"> <div class="panel panel-default"> <div class="panel-heading"><h5 class="text-center">{{entity.typeName}}</h5></div> <div class="panel-body"> <div ng-repeat="t in entity.triples | filter : rdfHelp.triples.predicate"> <code class="text-warning">{{t.predicate}}</code> <code><a class="text-success" href="#!/{{t.objectType|cleanType}}">{{t.objectType}}</a></code> &nbsp; <span class="label label-info">{{t.tripleCount}}</span> <select ng-if="t.literalType && t.values.length> 1" class="form-control"> <option ng-repeat="value in t.values" value="{{value}}">{{value}}</option> </select> <input ng-if="t.literalType && t.values.length==1" type="text" placeholder="{{t.values[0]}}" class="form-control"></input> </div> </div> </div> </div> </div> <div class="bs-docs-example"> <div ng-repeat="t in entity.triples | filter : rdfHelp.triples.predicate"> <code class="text-info">{{t.tripleSample}}</code> </div> </div> <div class="bs-docs-example"> <div ng-repeat="path in entity.pathToOrigin"> <code class="text-info">{{path}} ?statetment.<br/> &nbsp;&nbsp;?statement a {{entity.typeName}}</code> </div> </div> </section> </div> </div>');
	$templateCache.put('html/np-help.intro.html', '<markdown src="{{settings.home|trusted}}">');
}]);