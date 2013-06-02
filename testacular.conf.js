/**
 * From where to look for files, starting with the location of this file.
 */
basePath = '.';

/**
 * This is the list of file patterns to load into the browser during testing.
 */
files = [
    JASMINE,
    JASMINE_ADAPTER,
    'src/utils/**/*.js',
    'src/core/**/*.js',
    'vendor/**/*.js',
    'src/extensions/**/*.js',
    'spec/lib/**/*.js',
    'spec/**/*Spec.js'
];


// list of files to exclude
exclude = [
    'vendor/box2dEmscripten/**/*.*',
    'src/extensions/box2dweb/**/*.*',
    'src/extensions/box2dEmscripten/**/*.*',
    //TODO : need to fix Uncaught TypeError: 'caller', 'callee', and 'arguments' properties
    // may not be accessed on strict mode functions or the arguments objects for calls to them
    // in vendor/box2dEmscripten/box2d-dev.js
    'spec/suites/extensions/box2d/*Spec.js',
    'spec/suites/extensions/particles/*Spec.js'
];

/**
 * How to report, by default.
 */
// possible values: 'dots', 'progress', 'junit'
reporters = 'progress';

/**
 * On which port should the browser connect, on which port is the test runner
 * operating, and what is the URL path for the browser to use.
 */
port = 9018;
runnerPort = 9100;
urlRoot = '/';

/**
 * Log at a very low level, but not quite debug.
 */
logLevel = LOG_INFO;
logColors = true;

/**
 * Disable file watching by default.
 */
autoWatch = true;

/**
 * The list of browsers to launch to test on. This is empty by default, so you
 * will need to manually open your browser to http://localhot:9018/ for the
 * tests to work. Currently available browser names:
 * Chrome, ChromeCanary, Firefox, Opera, Safari, PhantomJS
 */
browsers = [
    'Chrome'
];

// Continuous Integration mode
// if true, it capture browsers, run tests and exit
singleRun = false;
