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
        module = GameEngine.module('testModule1')
            .c('testComponent1', {
                x: 12,
                y: 34
            })
            .c('testComponent2', {
                name: 'hello'
            })
            .c('testComponent3', {
                world: 'new brave'
            });

        world = GameEngine.world('world', ['testModule1']);
    });

    afterEach(function() {
        GameEngine.removeAllModules();
        GameEngine.removeAllWorlds();
    });

    it('should create entity by world.entity() and world.e()', function() {
        var e = world.entity();
        expect(e).toBeDefined();

        e = world.e();
        expect(e).toBeDefined();
    });

    it('should create entity with name', function() {
        var e = world.entity('name');
        expect(e.name).toEqual('name');
    });

    it('should hasn\'t wrong component and modules', function() {
        expect(world.has('wrong component')).not.toEqual(true);
        expect(world.has('wrong module')).not.toEqual(true);
    })

    it('should load requested module', function() {
        expect(world.has('testModule1')).toEqual(true);
    });

    it('should load component from requested module', function() {
        expect(world.has('testComponent1')).toEqual(true);
    });

    it('should create entity with component with default state', function() {
        var e = world.entity('name', ['testComponent1']);

        expect(e.testComponent1).toBeDefined();
        expect(e.testComponent1.x).toEqual(12);
        expect(e.testComponent1.y).toEqual(34);
    });

    it('should can\' override defulat state of entity', function() {
        var e = world.entity('name', [
            'testComponent1', {x: 0, y: 1, z: 2}
        ]);

        expect(e.testComponent1).toBeDefined();
        expect(e.testComponent1.x).toEqual(0);
        expect(e.testComponent1.y).toEqual(1);
        expect(e.testComponent1.z).toEqual(2);
    });

    it('after added entity should return proper count', function() {
        var e1 = world.entity('entity1', ['testComponent1']);
        var e2 = world.entity('entity2', ['testComponent2']);
        var e3 = world.entity('entity3', ['testComponent2']);
        world.add(e1);
        world.add(e2);
        world.add(e3);
        expect(world.numEntities()).toBe(3);
        var elements = [];
        world.$entities.forEach(function(e) {
            elements.push(e);
        });
        expect(elements[0]).toBe(e1);
        expect(elements[1]).toBe(e2);
        expect(elements[2]).toBe(e3);
        expect(elements.length).toBe(3);
    });

    it('after added and removed entity should return proper count', function() {
        var e1 = world.entity('entity1', ['testComponent1']);
        var e2 = world.entity('entity2', ['testComponent2']);
        var e3 = world.entity('entity3', ['testComponent2']);
        world.add(e1);
        world.add(e2);
        world.add(e3);
        world.remove(e3);
        world.remove(e2);
        world.remove(e1);
        expect(world.numEntities()).toBe(0);
    });

    it('should return by one component', function() {
        var e1 = world.entity('entity1', ['testComponent1']);
        var e2 = world.entity('entity2', ['testComponent2']);
        var e3 = world.entity('entity3', ['testComponent3']);
        world.add(e1);
        world.add(e2);
        world.add(e3);

        var e1List = world.byComponents('testComponent1');
        expect(e1List.length()).toBe(1);
        e1List.forEach(function(e) {
            expect(e).toBe(e1);
        });
        var e2List = world.byComponents('testComponent2');
        expect(e2List.length()).toBe(1);
        e2List.forEach(function(e) {
            expect(e).toBe(e2);
        });
        var e3List = world.byComponents('testComponent3');
        expect(e3List.length()).toBe(1);
        e3List.forEach(function(e) {
            expect(e).toBe(e3);
        });
    });

    it('should return by two components', function() {
        var e1 = world.entity('entity1', ['testComponent1']);
        var e2 = world.entity('entity2', ['testComponent1', 'testComponent2']);
        var e3 = world.entity('entity3', ['testComponent1', 'testComponent2', 'testComponent3']);
        world.add(e1);
        world.add(e2);
        world.add(e3);
        var e1List = world.byComponents(['testComponent1', 'testComponent2']);
        expect(e1List.length()).toBe(2);
        var elements = [];
        e1List.forEach(function(e) {
            elements.push(e);
        });
    });

    /*
    it('should has entity after it has been added', function() {
        var e = world.e('theEntity');
        world.add(e);
        expect(world.numEntities()).toBe(1);
        expect(world.getEntityByIndex(0)).toBe(e);
    });

    it('should match component to corresponding system', function() {
        //TODO:
    });
    */
});