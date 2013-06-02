/**
 * Project: darlingjs / GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

(function(darlingjs) {
    'use strict';

    var m = darlingjs.module('ngHowlerAdapter');

    m.$s('ngHowlerAdapter', {
        $require: ['ngSound', 'ng2D'],

        $addEntity: ['$entity',  'ng2DViewPort', '$world', function($entity, ng2DViewPort, $world){
            var ngSound = $entity.ngSound;
            ngSound.$sound = new Howl({
                urls: ngSound.urls,
                autoplay: true,
                loop: ngSound.loop,
                volume: ngSound.volume
            });

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

            if (ngSound.removeOnEnd && !ngSound.loop) {
                ngSound.$sound.on('end', function() {
                    $world.$remove($entity);
                    ngSound.$sound.off('end');
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
                ngSound.$sound.off('end');
            } else if (ngSound.loop) {
                ngSound.$sound.on('end', function() {
                    ngSound.$sound.stop();
                    ngSound.$sound.off('end');
                });
            }

            ngSound.$sound = null;
        }]
    });
})(darlingjs);