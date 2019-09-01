var gulp = require('gulp');
// var ts = require('gulp-typescript');
// var tsProject = ts.createProject('tsconfig.json');
// var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var plumber = require('gulp-plumber');
// var buffer = require('vinyl-buffer');
var babel=require('gulp-babel');
let eslint=require('gulp-eslint');
// const nodepath=require('path');
// const cwd=process.cwd();

let handle=function(path,type){
    return (
      gulp
        .src('./src/**')
        .pipe(eslint())
        .pipe(
          plumber(function(err) {
            // console.log(JSON.stringify(err));
            console.log(err);
          })
        )
        .pipe(sourcemaps.init())
        .pipe(
          babel({
            plugins: [
              'transform-es2015-modules-commonjs',
              ['babel-plugin-add-module-exports']
            ]
          })
        )
        .on('end', function() {
          console.log(`${path} ${type}`);
        })
        // .pipe(uglify())
        .pipe(
          sourcemaps.write({ includeContent: false, sourceRoot: '/src' })
        )
        .pipe(gulp.dest('development'))
    );
};


let watch=gulp.watch('./src/**');


watch.on('change',function(path){
    handle(path,'change');
});
watch.on('add',function(path){
    handle(path,'add');
});
handle('all','start');

console.log('begin watch src');