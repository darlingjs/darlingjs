module.exports = function (grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    browserify: {
      engine: {
        files: {
          'build/<%= pkg.shortName %>.js': [
            'index.js',
            'src/utils/**/*.js',
            'src/core/**/*.js'
          ]
        }
      },
      tests: {
        files: {
          'build/test_bundle.js': [
            //'index.js',
            //'src/utils/**/*.js',
            //'src/core/**/*.js',
            'spec/**/*.js'
          ]
        }
      }
    },
    eslint: {
      target: 'src/core/**/*.js'
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
    },
    watch: {
      tests: {
        files: 'src/**/*.js',
        tasks: ['test']
      },
      eslint: {
        files: 'src/**/*.js',
        tasks: ['eslint']
      }
    }
  });

  // Default task(s).
  grunt.registerTask('default', ['test', 'build']);
  grunt.registerTask('build', ['clean:engine', 'browserify:engine', 'uglify', 'copy', 'version']);
  grunt.registerTask('test', ['browserify', 'jasmine', 'clean:test']);
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
  //grunt.loadNpmTasks('grunt-contrib-yuidoc');
  grunt.loadNpmTasks('grunt-version');
};