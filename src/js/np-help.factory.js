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
