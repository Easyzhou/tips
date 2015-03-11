var gulp = require('gulp'),
  plumber = require('gulp-plumber'),
  connect = require('gulp-connect'),
  less = require('gulp-less'),
  sass = require('gulp-sass'),
  jade = require('gulp-jade'),
  filter = require('gulp-filter'),
  autoprefix = require('gulp-autoprefixer'),
  minify = require('gulp-minify-css'),
  rename = require('gulp-rename'),
  deploy = require('gulp-gh-pages'),
  concat = require('gulp-concat'),
  sources = {
    jade: 'src/jade/**/*.jade',
    less: 'src/less/**/*.less',
    sass: 'src/sass/**/*.sass',
    license: 'src/text/**/*.txt'
  },
  env = 'out/',
  destinations = {
    dev: 'out/',
    overwatch: 'out/**/*.*',
    css: env + 'css/'
  };

gulp.task('reload', function(event) {
	return gulp.src(destinations.overwatch)
		.pipe(connect.reload());
});
gulp.task('serve', ['build'], function(event) {
	connect.server({
		root: destinations.dev,
		port: 1987,
		livereload: true
	});
	// sets up a livereload that watches for any changes in the root
	gulp.watch(destinations.overwatch, ['reload']);
});
gulp.task('sass:compile', function(event) {
  return gulp.src([sources.license, sources.sass])
    .pipe(concat('tips.sass'))
    .pipe(sass())
    .pipe(autoprefix([
      'last 3 versions',
      'Blackberry 10',
      'Android 3',
      'Android 4'
    ]))
    .pipe(gulp.dest(destinations.css))
    .pipe(minify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(destinations.css));
});
gulp.task('sass:watch', function(event) {
  gulp.watch(sources.sass, ['sass:compile']);
});
gulp.task('less:compile', function(event) {
  return gulp.src([sources.license, sources.less])
    .pipe(concat('tips.less'))
    .pipe(less())
    .pipe(autoprefix([
      'last 3 versions',
      'Blackberry 10',
      'Android 3',
      'Android 4'
    ]))
    .pipe(gulp.dest(destinations.css))
    .pipe(minify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(destinations.css));
});
gulp.task('less:watch', function(event) {
  gulp.watch(sources.less, ['less:compile']);
});
gulp.task('jade:compile', function(event) {
  return gulp.src(sources.jade)
    .pipe(jade())
    .pipe(gulp.dest(destinations.dev));
});
gulp.task('jade:watch', function(event) {
  gulp.watch(sources.jade, ['jade:compile']);
});
gulp.task('dist', ['less:compile'], function(event) {
  return gulp.src('out/css/**/*.css')
    .pipe(gulp.dest('dist/'));
});
gulp.task('deploy:page', ['less:compile', 'jade:compile'], function(event) {
  var htmlFilter = filter('**/*.html');
  return gulp.src([
      'out/**/*.*',
      '!out/css/tips.css',
      '!out/index.html'
    ])
    .pipe(htmlFilter)
    .pipe(rename('index.html'))
    .pipe(htmlFilter.restore())
    .pipe(deploy());
});
gulp.task('build', ['sass:compile', 'jade:compile']);
gulp.task('dev', ['serve', 'less:watch', 'jade:watch']);
gulp.task('default', ['dev']);
