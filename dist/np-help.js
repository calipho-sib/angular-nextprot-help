(function (ng) {
    'use strict';
    ng.module('npHelp',[]).constant('settings', {
    	baseUrl:window.BASE_SERVER||'http://localhost:3000'
    });
})(angular);

(function (ng, undefined) {'use strict';

    ng.module('npHelp').controller('HelpCtrl', ['$scope', 'rdfHelp',
        function ($scope, rdfHelp) {
            $scope.rdfHelp=rdfHelp.query()
        }
    ]);
})(angular);

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

angular.module('npHelp').run(['$templateCache', function ($templateCache) {
	$templateCache.put('np-help.template.html', '<div class="row offset1"> <div class="row"> <div class="span3 bs-docs-sidebar"> <ul class="nav nav-list bs-docs-sidenav affix-top"> <li ng-repeat="rh in rdfHelp | filter : rdfHelp.triples.predicate"><a href="rdf-help#{{rh.typeName}}"><i class="icon-chevron-right"></i>{{rh.typeName.replace(\':\',\'\')}} <span ng-if="rh.values.length> 0">*</span> ({{rh.instanceCount}})</a> </li> </ul> </div> <div class="span8"> <div class="page-header"> <h1>RDF Help</h1> <input ng-model="rdfHelp.triples.predicate" placeholder="filter on predicate" class="form-control"> </div> <div ng-repeat="rh in rdfHelp | filter : rdfHelp.triples.predicate"> <section id="{{rh.typeName}}"> <h2>{{rh.typeName.replace(\':\',\'\')}}  <div ng-if="rh.values.length> 0" class="btn-group"> <button class="btn dropdown-toggle" data-toggle="dropdown">Values<span class="caret"></span> </button> <ul class="dropdown-menu"> <li ng-repeat="value in rh.values"><a href="">{{value}}</a></li> </ul> </div> <button type="button" ng-click="openPopup(\'visgraphp\', rh.typeName)"><i class="icon-picture"></i></a></button> <span class="badge badge-info">{{rh.instanceCount}}</span> </h2> <p>{{rh.rdfsComment}}</p> <div class="container-fluid"> <div class="row-fluid"> <div class="span4"> <div ng-repeat="parent in rh.parentTriples | filter : rdfHelp.triples.predicate"> <p><code><a href="rdf-help#{{parent.subjectType}}" class="text-info">{{parent.subjectType}}</a></code>&nbsp;<code class="text-warning">{{parent.predicate}}</code></p> </div> </div> <div class="span2"> <a>{{rh.typeName}}</a> </div> <div class="span6"> <div ng-repeat="t in rh.triples | filter : rdfHelp.triples.predicate"> <p> <code class="text-warning">{{t.predicate}}</code> <code><a class="text-success" href="rdf-help#{{t.objectType}}">{{t.objectType}}</a></code> &nbsp; <span class="label label-info">{{t.tripleCount}}</span> <select ng-if="t.literalType && t.values.length> 1" class="form-control"> <option ng-repeat="value in t.values" value="{{value}}">{{value}}</option> </select> <input ng-if="t.literalType && t.values.length==1" type="text" placeholder="{{t.values[0]}}" class="form-control"></input> </p> </div> </div> </div> </div> <div class="bs-docs-example"> <div ng-repeat="t in rh.triples | filter : rdfHelp.triples.predicate"> <code class="text-info">{{t.tripleSample}}</code> </div> </div> <div class="bs-docs-example"> <div ng-repeat="path in rh.pathToOrigin"> <code class="text-info">{{path}}</code> </div> </div> <a href="rdf-help/#">Top</a> </section> </div> </div> </div> </div>');
}]);