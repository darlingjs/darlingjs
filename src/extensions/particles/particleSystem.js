/**
 * Particle System
 * based on FlintSystem <http://flintparticles.org/docs/2d/index.html>
 *
 * Quick & Dirty version, as soon as i'll found good impl of particle system
 * API and behaviour will be improve
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
        $require: ['ngEmit', 'ngEmitter', 'ng2D', 'ng2DSize'],

        $addNode: ['$node', '$world', function($node, $world) {
            this._emit($node, $node.ng2D, $node.ng2DSize, $node.ngEmitter.generate, $world);
        }],

        _emit: function($node, ng2D, ng2DSize, generate, $world) {
            generate.ng2D = generate.ng2D || {};
            generate.ng2D.x = ng2D.x + ng2DSize.width * Math.random();
            generate.ng2D.y = ng2D.y + ng2DSize.height * Math.random();
            var count = $node.ngEmit.count;
            while(--count>=0) {
                $world.$add(
                    $world.$e(generate)
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

    m.$s('ngRandomEmitterSystem', {
        $require: ['ngEmitterRandomCounter'],

        $update: ['$node', '$time', function($node, $time) {
            console.log('ngRandomEmitterSystem, ' + $time);
            var counter = $node.ngEmitterRandomCounter;
            if (!counter._timeout) {
                counter._timeout = this._timeInterval(counter);
            }

            counter._timeout -= $time;
            while (counter._timeout <= 0) {
                if ($node.ngEmit) {
                    $node.ngEmit.count++;
                } else {
                    $node.$add('ngEmit', {
                        count: 1
                    });
                }

                counter._timeout += this._timeInterval(counter);
            }
            //ngEmitter._timeout = ngEmitter.intervalMin + (ngEmitter.intervalMax - ngEmitter.intervalMin) * Math.random();
        }],

        _timeInterval: function(counter) {
            return 1000.0 / (counter.minRate + (counter.maxRate - counter.minRate) * Math.random());
        }
    });

    m.$c('ngDeathZone', {
    });
})(darlingjs);