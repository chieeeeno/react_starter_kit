'use strict';
const config = require('./_src/config.json');
const gulp = require('gulp');
const gutil = require('gulp-util');
const $ = require('gulp-load-plugins')();
const beautify = require('gulp-html-beautify');
const browserSync = require('browser-sync');
const runSequence = require('run-sequence');
const eslint   = require('gulp-eslint');
const stripDebug = require('gulp-strip-debug');
const minifyCss = require('gulp-minify-css');

// javascript compile
const browserify = require('browserify');
const watchify = require('watchify');
const bebelify = require('babelify');

const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const notifier = require('node-notifier');


const isBuildMode = (param)=>{
  if(param === 'build'){
    return true
  }else{
    return false
  }
}

const bundle = (param)=>{
  console.log('bundle start-'+param)
  return b.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe($.sourcemaps.init({loadMaps: true}))
    .pipe(gulp.dest('./js'))
    .pipe($.if(isBuildMode(param),stripDebug()))
    .pipe($.if(isBuildMode(param),$.uglify()))
    .pipe($.if(isBuildMode(param),$.rename({extname: '.min.js'})))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest('./js'))
    .pipe($.notify({
      message: 'js task complete'
    }));
}


const b = browserify({
  entries: ['./_src/js/index.jsx'],
  transform: ['babelify'],
  cache: {},
  packageCache: {},
  plugin: [watchify]
})
.on('update', bundle)
.on('log', gutil.log)


// show error notify
const notify = (taskName, error) => {
  const title = `[task]${taskName} ${error.plugin}`;
  const errorMsg = `error: ${error.message}`;
  /* eslint-disable no-console */
  console.error(`${title}\n${error}`);
  notifier.notify({
    title: title,
    message: errorMsg,
    time: 3000
  });
};

// gulp.task('js', bundle);
gulp.task('js',['js-lint'], ()=>{
  bundle('dev')
});
gulp.task('js:build',['js-lint'], ()=>{
  bundle('build')
});

// jsのlint処理
gulp.task('js-lint', ()=> {
  console.log('js-lint start')
  return gulp.src(['./_src/js/**/*{.js,.jsx}',]) // ここでエラーが発生するとgulpが落ちて止まる
    .pipe($.plumber({
      errorHandler: (error)=> {
        notify('lint', error);
      }
    }))
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failOnError())
    .pipe($.plumber.stop());
});

// ejs compile
gulp.task("ejs", ()=> {
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

// gulp.task('compile:sass', () => {
//   return gulp.src('src/**/*.scss')
//     .pipe(plumber({
//       errorHandler: function(err) {
//         console.log(err.messageFormatted);
//         this.emit('end');
//       }
//     }))
//     .pipe(sass())
//     .pipe(gulp.dest('dist'))
//   ;
// });

// sass compile
gulp.task('sass', ()=> {
  return gulp.src(['./_src/scss/*{.scss,.sass}','!./_src/scss/**/_*{.scss,.sass}'])
    .pipe($.plumber({
      errorHandler: function(err) {
        console.log(err.messageFormatted);
        $.notify.onError({
          title: 'SASS Failed',
          message: 'Error(s) occurred during compile!'
        });
        this.emit('end');
      }
    }))
    // .pipe($.cached('sass'))
    .pipe($.sourcemaps.init())
    .pipe($.sass())
    .pipe($.autoprefixer(config.build_config.autoprefixer))
    .pipe($.csscomb())
    .pipe(gulp.dest('./css'))
    // .pipe(minifyCss({advanced:false}))
    // .pipe($.rename({
    //   extname: '.min.css'
    // }))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('./css'))
    .pipe(browserSync.reload({
      stream: true
    }))
    .pipe($.notify({
      message: 'css task complete'
    }));
});

// A cache does SASS file at the time of the first practice
gulp.task('sass-cache', ()=> {
  return gulp.src(['./_src/scss/*{.scss,.sass}'])
    .pipe($.plumber())
    .pipe($.cached('sass'))
});

// optimize imgage file
gulp.task('imagemin', ()=> {
  return gulp.src(['_src/img/**/*.+(jpg|jpeg|png|gif|svg)'])
    .pipe($.plumber())
    .pipe($.changed('./img'))
    .pipe($.imagemin(config.build_config.imagemin))
    .pipe(gulp.dest('./img'));
});

// reload all Browsers
gulp.task('bs-reload', ()=> {
  browserSync.reload();
});


// start webserver
gulp.task('server', (done)=> {
  // return browserSync.init({
  //   proxy: config.site_config.dev_url
  // });
  return browserSync({
    port: 3000,
    server: {
      baseDir: './'
    }
  }, done);
});


// default task
gulp.task('default', ()=> {
  return runSequence(
    ['js','sass-cache','ejs'],
    'server',
    function(){
      gulp.watch('css/*.css', (file)=> {
        if (file.type === "changed") {
          browserSync.reload(file.path);
        }
      });
      gulp.watch(['./_src/ejs/**/*.ejs'], ['ejs']);
      gulp.watch('./_src/scss/**/*{.scss,.sass}', ['sass']);
      // gulp.watch('./_src/js/**/*{.js,.jsx}', ['js-lint']);
      gulp.watch('./js/*{.js,.jsx}', ['bs-reload']);
      gulp.watch('./*.html', ['bs-reload']);
      gulp.watch('_src/img/**/*.+(jpg|jpeg|png|gif|svg)', ['imagemin']);
    }
  )
});
