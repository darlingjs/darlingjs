/**
 * Project: darlingjs / GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

(function(darlingjs) {
    'use strict';

    var m = darlingjs.module('ngHowlerAdapter');

    m.$s('ngHowlerAdapter', {
        $require: ['ngPlaySound', 'ng2D'],

        $addEntity: ['$entity',  'ng2DViewPort', function($entity, ng2DViewPort){
            var ngPlaySound = $entity.ngPlaySound;
            ngPlaySound.$sound = new Howl({
                urls: ngPlaySound.urls,
                autoplay: true,
                loop: ngPlaySound.loop,
                volume: ngPlaySound.volume
            });

            ngPlaySound.$sound.pos3d(
                ($entity.ng2D.x - ng2DViewPort.lookAt.x) / ngPlaySound.distance,
                ($entity.ng2D.y - ng2DViewPort.lookAt.y) / ngPlaySound.distance,
                -0.5
            );

            if (ngPlaySound.onend) {
                ngPlaySound.$sound.on('end', function() {
                    $entity.$add(ngPlaySound.onend);
                });
            }
        }],

        $update: ['$entity',  'ng2DViewPort', function($entity, ng2DViewPort){
            var ngPlaySound = $entity.ngPlaySound;
            ngPlaySound.$sound.pos3d(
                ($entity.ng2D.x - ng2DViewPort.lookAt.x) / ngPlaySound.distance,
                ($entity.ng2D.y - ng2DViewPort.lookAt.y) / ngPlaySound.distance,
                -0.5
            );
        }],

        $removeEntity: ['$entity', function($entity){
            var ngPlaySound = $entity.ngPlaySound;
            if (ngPlaySound.stopPlayAfterRemove) {
                ngPlaySound.$sound.stop();
            } else if (ngPlaySound.loop) {
                ngPlaySound.$sound.on('end', function() {
                    ngPlaySound.$sound.stop();
                });
            }

            ngPlaySound.$sound = null;
        }]
    });
})(darlingjs);