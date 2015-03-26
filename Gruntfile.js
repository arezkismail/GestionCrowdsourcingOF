module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({

        jshint: {
            options: { jshintrc: true },
            all: ['lib/**/*.js', 'fixtures/*.js', '*.js']
        }

    });

    grunt.registerTask('default', ['jshint']);
};
