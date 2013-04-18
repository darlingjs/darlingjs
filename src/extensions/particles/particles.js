/**
 * Particle System
 * based on FlintSystem <http://flintparticles.org/docs/2d/index.html>
 *
 * Quick & Dirty version, will be improve API and behaviour
 *
 * Project: darlingjs / GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

(function(darlingjs) {
    'use strict';

    var m = darlingjs.module('ngParticleSystem');

    m.$c('ngEmitter', {
        generate: null
    });

    /**
     * Marker that use for emitter to note that it should emit particle
     */
    m.$c('ngEmit', {
        //number of particles to emit
        count: 1
    });

    /**
     * Emit Particle in square area
     */
    m.$s('ngSquareEmitterSystem', {
        $require: ['ngEmit', 'ngEmitter', 'ng2D', 'ngSize'],

        $addNode: ['$node', '$world', function($node, $world) {
            this._emit($node.ng2D, $node.ngSize, $node.ngEmitter.generate, $world);
        }],

        _emit: function(ng2D, ngSize, generate, $world) {
            generate.ng2D = generate.ng2D || {};
            generate.ng2D.x = ng2D.x + ngSize.width * Math.random();
            generate.ng2D.y = ng2D.y + ngSize.height * Math.random();
            var count = $node.ngEmit.count;
            while(--count>=0) {
                $world.$add(
                    $world.$e('particle', generate)
                );
            }
            $node.$remove('ngEmit');
        }
    });

    /**
     * The Random counter causes the emitter to emit particles continuously
     * at a variable random rate between two limits.
     */
    m.$c('ngEmitterRandomCounter', {
        //The maximum number of particles to emit per second.
        maxRate: 0,
        //The minimum number of particles to emit per second.
        minRate: 0
    });

    m.$s('ngRandomEmitter', {
        $require: ['ngEmitterRandomCounter'],

        $update: ['$node', '$time', function($node, $time) {
            var ngEmitter = $node.ngEmitter;
            if (ngEmitter._timeout) {
                ngEmitter._timeout -= $time;
                if (ngEmitter._timeout <= 0) {
                    //var count = ngEmitter.minCount + (ngEmitter.maxCount - ngEmitter.minCount) * Math.random();
                    ngEmitter.$add('ngEmit', {
                        count: 1
                    });
                }
            }
            ngEmitter._timeout = ngEmitter.intervalMin + (ngEmitter.intervalMax - ngEmitter.intervalMin) * Math.random();
        }]
    });

    m.$c('ngDeathZone', {
    });
})(darlingjs);