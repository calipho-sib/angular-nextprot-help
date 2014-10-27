(function (ng, undefined) {'use strict';

    ng.module('npHelp').controller('HelpCtrl', ['$scope', '$location','rdfHelp','settings','$routeParams', 
        function ($scope, $location, rdfHelp, settings, $routeParams) {
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

            $scope.settings=settings;
            $scope.mdFile=parseMdFile();


            //
            // update entity documentation 
            $scope.$on('$routeChangeStart', function(event, next, current) { 
                $scope.mdFile=parseMdFile()
                if(next&&next.params&&next.params.entity){
                    $scope.entity=$scope.getActiveElement(next.params.entity)
                    $scope.entityName=next.params.entity;
                }
                console.log("mdFile",$scope.mdFile)
                console.log("entityName",$scope.entityName)
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

            // load on initial 
            $scope.rdfHelp=rdfHelp.query()
        }
    ]);
})(angular);
