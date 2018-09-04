var gulp = require('gulp'),
    concat = require('gulp-concat'),
    riot = require('gulp-riot'),
    stylus = require('gulp-stylus'),
    nib = require('nib'),
    sourcemaps = require('gulp-sourcemaps');

gulp.task('dist', function(){
    gulp.src([
        'node_modules/riot/riot.min.js',
        'node_modules/riot/riot+compiler.min.js'
    ])
    .pipe(gulp.dest('dist/'));

    gulp.src('node_modules/normalize.css/normalize.css')
    .pipe(gulp.dest('dist/'));

    gulp.src('node_modules/urijs/src/**/*')
    .pipe(gulp.dest('dist/urijs/'));

    gulp.src('node_modules/prismjs/**/*')
    .pipe(gulp.dest('dist/prismjs/'));

    gulp.src('node_modules/marked/marked.min.js')
    .pipe(gulp.dest('dist/'));

    gulp.src('node_modules/siema/dist/siema.min.js')
    .pipe(gulp.dest('dist/'));

    gulp.src('bits-ui/font/**/*')
    .pipe(gulp.dest('dist/font/'))

    gulp.src([
        'bits-ui/ui/**/*.rt.html',
        'bits-ui/ui/**/*.rt.js'
    ])
    .pipe(riot())
    .pipe(concat('bits.rt.js'))
    .pipe(gulp.dest('dist/'));

    return gulp.src('bits-ui/stylus/bits-ui.styl')
    .pipe(sourcemaps.init())
    .pipe(stylus({
        use: nib(), import: ['nib']
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/'))
});

gulp.task('default', gulp.series('dist'));

gulp.task('dev', function(){
    gulp.series('dist');
    gulp.watch([
        'bits-ui/ui/**/*',
        'bits-ui/stylus/**/*.styl'
    ], gulp.series('dist'));
})
