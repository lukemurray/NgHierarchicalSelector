var gulp = require('gulp');

var less = require('gulp-less');
var jshint = require('gulp-jshint');
var templateCache = require('gulp-angular-templatecache');
var del = require('del');
var karma = require('karma').server;

var _outputDir = 'build';
var _htmlWatchPaths = ['src/**/*.html'];
var _jsAppWatchPaths = ['src/**/*.js'];
var _lessAppWatchPaths = ['src/**/*.less'];
var _tplAppWatchPaths = ['src/**/*.tpl.html'];

gulp.task('js', function() {
  gulp.src('src/hierarchical-selector.js')
  .pipe(gulp.dest(_outputDir))
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
  gulp.src('src/**/*.tpl.html')
  .pipe(templateCache('hierarchical-selector.templates.js', {module: 'hierarchical-selector'}))
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

// build the client for devleopment (watches and recompiles etc.)
gulp.task('build', ['js', 'less', 'templates']);

// Build the client and server
gulp.task('default', ['build'])

// Build the client and server and start the server
gulp.task('watch', ['build'], function() {
  gulp.watch(_jsAppWatchPaths, ['js']);
  gulp.watch(_lessAppWatchPaths, ['less']);
  gulp.watch(_tplAppWatchPaths, ['templates']);
});

gulp.task('clean', function(cb) {
  del([_outputDir], cb);
});
