module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({

        jshint: {
            options: { jshintrc: true },
            all: ['lib/**/*.js', 'fixtures/*.js', '*.js']
        },

        jscs: {
            src: ['lib/**/*.js', 'fixtures/*.js', '*.js'],
            options: {
                config: '.jscsrc',
                verbose: true
            }
    },

    });

    grunt.registerTask('default', ['jshint', 'jscs']);
};
