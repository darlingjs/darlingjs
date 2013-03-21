'use strict';
/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

describe('system', function() {
    beforeEach(function() {
    });

    afterEach(function() {
        GameEngine.removeAllModules();
        GameEngine.removeAllWorlds();
    });

    it('should be added to the module', function() {
        var m = GameEngine.module('theModule', {})
            .system('theSystem');

        expect(m.has('theSystem')).toBe(true);
    });

    it('should be added to the world', function() {
        GameEngine.module('testModule', {})
            .system('testSystem');

        var world = GameEngine.world('testWorld', ['testModule']);
        world.add('testSystem');
        expect(world.isUse('testSystem')).toBe(true);
    });

    /*
    it('should match component by require', function() {
        GameEngine.module('testModule')
            .system('testSystem', {
                require: [],
                update: function($node) {

                }
            });
        var world = GameEngine.world('testWorld', ['testModule']);
        world.add('testSystem');
    });

    it('should get all nodes on update', function() {
        GameEngine.module('testModule')
            .system('testSystem', {
                require: [],
                update: function($nodes) {

                }
            });
        var world = GameEngine.world('testWorld', ['testModule']);
        world.add('testSystem');
    });
    */
    //TODO
    //update($node) update($time) update($world)
    //addNode, removeNode
})