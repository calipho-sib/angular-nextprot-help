(function (ng) {'use strict';
    var defaultSettings={
        helpUrl:'/nextprot-api/rdf/help/type/all.json',
        root:'',
        pages:['faq','home','entity/']
    }
    ng.module('npHelp',['ngRoute']).constant('settings', angular.extend(defaultSettings,npHelpSettings));  
})(angular);

(function (ng, undefined) {'use strict';
    ng.module('npHelp').controller('HelpCtrl', ['$scope', '$location','rdfHelp','settings','$route','$log', 
        function ($scope, $location, rdfHelp, settings, $route, $log) {
            //
            // simple helper to get markdown file from url
            function parseMdFile(){
                var page=$location.path().substring(1)
                if(page===settings.root){
                    return settings.pages[0]+'.md'
                }
                for(var i in settings.pages){
                    if(page.indexOf(settings.pages[i])!==-1){
                        return page+'.md'
                    }
                }
            }
            $scope.entityName=$route.current&&$route.current.params.entity||'';
            $scope.entity={}
            $scope.settings=settings;
            $scope.mdFile=parseMdFile();
            $scope.rdfHelp=rdfHelp;


            //
            // update entity documentation 
            $scope.$on('$routeChangeStart', function(event, next, current) { 
                $scope.mdFile=parseMdFile()
                if(next&&next.params&&next.params.entity){
                    $scope.entity=$scope.getActiveElement(next.params.entity)
                    $scope.entityName=next.params.entity;
                }
                $log.info("mdFile",$scope.mdFile)
                $log.info("entityName",$scope.entityName)
                $log.info("entity",$scope.entity)
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

            // load on init 
            rdfHelp.query().$promise.then(function(help){
                $scope.entity=$scope.getActiveElement($scope.entityName)
            })
        }
    ]);
})(angular);

(function (ng, undefined) { 'use strict';
    ng.module('npHelp')
        .factory('rdfHelp', ['$resource','$q','settings',
        function($resource, $q, settings) {
            

            var Help=function(){
                this.$dao={
                    rdfHelp:$resource((settings.baseUrl||'') + settings.helpUrl)   
                }

                this.ready=false;

                //
                // wrap promise to this object
                this.$promise=$q.when(this)
            }

            Help.prototype.query=function(){
                var self=this;

                // is emtpy
                if(!this.ready){                
                    this.$promise=self.$dao.rdfHelp.query().$promise;
    
                    this.$promise.then(function (data) {
                        angular.extend(self,data);
                        self.ready=true;
                    }); 
                }
                return this;
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

angular.module('npHelp').run(['$templateCache', function ($templateCache) {
	$templateCache.put('html/np-help.element.html', '<div class="row offset1"> <div class="row"> <section id="{{entity.typeName}}"> <h2> {{entity.typeName|cleanType}}  <div ng-if="entity.values.length> 0" class="btn-group"> <button class="btn dropdown-toggle" data-toggle="dropdown">Values<span class="caret"></span> </button> <ul class="dropdown-menu"> <li ng-repeat="value in entity.values"><a href="">{{value}}</a></li> </ul> </div> <span class="badge badge-info">{{entity.instanceCount}}</span> </h2> <blockquote> {{entity.rdfsComment}} </blockquote> <div class="row"> <div class="col-xs-12 col-md-5 vertical-middle "> <div ng-repeat="parent in entity.parentTriples | filter : rdfHelp.triples.predicate"> <p><code><a href="#!/{{parent.subjectType|cleanType}}" class="text-info">{{parent.subjectType}}</a></code> &nbsp; <code class="text-warning">{{parent.predicate}}</code></span> </p> </div> </div> <div class="col-xs-12 col-md-7 form-inline"> <div class="panel panel-default"> <div class="panel-heading"><h5 class="text-center">{{entity.typeName}}</h5></div> <div class="panel-body"> <div ng-repeat="t in entity.triples | filter : rdfHelp.triples.predicate"> <code class="text-warning">{{t.predicate}}</code> <code><a class="text-success" href="#!/{{t.objectType|cleanType}}">{{t.objectType}}</a></code> &nbsp; <span class="label label-info">{{t.tripleCount}}</span> <select ng-if="t.literalType && t.values.length> 1" class="form-control"> <option ng-repeat="value in t.values" value="{{value}}">{{value}}</option> </select> <input ng-if="t.literalType && t.values.length==1" type="text" placeholder="{{t.values[0]}}" class="form-control"></input> </div> </div> </div> </div> </div> <div class="bs-docs-example"> <div ng-repeat="t in entity.triples | filter : rdfHelp.triples.predicate"> <code class="text-info">{{t.tripleSample}}</code> </div> </div> <div class="bs-docs-example"> <div ng-repeat="path in entity.pathToOrigin"> <code class="text-info">{{path}} ?statement</code> </div> </div> </section> </div> </div>');
	$templateCache.put('html/np-help.md.html', '<markdown md-src="{{mdFile}}"></markdown>');
}]);