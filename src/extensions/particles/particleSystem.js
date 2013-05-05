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

        $addEntity: ['$entity', '$world', function($entity, $world) {
            this._emit($entity, $entity.ng2D, $entity.ng2DSize, $entity.ngEmitter.generate, $world);
        }],

        _emit: function($entity, ng2D, ng2DSize, generate, $world) {
            if (darlingutil.isFunction(generate)) {
                generate = generate($entity);
            }

            if (generate === null || darlingutil.isUndefined(generate)) {
                throw new Error('generate factory should be defined as config object with components or like factory function that return same object.');
            }

            generate.ng2D = generate.ng2D || {};
            generate.ng2D.x = ng2D.x + ng2DSize.width * Math.random();
            generate.ng2D.y = ng2D.y + ng2DSize.height * Math.random();
            var count = $entity.ngEmit.count;
            while(--count>=0) {
                $world.$e(generate);
            }
            $entity.$remove('ngEmit');
        }
    });

    /**
     * Emit Particle in cubic area
     */
    m.$s('ngCubicEmitterSystem', {
        $require: ['ngEmit', 'ngEmitter', 'ng3D', 'ng3DSize'],

        $addEntity: ['$entity', '$world', function($entity, $world) {
            this._emit($entity, $entity.ng3D, $entity.ng3DSize, $entity.ngEmitter.generate, $world);
        }],

        _emit: function($entity, ng3D, ng3DSize, generate, $world) {
            if (darlingutil.isFunction(generate)) {
                generate = generate($entity);
            }

            if (generate === null || darlingutil.isUndefined(generate)) {
                throw new Error('generate factory should be defined as config object with components or like factory function that return same object.');
            }

            generate.ng3D = generate.ng3D || {};
            generate.ng3D.x = ng3D.x + ng3DSize.width * Math.random();
            generate.ng3D.y = ng3D.y + ng3DSize.height * Math.random();
            generate.ng3D.z = ng3D.z + ng3DSize.depth * Math.random();
            var count = $entity.ngEmit.count;
            while(--count>=0) {
                $world.$e(generate);
            }
            $entity.$remove('ngEmit');
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

        $update: ['$entity', '$time', function($entity, $time) {
            var counter = $entity.ngEmitterRandomCounter;
            if (!counter._timeout) {
                counter._timeout = this._timeInterval(counter);
            }

            counter._timeout -= $time;
            while (counter._timeout <= 0) {
                if ($entity.ngEmit) {
                    $entity.ngEmit.count++;
                } else {
                    $entity.$add('ngEmit', {
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

        $update: ['$entity', function($entity) {
            if(this._isInside($entity.ngRectangleZone, $entity.ng2D)) {
                $entity.$remove('ngOutOfZone');
                if (!$entity.ngInsideZone) {
                    $entity.$add('ngInsideZone');
                }
            } else {
                $entity.$remove('ngInsideZone');
                if (!$entity.ngOutOfZone) {
                    $entity.$add('ngOutOfZone');
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

        $addEntity: function($entity) {
            $entity.ngLife.life -= $entity.ngDamage.damage;
            $entity.$remove('ngDamage');
        }
    });

    m.$s('ngDecreaseLifeOnContinuousDamage', {
        $require: ['ngLife', 'ngContinuousDamage', 'ngLive'],

        $update: ['$entity', '$time', function($entity, $time) {
            $entity.ngLife.life -= 0.001 * $time * $entity.ngContinuousDamage.damage;
        }]
    });

    m.$s('ngLifeIsGrooving', {
        $require: ['ngLifeIsGrooving', 'ngLife', 'ngLive'],

        $update: ['$entity', '$time', function($entity, $time) {
            $entity.ngLife.life += 0.001 * $time * $entity.ngLifeIsGrooving.delta;
            if ($entity.ngLife.life >= $entity.ngLifeIsGrooving.max) {
                $entity.ngLife.life = $entity.ngLifeIsGrooving.max;
                $entity.$remove('ngLifeIsGrooving');
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

        $update: ['$entity', function($entity) {
            var ngOnLifeChange = $entity.ngOnLifeChange;
            var ngLife = $entity.ngLife;
            if (ngLife.life !== ngOnLifeChange.previousLife) {
                ngOnLifeChange.handler($entity, ngLife.life);
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

        $addEntity: ['$world', '$entity', function($world, $entity) {
            $world.$remove($entity);
        }]
    });

    m.$s('ngReduceLifeIfOutOfLifeZone', {
        $require: ['ngLifeZone', 'ngOutOfZone', 'ngLife', 'ngLive'],

        $update: ['$entity', '$time', function($entity, $time) {
            $entity.ngLife.life -= 0.001 * $entity.ngLifeZone.lifeReduce * $time;
        }]
    });

    m.$s('ngDeadIfOutOfLife', {
        $require: ['ngLife', 'ngLive'],

        $update: ['$entity', function($entity) {
            if ($entity.ngLife.life <= 0) {
                $entity.$add('ngDead');
                $entity.$remove('ngLive');
            }
        }]
    });

    m.$s('ngDeathIfOutOfLifeZone', {
        $require: ['ngLifeZone', 'ngOutOfZone', 'ngLive'],

        $addEntity: function($entity) {
            $entity.$add('ngDead');
            $entity.$remove('ngLive');
        }
    });

    m.$s('ngDeathIfInsideZone', {
        $require: ['ngDeathZone', 'ngInsideZone'],

        $addEntity: function($entity) {
            $entity.$add('ngDead');
        }
    });
})(darlingjs);