(function (ng, undefined) {'use strict';

    ng.module('npHelp').controller('HelpCtrl', ['$scope', '$location','rdfHelp','settings','$routeParams', 
        function ($scope, $location, rdfHelp, settings, $routeParams) {
            
            $scope.settings=settings;
            $scope.mdFile=false;

            //
            // update entity documentation 
            $scope.$on('$routeChangeStart', function(event, next, current) { 
                $scope.mdFile=$location.path().substring(1)
                if($scope.mdFile=='')$scope.mdFile=settings.home;
                $scope.mdFile+='.md'
                console.log("md",$scope.mdFile)
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

            // load on initial 
            $scope.rdfHelp=rdfHelp.query()
        }
    ]);
})(angular);
