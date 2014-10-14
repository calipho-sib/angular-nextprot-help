(function (ng, undefined) {'use strict';

    ng.module('npHelp').controller('HelpCtrl', ['$scope', 'rdfHelp',
        function ($scope, rdfHelp) {
            $scope.rdfHelp=rdfHelp.query()
        }
    ]);
})(angular);
