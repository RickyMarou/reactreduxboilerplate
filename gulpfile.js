/// <binding Clean='cleanScripts, cleanStyles' ProjectOpened='default' />
var path = require('path');
var gulp = require('gulp');
var gutil = require('gulp-util');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var filesize = require('gulp-filesize');
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var fs = require('fs');
var components = require('responsive-components');

var changed = require('gulp-changed');
var watch = require('gulp-watch');
var notifier = require('node-notifier');
var bundleConfigSrc = './styles/bundles.config.json';
var componentsConfigSrc = './styles/components.config.json';


// Standard handler
function standardErrorHandler(err) {
    // Notification
    notifier.notify({ message: 'Error: ' + err.message });
    // Log to console
    gutil.log(util.colors.red('Error'), err.message);
    this.emit('end');
}

gulp.task('cleanStyles', function () {
    gulp
        .src('styles/build', { read: false })
        .pipe(clean());
    console.log('build folder cleaned');
});

gulp.task('less', function () {
    // generate css files from less :
    gulp
    	.src(['styles/**/*.less', '!**/@*'])
        .pipe(less())
        .pipe(gulp.dest(function (f) {
            return f.base;
        }))
        .on('end', lessBundles)
        .on('error', standardErrorHandler);
});

function lessBundles(){
    var content = fs.readFileSync(bundleConfigSrc, "utf-8");

    var bundleConfig = JSON.parse(content.trim());
    // creates the bundles :

    for (var bundleName in bundleConfig) {
        gulp
            .src(bundleConfig[bundleName])
            .pipe(concat(bundleName + ".css"))
            .pipe(gulp.dest("styles"));

        gulp
              .src(bundleConfig[bundleName])
              .pipe(minifyCSS())
              .pipe(concat(bundleName + ".css"))
              .pipe(gulp.dest("styles/build"));
    }
}

gulp.task('components', function () {
    fs.readFile(componentsConfigSrc, "utf-8", function (err, data) {
        var componentsConfig = JSON.parse(data.trim());
        components.update(componentsConfig);
    }); 
});

gulp.task('default', function () {
    gulp.watch('styles/**/*.less', ['less']);
    gulp.watch('styles/components.config.json', ['components']);
});