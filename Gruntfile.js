module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                banner: grunt.file.read('src/core/core.banner')
            },
            dist: {
                src: [
                    'src/core/core.prefix',
                    'src/utils/**/*.js',
                    'src/core/**/*.js',
                    'src/core/core.suffix'
                ],
                dest: 'build/<%= pkg.shortName %>.js'
            }
        },
        uglify: {
            options: {
                banner: grunt.file.read('src/core/core.banner')
            },
            build: {
                src: 'build/<%= pkg.shortName %>.js',
                dest: 'build/<%= pkg.shortName %>.min.js'
            }
        },
        jshint: {
            all: [
                'Gruntfile.js',
                'src/**/*.js'
            ]
        },
        jasmine: {
            pivotal: {
                src: ['src/utils/**/*.js', 'src/**/*.js', 'spec/lib/**/*.js'],
                options: {
                    specs: 'spec/**/*Spec.js',
                    helpers: 'spec/**/*Helper.js'
                }
            }
        },
        clean: {
            docs: ['docs/']
        },
        yuidoc: {
            compile: {
                name: '<%= pkg.name %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
                url: '<%= pkg.homepage %>',
                options: {
                    paths: 'src/',
                    outdir: 'docs/'
                }
            }
        }
    });

    // Default task(s).
    grunt.registerTask('default', ['jasmine', 'concat', 'uglify']);
    grunt.registerTask('test', ['concat', 'jasmine']);
    grunt.registerTask('docs', ['clean', 'yuidoc']);

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-contrib-clean');
};