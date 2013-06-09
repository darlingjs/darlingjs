/**
 * Project: darlingjs / GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

(function(darlingjs) {
    'use strict';

    var m = darlingjs.module('ngHowlerAdapter');

    /**
     * Ambient sound without position
     */
    m.$s('ngHowlerAmbientSoundAdapter', {
        $require: ['ngAmbientSound'],

        $addEntity: ['$entity',  '$world', 'ngResourceLoader', function($entity, $world, ngResourceLoader){
            var ngSound = $entity.ngAmbientSound;

            if (ngResourceLoader) {
                ngResourceLoader.startLoading(ngSound.urls);
            }

            ngSound.$sound = new Howl({
                urls: ngSound.urls,
                autoplay: true,
                loop: ngSound.loop,
                volume: ngSound.volume
            });

            ngSound.$sound.pos(ngSound.offset);

            ngSound.$sound.on('load', function() {
                if (ngResourceLoader) {
                    ngResourceLoader.stopLoading(ngSound.urls);
                }
            });

            if (ngSound.onend) {
                ngSound.$sound.on('end', function() {
                    $entity.$add(ngSound.onend);
                });
            }

            if (ngSound.removeComponentOnEnd && !ngSound.loop) {
                ngSound.$sound.on('end', function() {
                    $entity.$remove('ngAmbientSound');
                });
            }

            if (ngSound.removeEntityOnEnd && !ngSound.loop) {
                ngSound.$sound.on('end', function() {
                    $world.$remove($entity);
                    //ngSound.$sound.off('end');
                });
            }
        }],

        $removeEntity: ['$entity', function($entity){
            var ngSound = $entity.ngAmbientSound;
            if (ngSound.stopPlayAfterRemove) {
                ngSound.$sound.stop();
                //ngSound.$sound.off('end');
            } else if (ngSound.loop) {
                ngSound.$sound.on('end', function() {
                    ngSound.$sound.stop();
                    //ngSound.$sound.off('end');
                });
            }

            ngSound.$sound = null;
        }]
    });

    /**
     * Sound placed in the space
     */
    m.$s('ngHowlerAdapter', {

        $require: ['ngSound', 'ng2D'],

        $addEntity: ['$entity',  'ng2DViewPort', '$world', 'ngResourceLoader', function($entity, ng2DViewPort, $world, ngResourceLoader){
            var ngSound = $entity.ngSound;
            if ($entity.ng2DCircle) {
                ngSound.distance = $entity.ng2DCircle.radius;
            }

            if (ngResourceLoader) {
                ngResourceLoader.startLoading(ngSound.urls);
            }

            ngSound.$sound = new Howl({
                urls: ngSound.urls,
                autoplay: true,
                loop: ngSound.loop,
                volume: ngSound.volume
            });

            ngSound.$sound.on('load', function() {
                if (ngResourceLoader) {
                    ngResourceLoader.stopLoading(ngSound.urls);
                }
            });

            ngSound.$sound.pos(ngSound.offset);

            ngSound.$sound.pos3d(
                ($entity.ng2D.x - ng2DViewPort.lookAt.x) / ngSound.distance,
                ($entity.ng2D.y - ng2DViewPort.lookAt.y) / ngSound.distance,
                -0.5
            );

            if (ngSound.onend) {
                ngSound.$sound.on('end', function() {
                    $entity.$add(ngSound.onend);
                });
            }

            if (ngSound.removeComponentOnEnd && !ngSound.loop) {
                ngSound.$sound.on('end', function() {
                    $entity.$remove('ngSound')
                });
            }

            if (ngSound.removeEntityOnEnd && !ngSound.loop) {
                ngSound.$sound.on('end', function() {
                    $world.$remove($entity);
                    //ngSound.$sound.off('end');
                });
            }
        }],

        $update: ['$entity',  'ng2DViewPort', function($entity, ng2DViewPort){
            var ngSound = $entity.ngSound;
            ngSound.$sound.pos3d(
                ($entity.ng2D.x - ng2DViewPort.lookAt.x) / ngSound.distance,
                ($entity.ng2D.y - ng2DViewPort.lookAt.y) / ngSound.distance,
                -0.5
            );
        }],

        $removeEntity: ['$entity', function($entity){
            var ngSound = $entity.ngSound;
            if (ngSound.stopPlayAfterRemove) {
                ngSound.$sound.stop();
                //ngSound.$sound.off('end');
            } else if (ngSound.loop) {
                ngSound.$sound.on('end', function() {
                    ngSound.$sound.stop();
                    //ngSound.$sound.off('end');
                });
            }

            ngSound.$sound = null;
        }],

        _mute: false,

        isMute: function() {
            return this._mute;
        },

        mute: function() {
            this._mute = true;
            Howler.mute();
        },

        unmute: function() {
            this._mute = false;
            Howler.unmute();
        }
    });

    /**
     * Resources of Howler.js
     * Every sounds that need to bee tracked by
     * ngResourceLoader. Can by loaded though
     *
     * ngHowlerResources.load(url)
     *
     * It's good practice to preload all sounds
     * before game is started. To avoid lack of them
     * in first seconds of game.
     */
    m.$s('ngHowlerResources', {
        load: function(urls, ngResourceLoader) {
            var sound = new Howl({
                urls: urls,
                autoplay: false
            });

            ngResourceLoader.startLoading(urls);
            sound.on('load', function() {
                ngResourceLoader.stopLoading(urls);
            });
        }
    });
})(darlingjs);