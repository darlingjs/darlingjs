/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

var darlingjs = require('./../../../');
var sinon = require('sinon');

describe('system', function() {
    'use strict';

    var defaultModule,
        defaultWorld;

    beforeEach(function() {
        defaultModule = darlingjs.module('defaultModule', {})
            .$system('defaultSystem');
        defaultWorld = darlingjs.world('defaultWorld', ['defaultModule']);

        /*
        jasmine.addMatchers({
            calledWith: function(actual) {
                //var notText = this.isNot ? ' not' : '';
                var notText = '';

                var result = {};

                result.message = function() {
                    return 'Expected that function ' + notText + ' has called with ' + Array.prototype.join.call(arguments, ', ') +  ' but was ';
                };

                return result.

                //return this.actual).toHaveBeenCalledWith.apply(this.actual, arguments);
            }
        });
        */
    });

    afterEach(function() {
        darlingjs.removeModule('theModule');
        darlingjs.removeModule('defaultModule');
        darlingjs.removeAllWorlds();
    });

    it('should be added to the module', function() {
        var m = darlingjs.module('theModule', {})
            .$system('theSystem');

        expect(m.$has('theSystem')).toBe(true);
    });

    it('should be added to the world', function() {
        darlingjs.module('theModule', {})
            .$system('testSystem');

        var world = darlingjs.world('testWorld', ['theModule']);
        world.$add('testSystem');
        expect(world.$isUse('testSystem')).toBe(true);
    });

    it('should has no any nodes by default', function() {
        var system = defaultWorld.$add('defaultSystem');
        expect(system.$nodes.length()).toBe(0);
    });

    it(' after been added to world should fetch required nodes from world', function() {
        darlingjs.module('theModule')
            .$c('theComponent')
            .$system('testSystem', {
                $require: ['theComponent']
            });

        var world = darlingjs.world('testWorld', ['theModule']);
        var entity = world.$e('theEntity', ['theComponent']);

        var system = world.$add('testSystem');
        expect(system.$nodes.length()).toBe(1);
        system.$nodes.forEach(function(e) {
            expect(e).toBe(entity);
        });
    });

    it('should fetch entity to $nodes after entity been added', function() {
        darlingjs.module('theModule')
            .$c('theComponent')
            .$system('testSystem', {
                $require: ['theComponent']
            });

        var world = darlingjs.world('testWorld', ['theModule']);
        var entity = world.$e('theEntity', ['theComponent']);
        var system = world.$add('testSystem');

        expect(system.$nodes.length()).toBe(1);
        system.$nodes.forEach(function(e) {
            expect(e).toBe(entity);
        });
    });

    it('should remove entity from $nodes after entity been removed', function() {
        darlingjs.module('theModule')
            .$c('theComponent')
            .$system('testSystem', {
                $require: ['theComponent']
            });

        var world = darlingjs.world('testWorld', ['theModule']);
        var entity = world.$e('theEntity', ['theComponent']);
        var system = world.$add('testSystem');

        world.$remove(entity);
        expect(system.$nodes.length()).toBe(0);
    });

    it('should fetch entity to $nodes after required component been added to entity', function() {
        darlingjs.module('theModule')
            .$c('theComponent')
            .$system('testSystem', {
                $require: ['theComponent']
            });

        var world = darlingjs.world('testWorld', ['theModule']);
        var entity = world.$e('theEntity');
        var system = world.$add('testSystem');

        entity.$add('theComponent');

        expect(system.$nodes.length()).toBe(1);
        system.$nodes.forEach(function(e) {
            expect(e).toBe(entity);
        });
    });

    it('should remove entity from $nodes after required component been removed from entity', function() {
        darlingjs.module('theModule')
            .$c('theComponent')
            .$system('testSystem', {
                $require: ['theComponent']
            });

        var world = darlingjs.world('testWorld', ['theModule']);
        var entity = world.$e('theEntity', ['theComponent']);
        var system = world.$add('testSystem');

        entity.$remove('theComponent');
        expect(system.$nodes.length()).toBe(0);
    });

    it('should invoke $added on system added to world', function() {
        var addedHandler = sinon.spy();
        darlingjs.module('theModule')
            .$c('theComponent')
            .$system('testSystem', {
                $added: addedHandler
            });

        var world = darlingjs.world('testWorld', ['theModule']);
        world.$add('testSystem');

        expect(addedHandler.callCount).toBe(1);
    });

    it('should invoke $removed on system has removed from world', function() {
        var removedHandler = sinon.spy();
        darlingjs.module('theModule')
            .$c('theComponent')
            .$system('testSystem', {
                $removed: removedHandler
            });

        var world = darlingjs.world('testWorld', ['theModule']);
        var system = world.$add('testSystem');
        world.$e('theEntity', ['theComponent']);
        world.$remove(system);

        expect(removedHandler.callCount).toBe(1);
        expect(system.$nodes.length()).toBe(0);
    });

    it('should invoke $removeEntity for each entity on system has removed from world', function() {
        var removedHandler = sinon.spy();
        darlingjs.module('theModule')
            .$c('theComponent')
            .$system('testSystem', {
                $require: ['theComponent'],
                $removeEntity: ['$entity', removedHandler]
            });

        var world = darlingjs.world('testWorld', ['theModule']);
        var system = world.$add('testSystem');
        world.$e('theEntity1', ['theComponent']);
        world.$e('theEntity2', ['theComponent']);
        expect(system.$nodes.length()).toBe(2);
        world.$remove(system);

        expect(removedHandler.callCount).toBe(2);
    });

    it('should run update once for $entities request.', function() {
        var updateHandler = sinon.spy();
        darlingjs.module('theModule')
            .$c('theComponent')
            .$system('testSystem', {
                $require: ['theComponent'],
                $update: ['$entities', '$time', updateHandler]
            });

        var world = darlingjs.world('testWorld', ['theModule']);
        var system = world.$add('testSystem');
        world.$update(11);

        expect(updateHandler.callCount).toBe(1);
        expect(updateHandler).toHaveBeenCalledWith(system.$nodes, 11);
    });

    it('should inject the World instance to update by $world argument', function() {
        var updateHandler = sinon.spy();
        darlingjs.module('theModule')
            .$c('theComponent')
            .$system('testSystem', {
                $require: ['theComponent'],
                $update: ['$world', updateHandler]
            });

        var world = darlingjs.world('testWorld', ['theModule']);
        world.$add('testSystem');
        world.$update(11);
        expect(updateHandler.callCount).toBe(1);
        expect(updateHandler).toHaveBeenCalledWith(world);
    });

    it('should run update for each request $entity.', function() {
        var updateHandler = sinon.spy();
        darlingjs.module('theModule')
            .$c('theComponent')
            .$system('testSystem', {
                $require: ['theComponent'],
                $update: ['$entity', '$time', updateHandler]
            });

        var world = darlingjs.world('testWorld', ['theModule']);

        world.$add('testSystem');

        var entities = [];
        for(var i = 0, l = 3; i < l; i++) {
            entities.push(world.$e('theEntity_' + i, ['theComponent']));
        }

        world.$update(11);

        expect(updateHandler.callCount).toBe(3);
        expect(updateHandler).toHaveBeenCalledWith(entities[0], 11);
        expect(updateHandler).toHaveBeenCalledWith(entities[1], 11);
        expect(updateHandler).toHaveBeenCalledWith(entities[2], 11);
    });

    it('should execute $addEntity handler on node is adding', function() {
        var addHandler = sinon.spy();
        var removeHandler = sinon.spy();
        darlingjs.module('theModule')
            .$c('theComponent')
            .$system('testSystem', {
                $require: ['theComponent'],
                $addEntity: addHandler,
                $removeEntity: removeHandler
            });
        var world = darlingjs.world('testWorld', ['theModule']);
        world.$add('testSystem');
        var entities = [];
        for(var i = 0, l = 3; i < l; i++) {
            entities.push(world.$e('theEntity_' + i, ['theComponent']));
        }

        expect(addHandler.callCount).toBe(3);
        expect(addHandler).toHaveBeenCalledWith(entities[0]);
        expect(addHandler).toHaveBeenCalledWith(entities[1]);
        expect(addHandler).toHaveBeenCalledWith(entities[2]);
        expect(removeHandler.callCount).toBe(0);
    });


    it('should execute $addRemove handler on node is removing', function() {
        var addHandler = sinon.spy();
        var removeHandler = sinon.spy();
        darlingjs.module('theModule')
            .$c('theComponent')
            .$system('testSystem', {
                $require: ['theComponent'],
                $addEntity: addHandler,
                $removeEntity: removeHandler
            });
        var world = darlingjs.world('testWorld', ['theModule']);
        world.$add('testSystem');

        var entities = [];
        var i, l;
        for(i = 0, l = 3; i < l; i++) {
            entities.push(world.$e('theEntity_' + i, ['theComponent']));
        }

        for(i = 0, l = entities.length; i < l; i++) {
            world.$remove(entities[i]);
        }

        expect(addHandler.callCount).toBe(3);
        expect(removeHandler.callCount).toBe(3);
        expect(removeHandler).toHaveBeenCalledWith(entities[0]);
        expect(removeHandler).toHaveBeenCalledWith(entities[1]);
        expect(removeHandler).toHaveBeenCalledWith(entities[2]);
    });

    it('should inject other systems in $added', function() {
        var handler = sinon.spy();

        darlingjs.module('theModule')
            .$c('theComponent')
            .$system('testSystem1', {
            })
            .$system('testSystem2', {
                $require: ['theComponent'],
                $added: ['testSystem1', handler]
            });

        var world = darlingjs.world('testWorld', ['theModule']);
        var s1 = world.$add('testSystem1');
        world.$add('testSystem2');

        expect(handler.callCount).toBe(1);
        expect(handler).toHaveBeenCalledWith(s1);
    });

    it('should inject other systems in $removed', function() {
        var handler = sinon.spy();
        darlingjs.module('theModule')
            .$c('theComponent')
            .$system('testSystem1', {

            })
            .$system('testSystem2', {
                $require: ['theComponent'],
                $removed: ['testSystem1', handler]
            });
        var world = darlingjs.world('testWorld', ['theModule']);
        var s1 = world.$add('testSystem1');
        var s2 = world.$add('testSystem2');
        world.$remove(s2);

        expect(handler.callCount).toBe(1);
        expect(handler).toHaveBeenCalledWith(s1);
    });

    it('should inject other systems in $addEntity', function() {
        var handler = sinon.spy();
        darlingjs.module('theModule')
            .$c('theComponent')
            .$system('testSystem1', {

            })
            .$system('testSystem2', {
                $require: ['theComponent'],
                $addEntity: ['testSystem1', '$entity', handler]
            });
        var world = darlingjs.world('testWorld', ['theModule']);
        var s1 = world.$add('testSystem1');
        var s2 = world.$add('testSystem2');
        var e = world.$e('theEntity', ['theComponent']);

        expect(handler.callCount).toBe(1);
        expect(handler).toHaveBeenCalledWith(s1, e);
    });


    it('should inject other systems in $removeEntity', function() {
        var handler = sinon.spy();
        darlingjs.module('theModule')
            .$c('theComponent')
            .$system('testSystem1', {

            })
            .$system('testSystem2', {
                $require: ['theComponent'],
                $removeEntity: ['testSystem1', '$entity', handler]
            });
        var world = darlingjs.world('testWorld', ['theModule']);
        var s1 = world.$add('testSystem1');
        var s2 = world.$add('testSystem2');
        var e = world.$e('theEntity', ['theComponent']);
        world.$remove(e);

        expect(handler.callCount).toBe(1);
        expect(handler).toHaveBeenCalledWith(s1, e);
    });


    it('should inject other systems in $removeEntity', function() {
        var handler = sinon.spy();
        darlingjs.module('theModule')
            .$c('theComponent')
            .$system('testSystem1', {

            })
            .$system('testSystem2', {
                $require: ['theComponent'],
                $update: ['testSystem1', '$entities', handler]
            });
        var world = darlingjs.world('testWorld', ['theModule']);
        var s1 = world.$add('testSystem1');
        var s2 = world.$add('testSystem2');
        var e = world.$e('theEntity', ['theComponent']);
        world.$update(1);

        expect(handler.callCount).toBe(1);
        expect(handler).toHaveBeenCalledWith(s1, s2.$nodes);
    });

    it('should operate removing component inside of $addEntity handler', function() {
        darlingjs.module('theModule')
            .$c('theComponent1')
            .$c('theComponent2')
            .$c('theComponent3')
            .$system('testSystem1', {
                $require: ['theComponent1']
            })
            .$system('testSystem2', {
                $require: ['theComponent2']
            })
            .$system('testSystem3', {
                $require: ['theComponent3'],
                $addEntity: function($entity) {
                    $entity.$remove('theComponent1');
                    $entity.$remove('theComponent2');
                }
            });

        var world = darlingjs.world('testWorld', ['theModule']);
        var s1 = world.$add('testSystem1');
        var s2 = world.$add('testSystem2');
        var s3 = world.$add('testSystem3');

        world.$e('theEntity', ['theComponent1', 'theComponent2', 'theComponent3']);

        expect(s1.$nodes.length()).toBe(0);
        expect(s2.$nodes.length()).toBe(0);
        expect(s3.$nodes.length()).toBe(1);
    });

    //TODO: Add complete injector
});