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
            if (darlingutil.isFunction(generate)) {
                generate = generate($node);
            }

            if (generate === null || darlingutil.isUndefined(generate)) {
                throw new Error('generate factory should be defined as config object with components or like factory function that return same object.');
            }

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

    m.$c('ngRectangleZone', {
        right: 0.0,
        left: 0.0,
        top: 0.0,
        bottom: 0.0
    });

    m.$s('ngRectangleZone', {
        $require: ['ngRectangleZone', 'ng2D'],

        $update: ['$node', function($node) {
            if(this._isInside($node.ngRectangleZone, $node.ng2D)) {
                $node.$remove('ngOutOfZone');
                if (!$node.ngInsideZone) {
                    $node.$add('ngInsideZone');
                }
            } else {
                $node.$remove('ngInsideZone');
                if (!$node.ngOutOfZone) {
                    $node.$add('ngOutOfZone');
                }
            }
        }],

        _isInside: function(zone, ng2D) {
            return zone.left < ng2D.x && ng2D.x < zone.right &&
                zone.top < ng2D.y && ng2D.y < zone.bottom;
        }
    });

    m.$c('ngOutOfZone', {});

    m.$c('ngInsideZone', {});

    m.$c('ngLifeZone', {
        lifeReduce: 0.1
    });

    m.$c('ngDeathZone', {});

    m.$c('ngLife', {
        life: 1.0
    });

    m.$c('ngDamage', {
        damage: 0.1
    });

    m.$c('ngContinuousDamage', {
        damage: 0.1
    });

    m.$c('ngLifeIsGrooving', {
        delta: 0.1,
        max: 1.0
    });

    m.$s('ngDecreaseLifeOnDamage', {
        $require: ['ngLife', 'ngDamage', 'ngLive'],

        $addNode: function($node) {
            $node.ngLife.life -= $node.ngDamage.damage;
            $node.$remove('ngDamage');
        }
    });

    m.$s('ngDecreaseLifeOnContinuousDamage', {
        $require: ['ngLife', 'ngContinuousDamage', 'ngLive'],

        $update: ['$node', '$time', function($node, $time) {
            $node.ngLife.life -= 0.001 * $time * $node.ngContinuousDamage.damage;
        }]
    });

    m.$s('ngLifeIsGrooving', {
        $require: ['ngLifeIsGrooving', 'ngLife', 'ngLive'],

        $update: ['$node', '$time', function($node, $time) {
            $node.ngLife.life += 0.001 * $time * $node.ngLifeIsGrooving.delta;
            if ($node.ngLife.life >= $node.ngLifeIsGrooving.max) {
                $node.ngLife.life = $node.ngLifeIsGrooving.max;
                $node.$remove('ngLifeIsGrooving');
            }
        }]
    });

    /**
     * FIXME: Better use event-based approach
     */

    m.$c('ngOnLifeChange', {
        handler: null
    });

    /**
     * Handle life changing
     */
    m.$s('ngLifeHandler', {
        $require: ['ngLife', 'ngOnLifeChange'],

        $update: ['$node', function($node) {
            var ngOnLifeChange = $node.ngOnLifeChange;
            var ngLife = $node.ngLife;
            if (ngLife.life !== ngOnLifeChange.previousLife) {
                ngOnLifeChange.handler($node, ngLife.life);
                ngOnLifeChange.previousLife = ngLife.life;
            }
        }]
    });

    m.$c('ngLive', {});

    m.$c('ngDead', {});

    m.$c('ngRemoveIfDead', {
    });

    m.$s('ngRemoveIfDead', {
        $require: ['ngRemoveIfDead', 'ngDead'],

        $addNode: ['$world', '$node', function($world, $node) {
            $world.$remove($node);
        }]
    });

    m.$s('ngReduceLifeIfOutOfLifeZone', {
        $require: ['ngLifeZone', 'ngOutOfZone', 'ngLife', 'ngLive'],

        $update: ['$node', '$time', function($node, $time) {
            $node.ngLife.life -= 0.001 * $node.ngLifeZone.lifeReduce * $time;
        }]
    });

    m.$s('ngDeadIfOutOfLife', {
        $require: ['ngLife', 'ngLive'],

        $update: ['$node', function($node) {
            if ($node.ngLife.life <= 0) {
                $node.$add('ngDead');
                $node.$remove('ngLive');
            }
        }]
    });

    m.$s('ngDeathIfOutOfLifeZone', {
        $require: ['ngLifeZone', 'ngOutOfZone', 'ngLive'],

        $addNode: function($node) {
            $node.$add('ngDead');
            $node.$remove('ngLive');
        }
    });

    m.$s('ngDeathIfInsideZone', {
        $require: ['ngDeathZone', 'ngInsideZone'],

        $addNode: function($node) {
            $node.$add('ngDead');
        }
    });
})(darlingjs);