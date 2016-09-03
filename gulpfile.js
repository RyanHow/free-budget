var gulp = require('gulp'),
    gulpWatch = require('gulp-watch'),
    del = require('del'),
    runSequence = require('run-sequence'),
    concat = require('gulp-concat'),
    git = require('gulp-git'),
    argv = process.argv;


/**
 * Ionic hooks
 * Add ':before' or ':after' to any Ionic project command name to run the specified
 * tasks before or after the command.
 */
gulp.task('serve:before', ['watch']);
gulp.task('emulate:before', ['build']);
gulp.task('deploy:before', ['build']);
gulp.task('build:before', ['build']);

// we want to 'watch' when livereloading
var shouldWatch = argv.indexOf('-l') > -1 || argv.indexOf('--livereload') > -1;
gulp.task('run:before', [shouldWatch ? 'watch' : 'build']);

/**
 * Ionic Gulp tasks, for more information on each see
 * https://github.com/driftyco/ionic-gulp-tasks
 *
 * Using these will allow you to stay up to date if the default Ionic 2 build
 * changes, but you are of course welcome (and encouraged) to customize your
 * build however you see fit.
 */
var buildBrowserify = require('ionic-gulp-browserify-typescript');
var buildSass = require('ionic-gulp-sass-build');
var copyHTML = require('ionic-gulp-html-copy');
var copyFonts = require('ionic-gulp-fonts-copy');
var copyScripts = require('ionic-gulp-scripts-copy');
var tslint = require('ionic-gulp-tslint');

var isRelease = argv.indexOf('--release') > -1;

gulp.task('watch', ['clean'], function(done){
  runSequence(
    ['sass', 'html', 'fonts', 'scripts', 'jslibs', 'logging.config'],
    function(){
      gulpWatch('app/**/*.scss', function(){ gulp.start('sass'); });
      gulpWatch('app/**/*.html', function(){ gulp.start('html'); });
      gulpWatch('app/**/*.ts', function(){ gulp.start('lint'); });
      buildBrowserify({ watch: true }).on('end', done);
    }
  );
});

gulp.task('build', ['clean'], function(done){
  runSequence(
    ['sass', 'html', 'fonts', 'scripts', 'jslibs', 'logging.config'],
    function(){
      buildBrowserify({
        minify: isRelease,
        browserifyOptions: {
          debug: !isRelease
        },
        uglifyOptions: {
          mangle: false
        }
      }).on('end', done);
    }
  );
});
gulp.task('sass', buildSass);
gulp.task('html', copyHTML);
gulp.task('fonts', copyFonts);
gulp.task('scripts', copyScripts);
gulp.task('lint', tslint);
gulp.task('clean', function(){
  return del('www/build');
});


gulp.task('jslibs', function() {
// Looks like these are inlcuded in app bundle ?
  gulp.src([
    'node_modules/big.js/big.min.js',
    'node_modules/jsnlog/jsnlog.min.js'
    //'node_modules/jquery/dist/jquery.min.js',
    //'libs/jquery.price-format.min.js'
   ])
    .pipe(concat('jslibs.bundle.js'))
    .pipe(gulp.dest('www/build/js/'))
});

gulp.task('logging.config', function() {
  gulp.src(['app/logging.config.js'])
    .pipe(gulp.dest('www/build/js/'))
});

var webDeployProjectPath = "../free-budget-web-dist-gh-pages";

gulp.task('copy-web', function() {
  del.sync([
      webDeployProjectPath + '/**',
      '!' + webDeployProjectPath,
      '!' + webDeployProjectPath + '/CNAME',
      '!' + webDeployProjectPath + '/.git/**'
    ], {force:true});

  return gulp.src([ 'www/**'])
  .pipe(gulp.dest(webDeployProjectPath));
});

gulp.task('add-web', function() {
  return gulp.src([])
  .pipe(git.add({args: ".", cwd: webDeployProjectPath}));
});

gulp.task('commit-web', function() {
  return gulp.src([])
  .pipe(git.commit('Deploy Update', {args: '-a --allow-empty', cwd: webDeployProjectPath}));
});


gulp.task('push-web', function(done) {
    return git.push('origin', 'gh-pages', {cwd: webDeployProjectPath}, done);
});

gulp.task('deploy-web', function(cb) {
  runSequence('build', 'copy-web', 'add-web', 'commit-web', 'push-web', cb);
});
