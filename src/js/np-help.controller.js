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
