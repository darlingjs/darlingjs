'use strict';
/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

describe('system', function() {
    var world;
    var system;
    beforeEach(function() {
    });

    afterEach(function() {
        GameEngine.removeAllModules();
        GameEngine.removeAllWorlds();
    });

    it('should be addable to world', function() {
        GameEngine.module('testModule')
            .system('testSystem');
        world = GameEngine.world('testWorld', ['testModule']);
        world.add('testSystem');
    });

    it('should match component by require', function() {
        GameEngine.module('testModule')
            .system('testSystem', {
                require: [],
                update: function($node) {

                }
            });
        world = GameEngine.world('testWorld', ['testModule']);
        world.add('testSystem');
    });

    it('should get all nodes on update', function() {
        GameEngine.module('testModule')
            .system('testSystem', {
                require: [],
                update: function($nodes) {

                }
            });
        world = GameEngine.world('testWorld', ['testModule']);
        world.add('testSystem');
    });

    //TODO
    //update($node) update($time) update($world)
    //addNode, removeNode
})