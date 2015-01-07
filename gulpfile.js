var fs = require('fs');

var gulp = require('gulp');

var less = require('gulp-less');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');
var concat = require('gulp-concat');
var rename = require("gulp-rename");
var jshint = require('gulp-jshint');
var bump = require('gulp-bump');
var ngAnnotate = require('gulp-ng-annotate');
var templateCache = require('gulp-angular-templatecache');
var del = require('del');
var karma = require('karma').server;
var runSequence = require('run-sequence');

var _outputDir = 'build/';
var _releaseDir = 'release/';
var _htmlWatchPaths = ['src/**/*.html'];
var _jsAppWatchPaths = ['src/**/*.js'];
var _lessAppWatchPaths = ['src/**/*.less'];
var _tplAppWatchPaths = ['src/**/*.tpl.html'];

gulp.task('js', function() {
  return gulp.src('src/*.js')
  .pipe(jshint())
  .pipe(jshint.reporter('default'))
  .pipe(concat(_outputDir + '/ng-hierarchical-selector.js'))
  .pipe(gulp.dest('./'))
  .pipe(jshint())
  .pipe(jshint.reporter('default'));
});

// compile LESS and lint css
gulp.task('less', function() {
  return gulp.src('src/hierarchical-selector.less')
  .pipe(less({
    //paths: [ path.join(__dirname) ]
  }))
  .pipe(gulp.dest(_outputDir));
});

gulp.task('templates', function () {
  return gulp.src('src/**/*.tpl.html')
  .pipe(templateCache('ng-hierarchical-selector.templates.js', {module: 'hierarchical-selector'}))
  .pipe(gulp.dest(_outputDir));
});

gulp.task('test', function(done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done);
});

// watch and rerun
gulp.task('tdd', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js'
  }, done);
});

// build the client for devleopment
gulp.task('build', ['js', 'less', 'templates']);

gulp.task('bump-minor', function(){
  return gulp.src(['./package.json', './bower.json'])
    .pipe(bump({type:'minor'}))
    .pipe(gulp.dest('./'));
});

gulp.task('bump-patch', function(){
  return gulp.src(['./package.json', './bower.json'])
    .pipe(bump({type:'patch'}))
    .pipe(gulp.dest('./'));
});

gulp.task('copy-rel-js', function() {
  packageJson = require('./package.json');
  return gulp.src(_outputDir + '/*.js')
  // concat the module and template JS
  .pipe(concat(_releaseDir + 'ng-hierarchical-selector.' + packageJson.version + '.js'))
  .pipe(gulp.dest('./'));
});

gulp.task('copy-rel-css', function() {
  packageJson = require('./package.json');
  return gulp.src(_outputDir + '/hierarchical-selector.css')
    .pipe(rename('ng-hierarchical-selector.' + packageJson.version + '.css'))
    .pipe(gulp.dest(_releaseDir));
});

gulp.task('copy-rel', ['copy-rel-css', 'copy-rel-js']);

gulp.task('min-css', ['copy-rel-css'], function() {
  packageJson = require('./package.json');
  return gulp.src(_releaseDir + 'ng-hierarchical-selector.' + packageJson.version + '.css')
  .pipe(minifyCSS())
  .pipe(rename('ng-hierarchical-selector.' + packageJson.version + '.min.css'))
  .pipe(gulp.dest(_releaseDir));
});

gulp.task('min-js', ['copy-rel-js'], function() {
  packageJson = require('./package.json');
  return gulp.src(_releaseDir + 'ng-hierarchical-selector.' + packageJson.version + '.js')
    .pipe(ngAnnotate({add: true, single_quotes: true}))
    .pipe(uglify())
    .pipe(rename('ng-hierarchical-selector.' + packageJson.version + '.min.js'))
    .pipe(gulp.dest(_releaseDir));
});

gulp.task('min', ['min-js', 'min-css']);

// Build the client for dev
gulp.task('default', function(callback) {
  runSequence('clean', 'build', callback);
})

gulp.task('rel-minor', ['clean', 'bump-minor'], function(callback) {
  runSequence(['js', 'less', 'templates'], 'min', callback);
});
gulp.task('rel-patch', ['clean', 'bump-minor'], function(callback) {
  runSequence(['js', 'less', 'templates'], 'min', callback);
});

// Build the client and start the server
gulp.task('watch', ['build'], function() {
  gulp.watch(_jsAppWatchPaths, ['js']);
  gulp.watch(_lessAppWatchPaths, ['less']);
  gulp.watch(_tplAppWatchPaths, ['templates']);
});

gulp.task('clean', function(cb) {
  del([_outputDir, _releaseDir], cb);
});
