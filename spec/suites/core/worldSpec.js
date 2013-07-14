/*jslint node: true */
'use strict';

/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

describe('World', function() {
    var world;
    var module;

    beforeEach(function() {
        module = darlingjs.module('theModule1')
            .$c('testComponent1', {
                x: 12,
                y: 34
            })
            .$c('testComponent2', {
                text: 'hello'
            })
            .$c('testComponent3', {
                world: 'new brave'
            });

        world = darlingjs.world('world', ['theModule1']);
    });

    afterEach(function() {
        darlingjs.removeModule('theModule1');
        darlingjs.removeModule('theModule');
        darlingjs.removeAllWorlds();
    });

    it('should create entity by world.entity() and world.e()', function() {
        var e = world.$entity();
        expect(e).toBeDefined();

        e = world.$e();
        expect(e).toBeDefined();
    });

    it('should create entity with name', function() {
        var e = world.$entity('name');
        expect(e.$name).toEqual('name');
    });

    it('should hasn\'t wrong component and modules', function() {
        expect(world.$has('wrong component')).not.toEqual(true);
        expect(world.$has('wrong module')).not.toEqual(true);
    })

    it('should load requested module', function() {
        expect(world.$has('theModule1')).toEqual(true);
    });

    it('should load component from requested module', function() {
        expect(world.$has('testComponent1')).toEqual(true);
    });

    it('should create entity with component with default state', function() {
        var e = world.$entity('name', ['testComponent1']);

        expect(e.testComponent1).toBeDefined();
        expect(e.testComponent1.x).toEqual(12);
        expect(e.testComponent1.y).toEqual(34);
    });

    it('should override default state of entity', function() {
        var e = world.$entity('name', [
            'testComponent1', {x: 0, y: 1, z: 2}
        ]);

        expect(e.testComponent1).toBeDefined();
        expect(e.testComponent1.x).toEqual(0);
        expect(e.testComponent1.y).toEqual(1);
        expect(e.testComponent1.z).toEqual(2);
    });

    it('should create entity by object of component description', function() {
        var e = world.$e('theEntity', {
            'testComponent1': {x: 10},
            'testComponent2': {}
        });

        expect(e.testComponent1).toBeDefined();
        expect(e.testComponent1.x).toEqual(10);
        expect(e.testComponent1.y).toEqual(34);
        expect(e.testComponent2.text).toEqual('hello');
    });

    it('after added entity should return proper count', function() {
        var e1 = world.$entity('entity1', ['testComponent1']);
        var e2 = world.$entity('entity2', ['testComponent2']);
        var e3 = world.$entity('entity3', ['testComponent2']);
        expect(world.$numEntities()).toBe(3);
        var elements = [];
        world.$entities.forEach(function(e) {
            elements.push(e);
        });
        expect(elements[0]).toBe(e1);
        expect(elements[1]).toBe(e2);
        expect(elements[2]).toBe(e3);
        expect(elements.length).toBe(3);
    });

    it('should manually adding entity on $e(name, config, true)', function() {
        var e1 = world.$entity('entity1', ['testComponent1'], true);

        expect(world.$numEntities()).toBe(0);
        world.$add(e1);
        expect(world.$numEntities()).toBe(1);
    });

    it('after added and removed entity should return proper count', function() {
        var e1 = world.$entity('entity1', ['testComponent1']);
        var e2 = world.$entity('entity2', ['testComponent2']);
        var e3 = world.$entity('entity3', ['testComponent2']);

        world.$remove(e3);
        world.$remove(e2);
        world.$remove(e1);
        expect(world.$numEntities()).toBe(0);
    });

    it('should remove all entities on $removeAllEntities', function(){
        var world = darlingjs.world('testWorld');
        var count = 10;
        while(--count>=0) {
            world.$e('theEntity-' + count);
        }
        expect(world.$numEntities()).toBe(10);
        world.$removeAllEntities();
        expect(world.$numEntities()).toBe(0);
    });

    it('should return by one component', function() {
        var e1 = world.$entity('entity1', ['testComponent1']);
        var e2 = world.$entity('entity2', ['testComponent2']);
        var e3 = world.$entity('entity3', ['testComponent3']);

        var e1List = world.$queryByComponents('testComponent1');
        expect(e1List.length()).toBe(1);
        e1List.forEach(function(e) {
            expect(e).toBe(e1);
        });
        var e2List = world.$queryByComponents('testComponent2');
        expect(e2List.length()).toBe(1);
        e2List.forEach(function(e) {
            expect(e).toBe(e2);
        });
        var e3List = world.$queryByComponents('testComponent3');
        expect(e3List.length()).toBe(1);
        e3List.forEach(function(e) {
            expect(e).toBe(e3);
        });
    });

    it('should return by two components', function() {
        var e1 = world.$entity('entity1', ['testComponent1']);
        var e2 = world.$entity('entity2', ['testComponent1', 'testComponent2']);
        var e3 = world.$entity('entity3', ['testComponent1', 'testComponent2', 'testComponent3']);

        var e1List = world.$queryByComponents(['testComponent1', 'testComponent2']);
        expect(e1List.length()).toBe(2);
        var elements = [];
        e1List.forEach(function(e) {
            elements.push(e);
        });
    });

    it('should build component with default state', function() {
        var c = world.$component('testComponent1');
        expect(c).toBeDefined();
        expect(c.x).toBe(12);
        expect(c.y).toBe(34);
    });

    it('should build component and override default state', function() {
        var c = world.$component('testComponent1', {
            x:15
        });
        expect(c).toBeDefined();
        expect(c.x).toBe(15);
        expect(c.y).toBe(34);
    });

    it('should use swallow copy for custom state', function() {
        var position = {x:1, y:2};
        var c = world.$component('testComponent1', {
            position: position
        });
        expect(c).toBeDefined();
        expect(c.position).toBe(position);
    });

    it('should build custom component by config', function() {
        var c = world.$component('customComponent', {
            x: 1,
            y: 2
        });
        expect(c).toBeDefined();
        expect(c.x).toBe(1);
        expect(c.y).toBe(2);
    });

    it('shouldn\'t build custom component without configuration', function() {
        expect(function() {
            world.$component('wrongComponent');
        }).toThrow();
    });

    it('should use custom component on creating entity', function() {
        world.$component('customComponent', {
            x: 1,
            y: 2
        });

        var e = world.$entity('theEntity', ['customComponent']);

        expect(e).toBeDefined();
        expect(e.customComponent).toBeDefined();
        expect(e.customComponent.x).toBe(1);
        expect(e.customComponent.y).toBe(2);
    });

    it('should execute update handler on update.', function() {
        var updateHandler = sinon.spy();
        darlingjs.module('theModule')
            .$c('theComponent')
            .$system('testSystem', {
                require: ['theComponent'],
                $update: updateHandler
            });

        var world = darlingjs.world('testWorld', ['theModule']);
        world.$add('testSystem');
        world.$update(11);
        expect(updateHandler.calledOnce).toBeTruthy();
        expect(updateHandler.calledWith(11)).toBeTruthy();
    });

    it('should instantiate system by name and add it', function() {
        darlingjs.module('theModule')
            .$c('theComponent')
            .$system('testSystem', {
                x: 10,
                y: 20
            });

        var world = darlingjs.world('testWorld', ['theModule']);
        var system = world.$system('testSystem', {
            z: 30
        });

        expect(system).toBeDefined();
        expect(system.x).toBe(10);
        expect(system.y).toBe(20);
        expect(system.z).toBe(30);
        expect(world.$isUse(system)).toBeTruthy();
    });

    it('should added my instance', function() {
        darlingjs.module('theModule')
            .$c('theComponent')
            .$system('testSystem');

        var world1 = darlingjs.world('testWorld1', ['theModule']);
        var world2 = darlingjs.world('testWorld2', ['theModule']);

        var systemInstance = world1.$system('testSystem');
        world2.$add(systemInstance);

        expect(world2.$isUse(systemInstance)).toBeTruthy();
    });

    it('should update every requestAnimationFrame on $start and stop after $stop', function() {
        var updateHandler;
        var world;
        var flag;

        runs(function() {
            updateHandler = sinon.spy();
            darlingjs.module('theModule')
                .$c('theComponent')
                .$system('testSystem', {
                    require: ['theComponent'],
                    $update: updateHandler
                });

            world = darlingjs.world('testWorld', ['theModule']);
            world.$add('testSystem');
            world.$start();
            expect(world.$playing).toBeTruthy();
        });

        waitsFor(function() {
            return updateHandler.callCount === 3;
        }, 'The updateHandler should be called sometimes.', 500);


        runs(function() {
            world.$stop();
            setTimeout(function() {
                flag = true;
            }, 500);
        });

        waitsFor(function() {
            return flag;
        }, 'Wait 500ms', 1000);

        runs(function() {
            expect(updateHandler.callCount).toBe(3);
        });
    });

    it('should execute update in sequence: $beforeUpdate(), $update() and $afterUpdate()', function() {
        var beforeUpdateHandler = sinon.spy();
        var updateHandler = sinon.spy();
        var afterUpdateHandler = sinon.spy();

        darlingjs.module('theModule')
            .$c('theComponent')
            .$system('testSystem', {
                require: ['theComponent'],
                $beforeUpdate: beforeUpdateHandler,
                $update: updateHandler,
                $afterUpdate: afterUpdateHandler
            });

        var world = darlingjs.world('testWorld', ['theModule']);
        world.$add('testSystem');
        world.$update(11);

        sinon.assert.callOrder(beforeUpdateHandler, updateHandler, afterUpdateHandler);
    });

    it('should execute update in sequence: $beforeUpdate(), $update($node) and $afterUpdate()', function() {
        var beforeUpdateHandler = sinon.spy();
        var updateHandler = sinon.spy();
        var afterUpdateHandler = sinon.spy();

        darlingjs.module('theModule')
            .$c('theComponent')
            .$system('testSystem', {
                $require: ['theComponent'],
                $beforeUpdate: beforeUpdateHandler,
                $update: ['$node', updateHandler],
                $afterUpdate: afterUpdateHandler
            });

        var world = darlingjs.world('testWorld', ['theModule']);

        world.$add('testSystem');
        world.$e('theEntity', ['theComponent']);

        world.$update(11);

        sinon.assert.callOrder(beforeUpdateHandler, updateHandler, afterUpdateHandler);
    });

    it('should inject $entities in $beforeUpdate and $afterUpdate', function() {
        var beforeUpdateHandler = sinon.spy();
        var updateHandler = sinon.spy();
        var afterUpdateHandler = sinon.spy();

        darlingjs.module('theModule')
            .$c('theComponent')
            .$system('testSystem', {
                require: ['theComponent'],
                $beforeUpdate: ['$entities', beforeUpdateHandler],
                $update: updateHandler,
                $afterUpdate: ['$entities', afterUpdateHandler]
            });

        var world = darlingjs.world('testWorld', ['theModule']);
        var c = world.$add('testSystem');
        world.$update(11);
        expect(beforeUpdateHandler.calledWith(c.$nodes)).toBeTruthy();
        expect(afterUpdateHandler.calledWith(c.$nodes)).toBeTruthy();
    });

    it('should return entity by name with $getByName', function() {
        var e1 = world.$entity('theEntity1');
        var e2 = world.$entity('theEntity2');
        expect(world.$getByName('theEntity1')).toBe(e1);
        expect(world.$getByName('theEntity2')).toBe(e2);
        expect(world.$getByName('theEntity3')).toBeNull();
    });

    it('should get name from component description if it does\'t set as 1st argument', function() {
        var e = world.$e({
            $name: 'theEntity'
        });
        expect(e.$name).toBe('theEntity');
    });

    it('should build custom system and add it to self, if config is define and name doesn\'t fit any defined systems', function() {
        var system = world.$system('theBrandNewSystem', {
            $require: ['theComponent'],
            sum: 0.0,

            $update: ['$node', function($node) {
                sum += $node.theComponent.value;
            }]
        });

        expect(system).not.toBeNull();
        expect(world.$isUse(system)).toBeTruthy();
        expect(world.$isUse('theBrandNewSystem')).toBeTruthy();
    });

    it('should build entity with nulled component, if it configed by false', function() {
        var e = world.$e('theEntity', {
            testComponent1: false
        });

        expect(e.testComponent1).toBeNull();
    });

    it('should build entity with default component, if in configed by true', function() {
        var e = world.$e('theEntity', {
            testComponent1: true
        });

        expect(e.testComponent1).not.toBeNull();
        expect(e.testComponent1.x).toBe(12);
        expect(e.testComponent1.y).toBe(34);
    });

    it('should throw exception if try to edd missing system', function() {
        expect(function() {
            world.$add('wrong-named-system');
        }).toThrow();
    });

    it('should remove all systems on $removeAllSystems', function() {
        var removeHandler = sinon.spy();
        var removeEntityHandler = sinon.spy();
        darlingjs.module('theModule')
            .$c('theComponent')
            .$system('testSystem', {
                $require: ['theComponent'],
                $removed: removeHandler,
                $removeEntity: removeEntityHandler
            });

        var world = darlingjs.world('testWorld', ['theModule']);
        var system = world.$add('testSystem');
        world.$e('theEntity', ['theComponent']);
        expect(system.$nodes.length()).toBe(1);
        world.$removeAllSystems();
        expect(system.$nodes.length()).toBe(0);
        expect(world.$isUse('testSystem')).toBeFalsy();
        expect(removeHandler.calledOnce).toBeTruthy();
    });
});