(function (ng, undefined) {'use strict';
    ng.module('npHelp')
        .controller('HelpCtrl',HelpCtrl) 
        .controller('DocCtrl',DocCtrl)


    //
    // JSON help controller
    //
    HelpCtrl.$inject=['$scope','$location','rdfHelp','settings','$route','gitHubContent','$log'];
    function HelpCtrl($scope, $location, rdfHelp, settings, $route, gitHubContent, $log) {
        // 
        // setup the scope
        $scope.entityName=$route.current&&$route.current.params.entity||'';
        $scope.entity={}
        $scope.settings=settings;
        $scope.rdfHelp=rdfHelp;
        $scope.docArticles = [];

        //
        // update entity documentation on path change
        $scope.$on('$routeChangeStart', function(event, next, current) { 

            $scope.entity=={}
            $scope.entityName=undefined
            if(next&&next.params&&next.params.entity){
                $scope.entity=$scope.getActiveElement(next.params.entity)
                $scope.entityName=next.params.entity;
            }
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

        // return true if a name (eg. the/path) is include in the path
        $scope.isActiveDoc=function(name){
            return $location.path()&&($location.path().indexOf(name||'-')!==-1);
        }  

        // return true if an RDF element is include in path
        $scope.isActiveElement=function(name){
            name=(name||'').replace(':','');
            var active=($scope.entityName===name)
            return active;
        }  

        // strip and build right href for RDF.elements 
        $scope.hrefBuild=function(uri){
            uri=uri.replace(':','');
            return (settings.root&&settings.root.length)?(settings.root+'/'+uri):uri
        }

        //  init help, load JSON help and Github docs content 
        $scope.initHelp=function(){
            rdfHelp.query().$promise.then(function(help){
                $scope.entity=$scope.getActiveElement($scope.entityName)
                return gitHubContent.contentIndex();
            })            
            .then(function(index) {
                $scope.docArticles = index.docArticles;
            });

        }
    }

    //
    // github markdown docs
    //
    DocCtrl.$inject=['$scope', '$rootScope', '$location', '$routeParams', '$document', '$sce', 'gitHubContent','settings']
    function DocCtrl($scope, $rootScope, $location, $routeParams, $document, $sce, gitHubContent,settings){
        //
        // setup the scope
        $scope.article=$routeParams.article;

        //
        // update page title and get article defined in the path from the github index
        gitHubContent.contentIndex().then(function(index) {            
            if (!$routeParams.article) {
              // this is not possible
              $log.info('Oops you did somethig wrong you cannot be there')
              return $location.path('404');
            }

            var article = _.find(index.docArticles, {'slug': $routeParams.article});
            if (!article){
                return $location.path('404');
            }

            // Set the title of the page
            $document[0].title = 'Docs | ' + article.title;

            $scope.docArticle = article;
        });        
    }
})(angular);
