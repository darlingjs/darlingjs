module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            dist: {
                src: [
                    'src/core.js',
                    'src/flatworld.js'
                ],
                dest: 'build/engine.js'
            }
        },
        uglify: {
            dist: {
                files: [
                    { dest: 'build/engine.min.js', src: 'build/engine.js' }
                ]
            }
        }
    });

    // Default task(s).
    grunt.registerTask('default', ['concat', 'uglify']);
    grunt.registerTask('build', ['concat']);

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
}