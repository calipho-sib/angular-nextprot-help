(function (ng) {'use strict';
    var defaultSettings={
        zenEdit:false,              // fullscreen edit on github
        helpPath: 'rdfhelp.json',
        helpTitle: 'Main articles',
        root: '',               // specify a URI prefix
        githubRepo: '/',
        githubApi:'http://dev-api.nextprot.org',
        githubEditPage : "https://github.com/calipho-sib/nextprot-docs/edit/master/",
        githubToken : null

    }
    ng.module('npHelp',['ngRoute']).constant('settings', angular.extend(defaultSettings,npHelpSettings||{}));  
})(angular);

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
        $scope.docGeneralities = [];
        $scope.docHelp = [];
        $scope.newsPosts = [];

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
            if (!article && $location.path() !== '/help/index') {
                if ($location.path().startsWith("/help"))
                    return $location.path('/help/index').replace();
                return $location.path('404').replace();
            }

            // Set the title of the page according to current article
            var niceTitle = article.title.charAt(0).toUpperCase() + article.title.slice(1);
            niceTitle = niceTitle.replace(/-/g," ");
            $scope.articleTitle = niceTitle;

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

(function (ng, _) { 'use strict';
    //
    // define factories
    //
    ng.module('npHelp')
        .factory('rdfHelp', rdfHelp)
        .factory('gitHubContent', gitHubContent)



    //
    // simple function to slugify string
    //
    function slugify(str) {
      str = str.replace(/^\s+|\s+$/g, ''); // trim
      str = str.toLowerCase();

      // remove accents, swap ñ for n, etc
      var from = "ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;";
      var to   = "aaaaaeeeeeiiiiooooouuuunc------";
      for (var i=0, l=from.length ; i<l ; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
      }

      str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // collapse whitespace and replace by -
        .replace(/-+/g, '-'); // collapse dashes

      return str;
    };

    //
    // simple function to strLeftBack in javascript
    //
    String.prototype.strLeftBack=function(seperator)    {
        var pos=this.lastIndexOf(seperator);
        var result=this.substring(0,pos)
        return result;
    }

    //
    // factory rdfHelp, is a simple wrapper to load JSON data
    rdfHelp.$inject=['$resource','$q','settings'];
    function rdfHelp($resource, $q, settings) {
        var Help=function(){
            this.$dao={
                rdfHelp:$resource(settings.helpPath)
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


    //
    // factory gitHubContent, help to load markdown content from github
    //
    gitHubContent.$inject=['$rootScope','$http','$q','$log','settings'];
    function gitHubContent($rootScope, $http, $q, $log,settings) {
        var markdownRepo = settings.githubApi+settings.githubRepo;
        var githubToken='access_token='+settings.githubToken;

        function buildIndexFromGitTree(tree) {
            var index = {
              newsPosts: [],
              docGeneralities: [],
              docHelp: [],
              pages:[]
            };

            _.each(tree, function(node) {
              if (node.type === 'blob') {
                // Value of path is in format 'news/yyyy/mm/dd/Example title.md'
                var path = node.path.split('/');
                //
                // load news
                if (path[0] === 'news') {
                  // Remove the .md extension (for instance, title = "Example title")
                  var title = path[4].strLeftBack('.');

                  // Use '_' to slugify the title (for instance, title = "example_title")
                  var slugTitle = slugify(title);
                  var tmpDate = new Date(parseInt(path[1]), parseInt(path[2]) - 1, parseInt(path[3]));
                  tmpDate = tmpDate.toString();
                  tmpDate = tmpDate.split(' ');
                  var formattedDate = tmpDate[1] + ' ' + tmpDate[2] + ', '+ tmpDate[3];

                  index.newsPosts.push({
                    // Build a JS date from '2014/07/05'
                    date: formattedDate,
                    title: title,
                    slug: slugTitle,
                    // We use the slugified title to get a safe URL representation of the title
                    gitPath: '/news/' + slugTitle,
                    urlPath: '/news/' + slugTitle
                  });
                }
                // load docs
                // path is in the form docs/01_introduction.md => urlPath root/introduction
                else if (path[0] === 'generalities') {
                  var titleParts = path[1].split('_');
                  var articleTitle = titleParts[1].strLeftBack('.');
                  var slugTitle = slugify(articleTitle);

                  index.docGeneralities.push({
                    title: articleTitle,
                    slug: slugTitle,
                    sequence: titleParts[0],
                    gitPath: node.path,
                    urlPath: settings.root + '/doc/' + slugTitle
                  });
                }
                //
                // load file in help
                // path is in the form help/learn-advanced-search.md => urlPath root/learn-advanced-search
                else if (path[0] === 'help') {
                    var pageTitle = path[1].strLeftBack('.');
                    var slugTitle = slugify(pageTitle);

                    index.docHelp.push({
                        title: pageTitle,
                        slug: slugTitle,
                        gitPath: node.path,
                        urlPath: settings.root + '/help/' + slugTitle
                    });
                }
                else if(path[0]==='pages'){
                  var pageTitle = path[1].strLeftBack('.');
                  var slugTitle = slugify(pageTitle);

                  index.pages.push({
                    title: pageTitle,
                    slug: slugTitle,
                    gitPath: node.path,
                    urlPath: slugTitle
                  });
                }
              }
            });

            // Sort the newsPosts in reverse chronological order and doc articles
            // by the sequence prefix, i.e. 01, 02, etc.
            index.newsPosts = _.sortBy(index.newsPosts, 'date').reverse();
            index.docGeneralities = _.sortBy(index.docGeneralities, 'sequence');
            return index;
        }

        var contentIndexDeferred = $q.defer();
        var contentIndex;
        // caching markdown load
        var loads={}
        return {
            initialize: function(custom) {
              angular.extend(settings,custom)
              markdownRepo = settings.githubApi+settings.githubRepo;
              githubToken='access_token='+settings.githubToken

              // Go fetch the GitHub tree with references to our Markdown content blobs
              var apiUrl = markdownRepo + '/git/trees/master?recursive=1';
              if((settings.githubToken) && (settings.githubToken != null)){
                apiUrl += '&'+githubToken;
              }

              // $http.get('/proxy?url=' + encodeURIComponent(apiUrl) + '&cache=1&ttl=600').success(function(data) {
              $http.get(apiUrl).success(function(data) {
                contentIndex = buildIndexFromGitTree(data.tree);
                $log.info("github index",contentIndex)
                contentIndexDeferred.resolve(contentIndex);
              }).error(function(err) {
                contentIndexDeferred.reject(err);
                $log.error("Error initializing content index", err);
              });
            },
            contentIndex: function() {
              return contentIndexDeferred.promise;
            },
            find:function(slug){
              // content is not ready
              if(!contentIndex) return '';
              // try to get article in generalities
              var article = _.find(contentIndex.docGeneralities, {'slug':slug});
              if(article) return article;
              // try to get article in help
              var article = _.find(contentIndex.docHelp, {'slug':slug});
              if(article) return article;
              // try to get article in news
              var article = _.find(contentIndex.newsPosts, {'slug':slug});
              if(article) return article;
              return _.find(contentIndex.pages, {'slug':slug});
            },
            loadSlug:function(slug){
              // article is in cache
              if(loads[slug])
                return loads[slug].promise;

              // content is not ready
              var self=this;
              // when content is ready
              return this.contentIndex().then(function(index){
                  var article = self.find(slug);
                  return self.load(article);
              });

            },
            load: function(object) {
              if(!object) return $q.when('');
              var apiUrl = markdownRepo+'/contents/'+object.gitPath+'?'+githubToken;
              var accept={'Accept':'application/vnd.github.VERSION.raw'}

              // if load promise exist return it
              if(loads[object.slug])
                return loads[object.slug].promise;
              loads[object.slug] = $q.defer();

              $log.debug("fetching markdown content", apiUrl);
              $http({method:'GET', url:apiUrl,headers:accept})
                .success(function(content) {
                    $log.info('Content received ',content.length);
                  loads[object.slug].resolve(content);
                }).error(function(err) {
                  $log.error("Error returned from API proxy", err);
                  loads[object.slug].reject(err);
                });

              // Return a promise to the caller
              return loads[object.slug].promise;
            }
        };
    };


})(angular, _);

(function (ng, undefined) {'use strict';
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

        .directive('helpToc', [function () {
            return {
                restrict: 'E',
                transclude: true,
                templateUrl: 'html/np-help.toc.html',
                link: function (scope, element, attr, ctrl) {
                }
            };
        }])

        .directive('newsToc', [function () {
            return {
                restrict: 'E',
                transclude: true,
                templateUrl: 'html/np-news.toc.html',
                link: function (scope, element, attr, ctrl) {
                }
            };
        }])


        //
        // different way to display markdown content:
        //  - from any URL
        //  - from github repository
        //  - from dynamic content
        //  - from static content
        .directive("markdown", ['$compile', '$http', '$parse', '$sce','gitHubContent',
          function ($compile, $http, $parse, $sce, gitHubContent) {
            //
            // load markdown converter
            var converter = new Showdown.converter();
            //
            // insert html in element and perform some UI tweaks
            function loadHtml(element, html){
                try{element.html(html)}catch(e){}

                // Apply the table class on all table elements. This will
                // provide the bootstrap styling for tables.
                element.find('table').addClass('table table-bordered');

                // Find all anchors whose href is an absolute url
                angular.forEach(element.find("a"), function(link) {
                    link = angular.element(link);
                    if (/^http[s]?\:\/\//.test(link.attr('href'))) {
                      link.addClass('external');
                      link.attr('target', "external");
                    }
                });
            }
            return {
                restrict: 'E',
                scope:{
                    mdSrc:'@'
                },
                replace: true,
                link: function (scope, element, attrs) {
                    var opts=$parse(attrs.markdownOpts||{})
                    //
                    // load markdown file from any URL
                    if (attrs.mdSrc) {
                        attrs.$observe('mdSrc', function(mdSrc,a){
                            $http.get(attrs.mdSrc).then(function(data) {
                                element.html(converter.makeHtml(data.data));
                            },function(data){
                                //
                                // silently quit on error
                                if(opts.silent){
                                    return element.hide();
                                }
                                element.html(data)
                            });

                        });

                        //
                        // convert markdown from attribut
                    } else if (attrs.markdownContent){
                        attrs.$observe('markdownContent', function(md) {
                            loadHtml(element,converter.makeHtml(md))
                        });

                        //
                        // load markdown file from gihub repository
                    } else if(attrs.markdownArticle){
                        attrs.$observe('markdownArticle', function(markdownArticle){
                            if(!markdownArticle)return;
                            gitHubContent.loadSlug(markdownArticle).then(function(content) {
                              loadHtml(element,$sce.trustAsHtml(converter.makeHtml(content)).toString());
                            });
                        })
                    } else {
                        //
                        // else convert markdown from static text
                        element.html(converter.makeHtml(element.text()));
                    }

                }
            };
        }])

        //
        // edit on github on click
        .directive('editMarkdown', ['gitHubContent','settings',function (gitHubContent, settings) {
            var github='http://github.com/',opts='';
            return {
                restrict: 'A',
                link: function (scope, element, attr, ctrl) {
                    element.click(function(){
                        if(settings.zenEdit)opts='#fullscreen_blob_contents';
                        gitHubContent.contentIndex().then(function(index) {
                            var article = gitHubContent.find(attr.editMarkdown);
                            if(settings.githubEditPage){
                              window.location.href=settings.githubEditPage+article.gitPath+opts
                            } else window.location.href=github+settings.githubRepo+'/edit/master/'+article.gitPath+opts //keep for backward compatibiliy if not using the API
                        });
                    })
                }
            };
        }])


        //
        // filter cleanType format type name for url path usage
        .filter('cleanType', ['$sce', function ($sce) {
            return function(type,tolower) {
                if(!type|| typeof type==='object')
                    return type;
                type=type.replace(':','');
                if(tolower)
                    type=type.toLowerCase()
                return type;
            };
        }])

        .filter('objectToArray', function() {
            return function(items) {
                var filtered = [];
                angular.forEach(items, function(item) {
                    filtered.push(item);
                });
                return filtered;
            };
        });

})(angular);

angular.module('npHelp').run(['$templateCache', function ($templateCache) {
	$templateCache.put('html/np-help.doc.html', '<div ng-controller="DocCtrl"> <markdown markdown-article="{{article}}"></markdown>' +
'</div> ');
	$templateCache.put('html/np-help.element.html', '<div class="row offset1"> <div class="row"> <section id="{{entity.typeName}}"> <h2> {{entity.typeName|cleanType}}  <div ng-if="entity.values.length> 0" class="btn-group"> <button class="btn dropdown-toggle" data-toggle="dropdown">Values<span class="caret"></span> </button> <ul class="dropdown-menu"> <li ng-repeat="value in entity.values"><a href="">{{value}}</a></li> </ul> </div> <span class="badge badge-info">{{entity.instanceCount}}</span> </h2> <blockquote> {{entity.rdfsComment}} </blockquote> <div class="row"> <div class="col-xs-12 col-md-5 vertical-middle "> <div ng-repeat="parent in entity.parentTriples | filter : rdfHelp.triples.predicate"> <p><code><a ng-href="{{hrefBuild(\'entity/\'+parent.subjectType)}}" class="text-info">{{parent.subjectType}}</a></code> &nbsp; <code class="text-warning">{{parent.predicate}}</code></span> </p> </div> </div> <div class="col-xs-12 col-md-7 form-inline"> <div class="panel panel-default"> <div class="panel-heading"><h5 class="text-center">{{entity.typeName}}</h5></div> <div class="panel-body"> <div ng-repeat="t in entity.triples | filter : rdfHelp.triples.predicate"> <code class="text-warning">{{t.predicate}}</code> <code><a class="text-success" ng-href="{{hrefBuild(\'entity/\'+t.objectType)}}">{{t.objectType}}</a></code> &nbsp; <span class="label label-info">{{t.tripleCount}}</span> <select ng-if="t.literalType && t.values.length> 1" class="form-control"> <option ng-repeat="value in t.values" value="{{value}}">{{value}}</option> </select> <input ng-if="t.literalType && t.values.length==1" type="text" placeholder="{{t.values[0]}}" class="form-control"></input> </div> </div> </div> </div> </div> <div class="bs-docs-example"> <div ng-repeat="t in entity.triples | filter : rdfHelp.triples.predicate"> <code class="text-info">{{t.tripleSample}}</code> </div> </div> <div class="bs-docs-example"> <div ng-repeat="path in entity.pathToOrigin"> <code class="text-info">{{path}} ?statement</code> </div> </div> </section> </div> </div>');
	$templateCache.put('html/np-help.toc.html', '<ul class="nav nav-sidebar"> <li><h5>{{settings.helpTitle}}</h5></li> <li ng-repeat="article in docGeneralities" ng-class="{\'active\':isActiveDoc(article.urlPath)}"><a ng-href="{{article.urlPath}}">{{article.title}}</a></li> <li><h5>RDF Entities</h5></li> <li ng-repeat="rh in (rdfHelp | objectToArray) | orderBy:\'typeName\' | filter : rdfHelp.triples.predicate track by $index" ng-class="{\'active\':isActiveElement(rh.typeName)}" ng-if="rh.typeName"> <a ng-href="{{hrefBuild(\'entity/\'+rh.typeName)}}">{{rh.typeName|cleanType}} ({{rh.instanceCount}})</a> </li> </ul>');
	$templateCache.put('html/np-news.toc.html', '<ul class="nav nav-sidebar"> <li><h5>News</h5></li> <li ng-repeat="post in newsPosts" ng-class="{\'active\':isActiveDoc(post.urlPath)}"> <a ng-href="{{post.urlPath}}"> {{post.title}} <span class="date">{{post.date}} </span></a> </li> </ul> ');
}]);