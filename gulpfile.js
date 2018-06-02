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
const inject = require('gulp-inject');
// Source Paths


const SOURCEPATHS = {
    sassSource : 'src/scss/*.scss',
    htmlSource : 'src/*.html',
    htmlPartialSource : 'src/partial/*.html',
    fontSource : 'src/fonts/**',
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

// Javscripts to source from node modules
// Will be concated in order & included before local js
const JSCRIPTS = [
    './node_modules/jquery/dist/jquery.min.js',
    './node_modules/popper.js/dist/umd/popper.min.js',
    './node_modules/bootstrap/dist/js/bootstrap.min.js',
    './node_modules/handlebars/dist/handlebars.min.js',
    './node_modules/jquery-form/src/jquery.form.js'
];

// Fonts to source from node modules
const FONTS = [
    './node_modules/bootstrap/fonts/*.{eot,svg,ttf,woff,woff2}',
    './node_modules/font-awesome/fonts/*'
];

// CSS files to source from node modules
// Will be concated in order & included before local js
// NOTE: better to import bootstrap from scss so variables can be altered
const CSSs = [
    './node_modules/font-awesome/css/font-awesome.css',
    // './node_modules/bootstrap/dist/css/bootstrap.css'
]

// Sass compile & merge with bootstrap
gulp.task( 'sass', () => {
    var nodeCSS;
    if( CSSs.length > 0 ) nodeCSS = gulp.src(CSSs);
    const sassFiles = gulp.src('src/scss/app.scss');

    if( nodeCSS ) var stream = merge( nodeCSS, sassFiles );
    else var stream = sassFiles;
    return stream
        .pipe( sass({outputStyle: 'expanded',errLogToConsole: true}) )
            .on( 'error', sass.logError )
        .pipe( concat('app.css') )
        .pipe( gulp.dest(APPPATH.css) );
    
})

// Sass compile & merge with bootstrap
gulp.task( 'compress-css', ['sass'], () => {
    gulp.src(APPPATH.css+'/*.css')
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
gulp.task( 'src-fonts', () => {
    if( FONTS ) {
        return gulp.src([...FONTS,SOURCEPATHS.fonts])
            .pipe( gulp.dest(APPPATH.fonts) );
    }
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
    const scripts = [...JSCRIPTS,SOURCEPATHS.jsSource];
    return gulp.src( scripts )
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

// Inject
gulp.task('inject', ['html'], function () {
    // It's not necessary to read the files (will speed up things), we're only after their paths:
    var sources = gulp.src([`${APPPATH.js}/*.js`, `!${APPPATH.js}/*-min.js`,
                `${APPPATH.css}/*.css`, `!${APPPATH.css}/*.min.css`], {read: false});
   
    return gulp.src([`${APPPATH.root}/*.html`])
        .pipe( inject(sources,{relative:true}) )
        .pipe(gulp.dest(APPPATH.root));
});

// Inject & Inject Min
gulp.task('inject-min', ['compress-js','compress-css','compress-html'], function () {
    // It's not necessary to read the files (will speed up things), we're only after their paths:
    var sources = gulp.src([`${APPPATH.js}/*-min.js`, `${APPPATH.css}/*.min.css`], {read: false});
   
    return gulp.src([`${APPPATH.root}/*.html`])
        .pipe(inject(sources,{relative:true}) )
        .pipe(gulp.dest(APPPATH.root));
});

// Browsersync Server
gulp.task( 'serve', ['sass'], () => {
    browserSync.init([`${APPPATH.css}/*.css`,`${APPPATH.root}/*.html`,`${APPPATH.js}/*.js`],{
        server: {
            baseDir: APPPATH.root
        }
    });
})

// Watch for changes
gulp.task( 'watch', ['serve','inject','src-fonts','images' ], () => {
    gulp.watch( [SOURCEPATHS.sassSource], ['sass'])
    gulp.watch( [SOURCEPATHS.htmlSource,SOURCEPATHS.htmlPartialSource], ['inject'] )
    gulp.watch( [SOURCEPATHS.jsSource], ['js'])
})

gulp.task( 'test', () => {
    browserSync.init({
        server: APPPATH.root
    })
});

// Default task
gulp.task( 'default', ['watch'] );
gulp.task( 'production', ['src-fonts', 'images', 'inject-min' ] );
