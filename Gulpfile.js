var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var zip = require('gulp-zip');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var ghpages = require('gulp-gh-pages');
var less = require('gulp-less');
var babelify = require('babelify');
var watchify = require('gulp-watchify');
var autoprefixer = require('gulp-autoprefixer');
var plumber = require('gulp-plumber');

// Run CSS through autoprefixed
gulp.task('css', function () {
	return gulp.src('src/app.css')
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
		.pipe(gulp.dest('dist'));
});

// Hack to enable configurable watchify watching
var watching = false;
gulp.task('enable-watch-mode', function () {
  watching = true;
});

// Browserify and copy js files
gulp.task('browserify', watchify(function (watchify) {
  return gulp.src('./src/app.js')
    .pipe(plumber())
    .pipe(watchify({
      debug: true,
      watch: watching,
      setup: function (bundle) {
        bundle.transform(babelify);
      }
    }))
    .pipe(gulp.dest('dist'));
}));

gulp.task('watchify', ['enable-watch-mode', 'browserify']);

// Copy html and assets to dist
gulp.task('copy', function () {
	return gulp.src(['src/index.html', 'src/assets/**/**'], {base: 'src/'})
		.pipe(gulp.dest('dist'));
});

// All except zip
gulp.task('all', ['copy', 'browserify', 'css']);

// Watch
gulp.task('watch', function () {
	gulp.watch('./src/*.css', ['css']);
});

// Default
gulp.task('default', ['enable-watch-mode', 'all', 'watch']);

// Push to gh-pages
gulp.task('deploy', function () {
	return gulp.src('./dist/**/*')
		.pipe(ghpages());
});

// Package
gulp.task('package', ['all', 'zip']);

gulp.task('zip', function () {
	gulp.src(['src/**', 'dist/*', 'other/*'])
		.pipe(zip('Cover.zip'))
		.pipe(gulp.dest(''));
});
