'use strict';
var gulp = require('gulp');
var gutil = require('gulp-util');
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync');

// javascript compile
var browserify = require('browserify');
var watchify = require('watchify');
var bebelify = require('babelify');

var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');

var b = browserify({
  entries: ['./_src/js/index.jsx'],
  transform: ['babelify'],
  cache: {},
  packageCache: {},
  plugin: [watchify]
})
.on('update', bundle)
.on('log', gutil.log)

function bundle(){
  return b.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error')  )
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./js'));
}

gulp.task('js', bundle);


// minify JS
// gulp.task('minify-js', function() {
//   return gulp.src(['src/**/js/**/*.js','!src/**/js/**/*.min.js'],{base: 'src'})
//     .pipe($.stripDebug())
//     .pipe($.uglify())
//     .pipe($.rename({suffix: '.min'}))
//     .pipe(gulp.dest('dest'));
// });




// sass compile
gulp.task('sass', function() {
  return gulp.src(['./_src/scss/*{.scss,.sass}'])
    .pipe($.plumber())
    .pipe($.cached('sass'))
    .pipe($.sourcemaps.init())
    .pipe($.sass())
    .on('error', function(err){
      $.notify.onError({
        title: 'SASS Failed',
        message: 'Error(s) occurred during compile!'
      });
      console.log(err.message);
    })
    .pipe($.autoprefixer('last 6 version'))
    .pipe($.csscomb())
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('./css'))
    .pipe(browserSync.reload({
      stream: true
    }))
    .pipe($.notify({
      message: 'css task complete'
    }));
});

// A cache does SASS file at the time of the first practice
gulp.task('sass-cache', function() {
  return gulp.src(['./_src/scss/*{.scss,.sass}'])
    .pipe($.plumber())
    .pipe($.cached('sass'))
});

// optimize img
gulp.task('imgmin', function() {
  return gulp.src(['_src/img/**/*.+(jpg|jpeg|png|gif|svg)'])
    .pipe($.changed('./img'))
    .pipe($.imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest('./img'));
});

// reload all Browsers
gulp.task('bs-reload', function() {
  browserSync.reload();
});


// start webserver
gulp.task('server', function(done) {
  return browserSync({
    port: 3000,
    server: {
      baseDir: './'
    }
  }, done);
});


gulp.task('default', ['server','sass-cache','js'], function() {
    gulp.watch('css/*.css', function(file) {
      if (file.type === "changed") {
        browserSync.reload(file.path);
      }
    });
    gulp.watch('./*.html', ['bs-reload']);
    gulp.watch('./js/*.js', ['bs-reload']);
    gulp.watch('./_src/scss/*{.scss,.sass}', ['sass']);
    gulp.watch('_src/img/**/*.+(jpg|jpeg|png|gif|svg)', ['imgmin']);
});
