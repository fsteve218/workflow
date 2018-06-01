global.d = console.log;
const gulp = require('gulp');
const sass = require('gulp-sass');
const clean = require('gulp-clean');
const concat = require('gulp-concat');
const browserSync = require('browser-sync');
const browserify = require('gulp-browserify');
const merge = require('merge-stream');
const reload = browserSync.reload;
const autoprefixer = require('gulp-autoprefixer')
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const injectPartials = require('gulp-inject-partials');
const minify = require('gulp-minify');
const cssmin = require('gulp-cssmin');
const htmlmin = require('gulp-htmlmin');
const rename = require('gulp-rename');

// Source Paths
const SOURCEPATHS = {
    sassSource : 'src/scss/*.scss',
    htmlSource : 'src/*.html',
    htmlPartialSource : 'src/partial/*.html',
    jsSource : 'src/js/**',
    imgSource : 'img/**'
}

// App Paths
const APPPATH = {
    root: 'app/',
    css: 'app/css',
    js: 'app/js',
    fonts: 'app/fonts',
    img: 'app/img'
}


// Sass compile & merge with bootstrap
gulp.task( 'sass', () => {
    const bootstrapCSS = gulp.src('./node_modules/bootstrap/dist/css/bootstrap.css');
    const sassFiles = gulp.src('src/scss/app.scss')
        .pipe( autoprefixer({
            browsers: ['last 10 versions'],
            cascade: false
        }) )
        .pipe( sass({outputStyle: 'expanded' }) ).on('error', sass.logError)
    return merge( bootstrapCSS, sassFiles )
        .pipe( concat('app.css') )
        .pipe( gulp.dest(APPPATH.css) );
    
})

// Sass compile & merge with bootstrap
gulp.task( 'compress-css', ['sass'], () => {
    gulp.src(APPPATH.css+'/.css')
        .pipe( cssmin() )
        .pipe( rename({suffix:'.min'}) )
        .pipe( gulp.dest(APPPATH.css) );
    
})

// Images
gulp.task( 'images', () => {
    return gulp.src( SOURCEPATHS.imgSource )
        .pipe( newer(APPPATH.img) )
        .pipe( imagemin() )
        .pipe( gulp.dest( APPPATH.img ));
});

// Fonts
gulp.task( 'fonts', () => {
    gulp.src('./node_modules/bootstrap/fonts/*.{eot,svg,ttf,woff,woff2}')
        .pipe( gulp.dest(APPPATH.fonts) );
})


// HTML
gulp.task( 'html', ['clean-html'], () => {
    return gulp.src(SOURCEPATHS.htmlSource)
        .pipe( injectPartials() ).on( 'error', e => d("Error injecting partials: ",e.message) )
        .pipe( gulp.dest( APPPATH.root ) );
})
gulp.task( 'clean-html', () => {
    return gulp.src( `${APPPATH.root}/*.html`, {read: false, force: true})
        .pipe( clean() )
})
gulp.task( 'compress-html', ['html'], () => {
    return gulp.src(APPPATH.root+'/*.html')
        .pipe( htmlmin({collapseWhitespace:true}) )
        .pipe( gulp.dest( APPPATH.root ) );
})

// Javascripts
gulp.task( 'js', ['clean-js'], () => {
    return gulp.src(SOURCEPATHS.jsSource)
        .pipe( concat('main.js') )
        .pipe( browserify() ).on( 'error', e => d(e.message) )
        .pipe( gulp.dest( APPPATH.js ) );
})
gulp.task( 'clean-js', () => {
    return gulp.src( `${APPPATH.js}/*.js`, {read: false, force: true})
        .pipe( clean() )
})

// Compress Javascript
gulp.task( 'compress-js', ['js'], () => {
    return gulp.src(APPPATH.js+'/*.js')
        .pipe( minify() )
        .pipe( gulp.dest( APPPATH.js ) );
})

// Browsersync Server
gulp.task( 'serve', ['sass'], () => {
    browserSync.init([`${APPPATH.css}/*.css`,`${APPPATH.root}/*.html`,`${APPPATH.js}/*.js`],{
        server: {
            baseDir: APPPATH.root
        }
    });
})

// Watch for changes
gulp.task( 'watch', ['serve','sass', 'html', 'clean-html', 'js', 'clean-js' ,'fonts', 'images' ], () => {
    gulp.watch( [SOURCEPATHS.sassSource], ['sass'])
    gulp.watch( [SOURCEPATHS.htmlSource,SOURCEPATHS.htmlPartialSource], ['html'] )
    gulp.watch( [SOURCEPATHS.jsSource], ['js'])
})

gulp.task( 'test', () => {
    browserSync.init({
        server: APPPATH.root
    })
});

// Default task
gulp.task( 'default', ['watch'] );
gulp.task( 'production', ['compress-html','compress-js','compress-css', 'fonts', 'images' ] );
