//
// Karma configuration.
//
module.exports = function(config) {
    config.set({

        // Base path that will be used to resolve all patterns (eg. files, exclude).
        basePath: '',

        // Frameworks to use.
        // Available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],

        // List of files / patterns to load in the browser.
        files: [
            'https://appsforoffice.microsoft.com/lib/1/hosted/office.js',
            'Scripts/App/app-module.js',
            'Scripts/App/Common/Data/*.js',
            'Scripts/App/Common/Config/*.js',
            'Scripts/App/Common/Helpers/*.js',
            'Scripts/App/Common/Services/*.js',
            'Scripts/App/Common/Providers/*.js',
            'Scripts/App/Controllers/*.js',
            'Pages/Components/**/*.js',
            'Scripts/Tests/App/Controllers/*.js',
            'Scripts/Tests/App/Components/*.js',
            'Scripts/Tests/App/Services/*.js',
            'Scripts/Tests/App/Providers/*.js',
            'Scripts/Tests/App/Helpers/*.js',
            'Scripts/Tests/App/Data/*.js',
            'Scripts/Tests/App/Config/*.js',
            'Scripts/Tests/Helpers/*.js',
        ],

        // List of files / patterns to exclude.
        exclude: [
        ],

        // Preprocess matching files before serving them to the browser.
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'Scripts/App/Common/Config/*.js': ['coverage'],
            'Scripts/App/Common/Data/*.js': ['coverage'],
            'Scripts/App/Common/Helpers/*.js': ['coverage'],
            'Scripts/App/Common/Services/*.js': ['coverage'],
            'Scripts/App/Common/Providers/*.js': ['coverage'],
            'Scripts/App/Controllers/*.js': ['coverage'],
            'Pages/Components/**/*.js': ['coverage']
        },

        // Configure the coverage reporter.
        coverageReporter: {
            dir: 'Scripts/Tests/coverage',
            reporters: [
                { type: 'html', subdir: 'report-html' }, // Coverage report for Local using.
                { type: 'cobertura', subdir: '.', file: 'cobertura.xml' }, // Coverage file For TFS CI.
                { type: 'lcovonly', subdir: '.', file: 'lcov.info' } // Coverage file for SonarQube CI.
            ]
        },

        // Configure the test results reporter.
        junitReporter: {
            outputDir: 'Scripts/Tests/coverage',
            outputFile: 'results.xml',
            useBrowserName: false,
            suite: 'models'
        },

        // SonarQube reporter configuration.
        sonarqubeReporter: {
            basePath: 'Scripts/Tests/App',              // Test files folder.
            filePattern: '**/*-spec.js',  // Test files glob pattern.
            encoding: 'utf-8',            // Test files encoding.
            outputFolder: 'Scripts/Tests/coverage',   // Report destination.
            legacyMode: false,            // Report for Sonarqube < 6.2 (disabled).
            reportName: (metadata) => {   // Report name callback.
                /**
                 * Report metadata array:
                 * - metadata[0] = browser name.
                 * - metadata[1] = browser version.
                 * - metadata[2] = plataform name.
                 * - metadata[3] = plataform version.
                 * - from original: return metadata.concat('xml').join('.');
                 */
                return 'sonar.xml';
            }
        },

        // Test results reporter to use.
        // Possible values: 'dots', 'progress'.
        // Available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress', 'coverage', 'junit', 'sonarqube'],

        // Plugins for running tests and generating results.
        plugins: [
            require('karma-jasmine'),
            require('karma-chrome-launcher')
        ],

        // Web server port.
        port: 9876,

        // Enable / disable colors in the output (reporters and logs).
        colors: true,

        // Level of logging.
        // Possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG.
        logLevel: config.LOG_INFO,

        // Enable / disable watching file and executing tests whenever any file changes.
        autoWatch: true,

        // Start these browsers.
        // Available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Chrome'],

        // Continuous Integration mode.
        // If true, Karma captures browsers, runs the tests and exits.
        singleRun: false,

        // Concurrency level.
        // How many browser should be started simultaneous.
        concurrency: Infinity
    });
};
