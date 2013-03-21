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

    /*
    it('should match component to corresponding system', function() {
        //TODO:
    });
    */
});