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
                // Value of path is in format 'blog/yyyy/mm/dd/Example title.md'
                var path = node.path.split('/');
                //
                // load news
                if (path[0] === 'blog') {
                  // Remove the .md extension (for instance, title = "Example title")
                  var title = path[4].strLeftBack('.');

                  // Use '_' to slugify the title (for instance, title = "example_title")
                  var slugTitle = slugify(title);

                  index.newsPosts.push({
                    // Build a JS date from '2014/07/05'
                    date: new Date(parseInt(path[1]), parseInt(path[2]) - 1, parseInt(path[3])),
                    title: title,
                    slug: slugTitle,
                    gitPath: node.path,
                    // We use the slugified title to get a safe URL representation of the title
                    urlPath: settings.root+'/news/' + path.slice(1, 4).concat(slugTitle).join('/')
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
