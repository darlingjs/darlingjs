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
    'src/**/*.js',
    'spec/**/*Spec.js'
];


// list of files to exclude
exclude = [

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
    'Firefox',
    'Chrome',
    'IE',
    'PhantomJS'
];

// Continuous Integration mode
// if true, it capture browsers, run tests and exit
singleRun = false;
