var gulp = require('gulp');
//var browserSync = require('browser-sync').create();
var bs = require('browser-sync').create();
var less = require('gulp-less');
gulp.task('server', function() {
    var files = [
        'object/**/*.css',
        'object/**/*.js',
    ];
    bs.init({
        server: {
            baseDir: "./"
        },
        open: "external"
    });
    bs.watch('object/**/*.html').on("change", bs.reload);


    gulp.task('sass', function() {
        return gulp.src(files)
            .pipe(bs.stream());
    });
   gulp.watch(files, ['sass']);
    

    gulp.watch('object/**/*.less', ['style']);
    gulp.task('style', function() {
        gulp.src('object/**/*.less')
            .pipe(less()) // 该环节过后就是CSS
            .pipe(gulp.dest('object'));
    });
    gulp.start('style');
});

gulp.task('default', ["server"]);



