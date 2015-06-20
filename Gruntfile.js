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
                src: [
                    'src/utils/**/*.js',
                    'src/core/**/*.js',
                    'spec/lib/**/*.js'
                ],
                options: {
                    specs: 'spec/suites/core/**/*Spec.js',
                    helpers: 'spec/**/*Helper.js'
                }
            }
        },
        clean: {
            docs: ['docs/'],
            build: ['build/**/*', 'build/.git']
        },
        copy: {
            bowerfile: {
                files: [
                    {
                        expand: true, cwd: 'deploy-template', src: ['bower.json'], dest: 'build/'
                    }
                ]
            },
            readme: {
                files: [
                    {
                        expand: true, cwd: 'deploy-template', src: ['README.md'], dest: 'build/'
                    }
                ]
            }
        },
        jsdoc: {
            src: ['src/core/**/*.js', 'src/utils/**/*.js', 'README.md'],
            options: {
                configure: '.jsdocrc',
                destination: 'docs'
            }
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
        },
        version: {
            defaults: {
                src: ['build/<%= pkg.shortName %>.js']
            },
            bowerfile: {
                src: 'build/bower.json'
            }
        }
    });

    // Default task(s).
    grunt.registerTask('default', ['jasmine', 'concat', 'uglify', 'copy', 'version']);
    grunt.registerTask('build', ['clean:build', 'concat', 'uglify', 'copy', 'version']);
    grunt.registerTask('test', ['concat', 'jasmine']);
    //grunt.registerTask('docs', ['clean', 'yuidoc']);
    grunt.registerTask('docs', ['clean', 'jsdoc']);

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jsdoc');
    //grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-version');
};