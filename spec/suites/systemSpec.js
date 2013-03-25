'use strict';
/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

describe('system', function() {
    var defaultModule,
        defaultWorld;
    beforeEach(function() {
        defaultModule = darlingjs.module('defaultModule', {})
            .$system('defaultSystem');
        defaultWorld = darlingjs.world('defaultWorld', ['defaultModule']);
    });

    afterEach(function() {
        darlingjs.removeAllModules();
        darlingjs.removeAllWorlds();
    });

    it('should be added to the module', function() {
        var m = darlingjs.module('theModule', {})
            .$system('theSystem');

        expect(m.$has('theSystem')).toBe(true);
    });

    it('should be added to the world', function() {
        darlingjs.module('testModule', {})
            .$system('testSystem');

        var world = darlingjs.world('testWorld', ['testModule']);
        world.$add('testSystem');
        expect(world.$isUse('testSystem')).toBe(true);
    });

    it('should has no any nodes by default', function() {
        var system = defaultWorld.$add('defaultSystem');
        expect(system.$nodes.length()).toBe(0);
    });

    it(' after been added to world should fetch required nodes from world', function() {
        darlingjs.module('testModule')
            .$c('theComponent')
            .$system('testSystem', {
                $require: ['theComponent']
            });

        var world = darlingjs.world('testWorld', ['testModule']);
        var entity = world.$e('theEntity', ['theComponent']);
        world.$add(entity);
        var system = world.$add('testSystem');
        expect(system.$nodes.length()).toBe(1);
        system.$nodes.forEach(function(e) {
            expect(e).toBe(entity);
        });
    });

    it('should fetch entity to $nodes after entity been added', function() {
        darlingjs.module('testModule')
            .$c('theComponent')
            .$system('testSystem', {
                $require: ['theComponent']
            });

        var world = darlingjs.world('testWorld', ['testModule']);
        var entity = world.$e('theEntity', ['theComponent']);
        var system = world.$add('testSystem');
        world.$add(entity);
        expect(system.$nodes.length()).toBe(1);
        system.$nodes.forEach(function(e) {
            expect(e).toBe(entity);
        });
    });

    it('should remove entity from $nodes after entity been removed', function() {
        darlingjs.module('testModule')
            .$c('theComponent')
            .$system('testSystem', {
                $require: ['theComponent']
            });

        var world = darlingjs.world('testWorld', ['testModule']);
        var entity = world.$e('theEntity', ['theComponent']);
        var system = world.$add('testSystem');
        world.$add(entity);
        world.$remove(entity);
        expect(system.$nodes.length()).toBe(0);
    });

    it('should fetch entity to $nodes after required component been added to entity', function() {
        darlingjs.module('testModule')
            .$c('theComponent')
            .$system('testSystem', {
                $require: ['theComponent']
            });

        var world = darlingjs.world('testWorld', ['testModule']);
        var entity = world.$e('theEntity');
        var system = world.$add('testSystem');
        world.$add(entity);
        entity.$add('theComponent');

        expect(system.$nodes.length()).toBe(1);
        system.$nodes.forEach(function(e) {
            expect(e).toBe(entity);
        });
    });

    it('should remove entity from $nodes after required component been removed from entity', function() {
        darlingjs.module('testModule')
            .$c('theComponent')
            .$system('testSystem', {
                $require: ['theComponent']
            });

        var world = darlingjs.world('testWorld', ['testModule']);
        var entity = world.$e('theEntity', ['theComponent']);
        var system = world.$add('testSystem');
        world.$add(entity);
        entity.$remove('theComponent');
        expect(system.$nodes.length()).toBe(0);
    });

    it('should invoke $added on system added to world', function() {
        var addedHandler = sinon.spy();
        darlingjs.module('testModule')
            .$c('theComponent')
            .$system('testSystem', {
                $added: addedHandler
            });

        var world = darlingjs.world('testWorld', ['testModule']);
        world.$add('testSystem');

        expect(addedHandler.callCount).toBe(1);
    });

    it('should invoke $removed on system remove from world', function() {
        var removedHandler = sinon.spy();
        darlingjs.module('testModule')
            .$c('theComponent')
            .$system('testSystem', {
                $removed: removedHandler
            });

        var world = darlingjs.world('testWorld', ['testModule']);
        var system = world.$add('testSystem');
        world.$add(world.$e('theEntity', ['theComponent']));
        world.$remove(system);

        expect(removedHandler.callCount).toBe(1);
        expect(system.$nodes.length()).toBe(0);
    });

    it('should run update once for $nodes request.', function() {
        var updateHandler = sinon.spy();
        darlingjs.module('testModule')
            .$c('theComponent')
            .$system('testSystem', {
                $require: ['theComponent'],
                $update: ['$nodes', '$time', updateHandler]
            });

        var world = darlingjs.world('testWorld', ['testModule']);
        var system = world.$add('testSystem');
        world.$update(11);

        expect(updateHandler.callCount).toBe(1);
        expect(updateHandler.calledWith(system.$nodes, 11)).toBeTruthy();
    });

    it('should inject the World instance to update by $world argument', function() {
        var updateHandler = sinon.spy();
        darlingjs.module('testModule')
            .$c('theComponent')
            .$system('testSystem', {
                $require: ['theComponent'],
                $update: ['$world', updateHandler]
            });

        var world = darlingjs.world('testWorld', ['testModule']);
        world.$add('testSystem');
        world.$update(11);
        expect(updateHandler.callCount).toBe(1);
        expect(updateHandler.calledWith(world)).toBeTruthy();
    });

    it('should run update for each request $node.', function() {
        var updateHandler = sinon.spy();
        darlingjs.module('testModule')
            .$c('theComponent')
            .$system('testSystem', {
                $require: ['theComponent'],
                $update: ['$node', '$time', updateHandler]
            });

        var world = darlingjs.world('testWorld', ['testModule']);

        world.$add('testSystem');

        var entities = [];
        for(var i = 0, l = 3; i < l; i++) {
            var e = world.$e('theEntity_' + i, ['theComponent']);
            entities.push(world.$add(e));
        }

        world.$update(11);

        expect(updateHandler.callCount).toBe(3);
        expect(updateHandler.calledWith(entities[0], 11)).toBeTruthy();
        expect(updateHandler.calledWith(entities[1], 11)).toBeTruthy();
        expect(updateHandler.calledWith(entities[2], 11)).toBeTruthy();
    });

    it('should execute $addNode handler on node is adding', function() {
        var addHandler = sinon.spy();
        var removeHandler = sinon.spy();
        darlingjs.module('testModule')
            .$c('theComponent')
            .$system('testSystem', {
                $require: ['theComponent'],
                $addNode: addHandler,
                $removeNode: removeHandler
            });
        var world = darlingjs.world('testWorld', ['testModule']);
        world.$add('testSystem');
        var entities = [];
        for(var i = 0, l = 3; i < l; i++) {
            var e = world.$e('theEntity_' + i, ['theComponent']);
            entities.push(world.$add(e));
        }

        expect(addHandler.callCount).toBe(3);
        expect(addHandler.calledWith(entities[0])).toBeTruthy();
        expect(addHandler.calledWith(entities[1])).toBeTruthy();
        expect(addHandler.calledWith(entities[2])).toBeTruthy();
        expect(removeHandler.callCount).toBe(0);
    });


    it('should execute $addRemove handler on node is removing', function() {
        var addHandler = sinon.spy();
        var removeHandler = sinon.spy();
        darlingjs.module('testModule')
            .$c('theComponent')
            .$system('testSystem', {
                $require: ['theComponent'],
                $addNode: addHandler,
                $removeNode: removeHandler
            });
        var world = darlingjs.world('testWorld', ['testModule']);
        world.$add('testSystem');

        var entities = [];
        var i, l;
        for(i = 0, l = 3; i < l; i++) {
            var e = world.$e('theEntity_' + i, ['theComponent']);
            entities.push(world.$add(e));
        }

        for(i = 0, l = entities.length; i < l; i++) {
            world.$remove(entities[i]);
        }

        expect(addHandler.callCount).toBe(3);
        expect(removeHandler.callCount).toBe(3);
        expect(removeHandler.calledWith(entities[0])).toBeTruthy();
        expect(removeHandler.calledWith(entities[1])).toBeTruthy();
        expect(removeHandler.calledWith(entities[2])).toBeTruthy();
    });

    it('should inject other systems in $added', function() {
        var handler = sinon.spy();

        darlingjs.module('testModule')
            .$c('theComponent')
            .$system('testSystem1', {
            })
            .$system('testSystem2', {
                $require: ['theComponent'],
                $added: ['testSystem1', handler]
            });

        var world = darlingjs.world('testWorld', ['testModule']);
        var s1 = world.$add('testSystem1');
        world.$add('testSystem2');

        expect(handler.callCount).toBe(1);
        expect(handler.calledWith(s1)).toBeTruthy();
    });

    it('should inject other systems in $removed', function() {
        var handler = sinon.spy();
        darlingjs.module('testModule')
            .$c('theComponent')
            .$system('testSystem1', {

            })
            .$system('testSystem2', {
                $require: ['theComponent'],
                $removed: ['testSystem1', handler]
            });
        var world = darlingjs.world('testWorld', ['testModule']);
        var s1 = world.$add('testSystem1');
        var s2 = world.$add('testSystem2');
        world.$remove(s2);

        expect(handler.callCount).toBe(1);
        expect(handler.calledWith(s1)).toBeTruthy();
    });

    it('should inject other systems in $addNode', function() {
        var handler = sinon.spy();
        darlingjs.module('testModule')
            .$c('theComponent')
            .$system('testSystem1', {

            })
            .$system('testSystem2', {
                $require: ['theComponent'],
                $addNode: ['testSystem1', '$node', handler]
            });
        var world = darlingjs.world('testWorld', ['testModule']);
        var s1 = world.$add('testSystem1');
        var s2 = world.$add('testSystem2');
        var e = world.$e('theEntity', ['theComponent']);
        world.$add(e);

        expect(handler.callCount).toBe(1);
        expect(handler.calledWith(s1, e)).toBeTruthy();
    });


    it('should inject other systems in $removeNode', function() {
        var handler = sinon.spy();
        darlingjs.module('testModule')
            .$c('theComponent')
            .$system('testSystem1', {

            })
            .$system('testSystem2', {
                $require: ['theComponent'],
                $removeNode: ['testSystem1', '$node', handler]
            });
        var world = darlingjs.world('testWorld', ['testModule']);
        var s1 = world.$add('testSystem1');
        var s2 = world.$add('testSystem2');
        var e = world.$e('theEntity', ['theComponent']);
        world.$add(e);
        world.$remove(e);

        expect(handler.callCount).toBe(1);
        expect(handler.calledWith(s1, e)).toBeTruthy();
    });


    it('should inject other systems in $removeNode', function() {
        var handler = sinon.spy();
        darlingjs.module('testModule')
            .$c('theComponent')
            .$system('testSystem1', {

            })
            .$system('testSystem2', {
                $require: ['theComponent'],
                $update: ['testSystem1', '$nodes', handler]
            });
        var world = darlingjs.world('testWorld', ['testModule']);
        var s1 = world.$add('testSystem1');
        var s2 = world.$add('testSystem2');
        var e = world.$e('theEntity', ['theComponent']);
        world.$add(e);
        world.$update(1);

        expect(handler.callCount).toBe(1);
        expect(handler.calledWith(s1, s2.$nodes)).toBeTruthy();
    });

    //TODO: Add complete injector
})