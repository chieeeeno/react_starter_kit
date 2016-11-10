'use strict';
var config = require('./_src/config.json');
var gulp = require('gulp');
var gutil = require('gulp-util');
var $ = require('gulp-load-plugins')();
var beautify = require('gulp-html-beautify');
var browserSync = require('browser-sync');
var runSequence = require('run-sequence');

// javascript compile
var browserify = require('browserify');
var watchify = require('watchify');
var bebelify = require('babelify');

var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

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
    .pipe($.sourcemaps.init({loadMaps: true}))
    .pipe($.uglify())
    .pipe($.sourcemaps.write('./'))
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



// ejs compile
gulp.task("ejs", function() {
  return gulp.src(['./_src/ejs/**/*.ejs','!./_src/ejs/**/_*.ejs'])
    .pipe($.plumber())
    .pipe($.ejs({
      site_config:config.site_config
    }))
    .pipe(beautify(config.build_config.beautify))
    .pipe($.rename({
        extname: '.html'
    }))
    .pipe(gulp.dest('./'))
});



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
    .pipe($.autoprefixer(config.build_config.autoprefixer))
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
gulp.task('imagemin', function() {
  return gulp.src(['_src/img/**/*.+(jpg|jpeg|png|gif|svg)'])
    .pipe($.plumber())
    .pipe($.changed('./img'))
    .pipe($.imagemin(config.build_config.imagemin))
    .pipe(gulp.dest('./img'));
});

// reload all Browsers
gulp.task('bs-reload', function() {
  browserSync.reload();
});


// start webserver
gulp.task('server', function(done) {
  // return browsersync.init({
  //     proxy: config.siteurl
  // });

  return browserSync({
    port: 3000,
    server: {
      baseDir: './'
    }
  }, done);
});



gulp.task('default', function() {
  return runSequence(
    ['js','sass-cache'],
    'server',
    function(){
      gulp.watch('css/*.css', function(file) {
        if (file.type === "changed") {
          browserSync.reload(file.path);
        }
      });
      gulp.watch(['./_src/ejs/**/*.ejs','!./_src/ejs/**/_*.ejs'], ['ejs']);
      gulp.watch('./_src/scss/*{.scss,.sass}', ['sass']);
      gulp.watch('./js/*.js', ['bs-reload']);
      gulp.watch('./*.html', ['bs-reload']);
      gulp.watch('_src/img/**/*.+(jpg|jpeg|png|gif|svg)', ['imagemin']);
    }
  )
});
