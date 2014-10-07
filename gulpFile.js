var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var karma = require('karma').server;
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var pluginList = ['np-help.controller', 'np-help.factory', 'np-help.directive'];
var disFolder = './dist/';

var src = (['np-help.module']).concat(pluginList).map(function (val) {
    return 'src/' + val + '.js';
});

//modules
gulp.task('plugins', function () {
    gulp.src(src)
        .pipe(concat('np-help.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(disFolder));
});


//just as indication
gulp.task('lint', function () {
    gulp.src(src)
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
});


gulp.task('karma-CI', function (done) {
    var conf = require('./test/karma.common.js');
    conf.singleRun = true;
    conf.browsers = ['PhantomJS'];
    conf.basePath = './';
    karma.start(conf, done);
});

gulp.task('debug', function () {
    gulp.src(src)
        .pipe(concat('np-help.js'))
        .pipe(gulp.dest(disFolder));
});

//gulp.task('test', ['karma-CI']);

gulp.task('build', ['plugins', 'debug']);
