module.exports = function (grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    browserify: {
      engine: {
        files: {
          'build/<%= pkg.shortName %>.js': [
            'index.js',
            'lib/utils/**/*.js',
            'lib/core/**/*.js'
          ]
        }
      },
      tests: {
        files: {
          'build/test_bundle.js': [
            //'index.js',
            //'lib/utils/**/*.js',
            //'lib/core/**/*.js',
            'spec/**/*.js'
          ]
        }
      }
    },
    eslint: {
      engine: 'lib/core/**/*.js',
      tests: 'test/**/*.js'
    },
    mochaTest: {
      test: {
        src: ['test/**/*Spec.js']
      }
    },
    uglify: {
      options: {
        banner: grunt.file.read('lib/core/core.banner')
      },
      build: {
        src: 'build/<%= pkg.shortName %>.js',
        dest: 'build/<%= pkg.shortName %>.min.js'
      }
    },
    jasmine: {
      engine: {
        src: [
          'build/<%= pkg.shortName %>.js'
        ],
        options: {
          specs: 'build/test_bundle.js',
          helpers: [
            'node_modules/jasmine-sinon/lib/jasmine-sinon.js'
          ]
        }
      }
    },
    clean: {
      docs: ['docs/'],
      engine: ['build/**/*', 'build/.git'],
      test: ['build/test_bundle.js']
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
      src: ['lib/core/**/*.js', 'lib/utils/**/*.js', 'README.md'],
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
          paths: 'lib/',
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
    },
    watch: {
      tests: {
        files: 'lib/**/*.js',
        tasks: ['test']
      },
      mochaTest: {
        files: ['lib/**/*.js', 'test/**/*.js'],
        tasks: ['mochaTest']
      },
      eslintEngine: {
        files: 'lib/**/*.js',
        tasks: ['eslint:engine']
      },
      eslintTests: {
        files: 'test/**/*.js',
        tasks: ['eslint:tests']
      }
    }
  });

  // Default task(s).
  grunt.registerTask('default', ['test', 'build']);
  grunt.registerTask('build', ['clean:engine', 'browserify:engine', 'uglify', 'copy', 'version']);
  grunt.registerTask('test', ['eslint', 'mochaTest']);
  //grunt.registerTask('docs', ['clean', 'yuidoc']);
  grunt.registerTask('docs', ['clean:docs', 'jsdoc']);
  //grunt.reqisterTask('watch:test', ['watch']);

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-jsdoc');
  // Add the grunt-mocha-test tasks.
  grunt.loadNpmTasks('grunt-mocha-test');

  //grunt.loadNpmTasks('grunt-contrib-yuidoc');
  grunt.loadNpmTasks('grunt-version');
};