(function (ng, undefined) {'use strict';
    ng.module('npHelp')
        .controller('HelpCtrl',HelpCtrl)
        .controller('DocCtrl',DocCtrl)


    //
    // JSON help controller
    //
    HelpCtrl.$inject=['$scope','$location','rdfHelp','settings','$route','gitHubContent','npSettings', '$log'];
    function HelpCtrl($scope, $location, rdfHelp, settings, $route, gitHubContent, npSettings, $log) {
        //
        // setup the scope
        $scope.entityName=$route.current&&$route.current.params.entity||'';
        $scope.entity={}
        $scope.settings=settings;
        $scope.rdfHelp=rdfHelp;
        $scope.docGeneralities = [];
        $scope.docHelp = [];
        $scope.newsPosts = [];
        $scope.npSettings = npSettings;

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
            if(!name){
                return $location.path()==='/'
            }
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
                $scope.docGeneralities = index.docGeneralities;
                $scope.docHelp = index.docHelp;
                $scope.newsPosts = index.newsPosts;
            });

        }
    }

    //
    // github markdown docs
    //
    DocCtrl.$inject=['$scope', '$rootScope', '$location', '$routeParams', '$document', '$sce', '$log', 'gitHubContent', 'settings']
    function DocCtrl($scope, $rootScope, $location, $routeParams, $document, $sce, $log, gitHubContent, settings){
        //
        // setup the scope
        $scope.article=$routeParams.article;
        //
        // update page title and get article defined in the path from the github index
        gitHubContent.contentIndex().then(function(index) {
            if (!$routeParams.article) {
              return;
            }

            var article = gitHubContent.find($routeParams.article);
            if (!article) {
                if ($location.path().startsWith("/help"))
                    return $location.path('/help/index').replace();
                else if ($location.path().startsWith("/about"))
                    return $location.path('/about/nextprot').replace();
                else
                    return $location.path('404').replace();
            }

            // Set the title of the page according to current article
            var niceTitle = article.title.charAt(0).toUpperCase() + article.title.slice(1);
            niceTitle = niceTitle.replace(/-/g," ");
            $scope.articleTitle = niceTitle;

            // Set the sharability of an article
            var today = new Date();
            var articleDate = new Date(article.date);

            var utc1 = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
            var utc2 = Date.UTC(articleDate.getFullYear(), articleDate.getMonth(), articleDate.getDate());

            var dateDiff = Math.floor((utc1 - utc2) / 86400000);
            $scope.articleSharable = dateDiff < 30;

            if (_.find(index.docGeneralities, {'slug':article.slug})) {
                $document[0].title = 'RDF Help | ' + niceTitle;
                $scope.docGeneralities = article;
            } else if (_.find(index.docHelp, {'slug':article.slug})) {
                $document[0].title = 'Help | ' + niceTitle;
                $scope.docHelp = article;
            } else if (_.find(index.pages, {'slug':article.slug})) {
                $document[0].title = 'Docs | ' + niceTitle;
                $scope.pages = article;
            } else if (_.find(index.newsPosts, {'slug':article.slug})) {
                $document[0].title = 'News | ' + niceTitle;
                $scope.newsPosts = article;
            }
        });
    }
})(angular);
