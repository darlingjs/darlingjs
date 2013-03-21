'use strict';
/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

describe('entity', function() {
    var module,
        world;

    beforeEach(function () {
        module = GameEngine.module('theModule', {})
                           .s('theSystem')
                           .c('theComponent');
        world = GameEngine.world('theWorld', ['theModule']);
    });

    afterEach(function() {
        GameEngine.removeAllModules();
        GameEngine.removeAllWorlds();
    });

    it('should throw exception on add null component', function() {
        var e = world.entity('theEntity');
        expect(function() {
            e.$add(null);
        }).toThrow();
        expect(function() {
            e.$add('name');
        }).toThrow();
    });

    it('should add component in entity scope', function() {
        var e = world.entity('theEntity');
        e.$add('theComponent', { x : 10});
        expect(e.theComponent).toBeDefined();
        expect(e.theComponent.x).toBe(10);
        expect(e.theComponent.y).not.toBeDefined();
    });

    it('should has added component', function() {
        var e = world.entity('theEntity');
        e.$add('theComponent', {});
        expect(e.$has('theComponent')).toBe(true);
    });

    it('should be able to remove component', function() {
        var e = world.entity('theEntity');
        e.$add('theComponent', {});
        e.$remove('theComponent');
        expect(e.$has('theComponent')).toBe(false);
        expect(e.theComponent).not.toBeDefined();
    });
})