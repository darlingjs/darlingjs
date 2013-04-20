/**
 * Project: darlingjs / GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

describe('Particle System', function() {
    'use strict';

    var world;
    beforeEach(function() {
        world = darlingjs.world('theWorld', ['ngParticleSystem', 'ngFlatland']);

        this.addMatchers({

            toHas: function(expected) {
                var actual = this.actual;
                var notText = this.isNot ? ' not' : '';

                this.message = function () {
                    return 'Expected entity "' + actual.$name + '" ' + notText + ' has component "' + expected + '"';
                };

                return actual.$has(expected);
            },

            calledWith: function() {
                var notText = this.isNot ? ' not' : '';

                this.message = function() {
                    return 'Expected that function ' + notText + ' has called with ' + Array.prototype.join.call(arguments, ', ');
                };

                return this.actual.calledWith.apply(this.actual, arguments);
            }
        });
    });

    afterEach(function() {
        darlingjs.removeWorld(world);
    });

    it('should add emit component', function() {
        var emitter = world.$add(world.$e('emitter', {
            'ngEmitter' : {
                generate: {
                }
            },

            'ngEmitterRandomCounter': {
                minRate: 1,
                maxRate: 2
            }
        }));

        world.$add('ngRandomEmitterSystem');

        world.$update(1000);
        expect(emitter).toHas('ngEmit');
        expect(emitter.ngEmit.count).toBeGreaterThan(0);
        expect(emitter.ngEmit.count).toBeLessThan(3);
    });

    describe('ngSquareEmitterSystem', function() {

        beforeEach(function() {
            world.$add('ngSquareEmitterSystem');
        });

        it('Should emit particle on added ngEmit component', function(){
            var emitter = world.$add(world.$e('emitter', {
                'ng2D': {
                    x: 0.0, y: 0.0
                },
                'ng2DSize': {
                    width: 2.0, height: 2.0
                },
                'ngEmitter' : {
                    generate: {
                        $name: 'particle'
                    }
                }
            }));

            emitter.$add('ngEmit');

            expect(world.$numEntities()).toBe(2);
            var particle = world.$getByName('particle');
            expect(particle).toBeDefined();
            expect(particle).not.toBe(null);
            expect(particle.ng2D.x).toBeGreaterThan(-0.1);
            expect(particle.ng2D.x).toBeLessThan(2.1);
            expect(particle.ng2D.y).toBeGreaterThan(-0.1);
            expect(particle.ng2D.y).toBeLessThan(2.1);
        });

        it('should execute generate factory function on emit', function() {
            var emitter = world.$add(world.$e('emitter', {
                'ng2D': {
                    x: 0.0, y: 0.0
                },
                'ng2DSize': {
                    width: 2.0, height: 2.0
                },
                'ngEmitter' : {
                    generate: function() {
                        return {
                            $name: 'particle'
                        };
                    }
                }
            }));

            expect(function() {
                emitter.$add('ngEmit');
            }).not.toThrow();

            var particle = world.$getByName('particle');
            expect(particle).toBeDefined();
            expect(particle).not.toBe(null);
        });

        it('should pass emitter to particle factory', function() {
            var factory = sinon.spy();

            var emitter = world.$add(world.$e('emitter', {
                'ng2D': {
                    x: 0.0, y: 0.0
                },

                'ng2DSize': {
                    width: 2.0, height: 2.0
                },

                'ngEmitter' : {
                    generate: factory
                }
            }));

            expect(function() {
                emitter.$add('ngEmit');
            }).toThrow();

            expect(factory).calledWith(emitter);
        });

        it('should throw exception if factory does\'t return object with components', function() {
            var emitter = world.$add(world.$e('emitter', {
                'ng2D': {
                    x: 0.0, y: 0.0
                },

                'ng2DSize': {
                    width: 2.0, height: 2.0
                },

                'ngEmitter' : {
                    generate: function() {}
                }
            }));

            expect(function() {
                emitter.$add('ngEmit');
            }).toThrow();
        });
    });

    describe('ngDeathIfOutOfLifeZone', function() {
        it('should add ngDead to entity if it out of zone', function() {

        });
    });
});