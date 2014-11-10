(function (ng, undefined) {'use strict';
    ng.module('npHelp').controller('HelpCtrl', 
        ['$scope','$location','rdfHelp','settings','$route','$log', 
        function ($scope, $location, rdfHelp, settings, $route, $log) {
            //
            // simple helper to get markdown file from url
            function parseMdFile(){
                if(!$location ||!$location.path())return;
                var page=($location.path().length>1)?$location.path().substring(1):settings.root
                console.log(page,$location.path())
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
            $scope.pushState=$location.$$html5



            //
            // update entity documentation 
            $scope.$on('$routeChangeStart', function(event, next, current) { 

                $scope.mdFile=parseMdFile()
                $scope.entity=={}
                $scope.entityName=undefined
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
                name=name||''
                name=name.replace(':','');
                var active=($scope.entityName===name||$scope.mdFile===name+'.md')
                if(active)console.log('isactive',$scope.entityName,name)
                return active;
            }  

            $scope.hrefBuild=function(uri){
                uri=uri.replace(':','');
                return (settings.root&&settings.root.length)?(settings.root+'/'+uri):uri
            }

            // load on init 
            rdfHelp.query().$promise.then(function(help){
                $scope.entity=$scope.getActiveElement($scope.entityName)
            })
        }
    ]);
})(angular);
