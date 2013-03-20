'use strict';
/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

describe('GameEngine', function() {
    afterEach(function() {
        GameEngine.removeAllModules();
        GameEngine.removeAllWorlds();
    });

    it('should create module', function() {
        var m = GameEngine.module();
        expect(m).toBeDefined();
    });

    it('should set module name', function() {
        var m = GameEngine.module('module1', []);
        expect(m.name).toEqual('module1');
    });

    it('should create world', function() {
        var w = GameEngine.world('', []);
        expect(w).toBeDefined();
    });

    it('should set module name', function() {
        var w = GameEngine.world('world');
        expect(w.name).toEqual('world');
    });

    it('should inject module to created world', function() {
        GameEngine.module('testModule1', []);
        var w = GameEngine.world('testWorld1', ['testModule1']);
        expect(w.has('testModule1')).toEqual(true);
    });

    it('should inject to world all components from module', function() {
        GameEngine.module('testModule1', [])
            .c('testComponent1')
            .c('testComponent2');
        var w = GameEngine.world('testWorld1', ['testModule1']);
        expect(w.has('testComponent1')).toEqual(true);
        expect(w.has('testComponent2')).toEqual(true);
    })
});