var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};

var jsList = ['src/np-help.module.js','src/np-help.controller.js', 'src/np-help.factory.js', 'src/np-help.directive.js'];


module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('serve', ['connect:serve', 'watch']);

    grunt.registerTask('dev', [
        'clean',
        'ngTemplateCache',
        'concat',
        'copy'
    ]);

    grunt.registerTask('default', [
        'dev',
        'uglify',
        'cssmin'
    ]);

    grunt.initConfig({
        cmpnt: grunt.file.readJSON('bower.json'),
        clean: {

            working: {
                src: ['np-help.*', './.temp/views', './.temp/']
            }
        },
        copy: {
            styles: {
                files: [
                    {
                        src: './src/np-help.css',
                        dest: './dist/np-help.css'
                    }
                ]
            }
        },
        uglify: {
            js: {
                src: ['./dist/np-help.js'],
                dest: './dist/np-help.min.js',
                options: {
                    sourceMap: function (fileName) {
                        return fileName.replace(/\.min\.js$/, '.map');
                    }
                }
            }
        },
        concat: {
            js: {
                src:jsList.concat(['./.temp/scripts/views.js']),
                dest: './dist/np-help.js'
            }
        },
        cssmin: {
            css: {
                files: {
                    './dist/np-help.min.css': './dist/np-help.css'
                }
            }
        },
        watch: {
            js: {
                files: 'src/*.js',
                tasks: ['concat'],
                options: {
                    livereload: true
                }
            },
            html: {
                files: 'src/*.html',
                tasks: ['ngTemplateCache', 'concat'],
                options: {
                    livereload: true
                }
            }
        },
        connect: {
            options: {
                port: 8000,
                hostname: 'localhost'
            },
            serve: {
                options: {
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, '.')
                        ];
                    }
                }
            }
        },
        ngTemplateCache: {
            views: {
                files: {
                    './.temp/scripts/views.js': 'src/*.html'
                },
                options: {
                    trim: 'src/',
                    module: 'npHelp'
                }
            }
        }
    });
};
