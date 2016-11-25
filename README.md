# neXtProt - The knowledge resource on human proteins

This is a code repository for the SIB - Swiss Institute of Bioinformatics CALIPHO group neXtProt project

See: http://www.nextprot.org/

# neXtProt help

neXtProt help is a help module for angular js. It allows you to quickly embed the neXtProt help in a declarative way including RDF and API.

## Install it as angular module

the easiest way is to run bower, then you just have to add the script and register the module `np-help` to you application:

```
./node_modules/.bin/bower install --save https://github.com/calipho-sib/nextprot-ui-help/tarball/master
```
Setup your angular application to make the help available
```javascript
// load the module
var app=angular.module('app', ['npHelp']);
...
// init the module
app.run(function (gitHubContent) {
  gitHubContent.initialize();
});

// configure your routea
$routeProvider
    .when('/page/entity/:entity',{title: 'help for snorql', templateUrl: 'partials/help.html'})
    .when('/page/:docs?/:article?',{title: 'help for snorql', templateUrl: 'partials/page.html'})

```

in your index.html file
```html
  <script>
    //
    // global settings for angular-nexprot-ui-help
    var npHelpSettings={
        // baseUrl:"http://uat-web2:8080",
        helpPath:'rdfhelp.json',
        helpTitle:'Main truc',
        root:'page', // specify the root of RDF entity routes
        githubRepo:'<github-user>/<github-repo>',
        githubToken:'<gitub-token>'
    }    
  </script>
```




## Development
The easiest way to run the development is to use grunt and open your browser at [http://localhost:3000/demo](http://localhost:3000/demo):

```
npm install
./node_modules/.bin/bower install 
./node_modules/.bin/grunt serve
```

## Updates
When code is modified
* The version must be changed in the package.json file. 
* The distribution files must be generated using: `./node_modules/.bin/grunt` 
* Commit and push your changes to git
* Type "grunt bump" to release a new version

```
./node_modules/.bin/bower install
./node_modules/.bin/grunt
git add -A
git commit -m "packaging app"
git push origin master
./node_modules/.bin/grunt bump
```

## custom builds
np-help is based around a main directive which generate a top level controller whose API can be accessed by sub directives
(plugins), if you don't need some of these, simply edit the Gruntfile (the pluginList variable) and run `grunt`

## Testing
We use Karma to ensure the quality of the code. The karma task will try to open Firefox and Chrome as browser in which to run the tests. Make sure this is available or change the configuration in karma.conf.js

## Versions
### v0.0.1 (master)
- intitial release

## License

nextprot Help module is under GPL license:

> Copyright (C) 2014 ndu@isb-sib.ch.
>
> Permission is hereby granted, free of charge, to any person
> obtaining a copy of this software and associated documentation files
> (the "Software"), to deal in the Software without restriction,
> including without limitation the rights to use, copy, modify, merge,
> publish, distribute, sublicense, and/or sell copies of the Software,
> and to permit persons to whom the Software is furnished to do so,
> subject to the following conditions:
>
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
> NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
> BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
> ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
> CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
> SOFTWARE.
