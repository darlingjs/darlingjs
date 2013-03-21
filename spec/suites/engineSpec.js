'use strict';
/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

describe('darling', function() {
    afterEach(function() {
        GameEngine.removeAllModules();
        GameEngine.removeAllWorlds();
    });

    it('should create module', function() {
        var m = GameEngine.module('theModule');
        expect(m).toBeDefined();
    });

    it('should throws an exception on create module with same name', function() {
        GameEngine.module('theModule');
        expect( function() {
            GameEngine.module('theModule');
        }).toThrow();
    });

    it('should to create to different module with different states.', function() {
        var m1 = GameEngine.module('theModule1')
            .system('theSystem1');
        var m2 = GameEngine.module('theModule2')
            .system('theSystem2');

        expect(m1).not.toBe(m2);
        expect(m1.name).not.toBe(m2.name);
        expect(m1.$$systems).not.toBe(m2.$$systems);
    });

    it('should set module name', function() {
        var m = GameEngine.module('module1', []);
        expect(m.name).toEqual('module1');
    });

    it('should create world', function() {
        var w = GameEngine.world('', []);
        expect(w).toBeDefined();
    });

    it('should throws an exception on create world with same name', function() {
        GameEngine.world('theWorld');
        expect( function() {
            GameEngine.world('theWorld');
        }).toThrow();
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
    });

    it('should remove modules by removeAllModules', function() {
        GameEngine.module('theModule');
        GameEngine.removeAllModules();
        expect( function() {
            GameEngine.module('theModule');
        }).not.toThrow();
    });

    it('should to modules has different collection of systems', function() {
        var m1 = GameEngine.module('theModule1')
            .system('theSystem1');
        var m2 = GameEngine.module('theModule2')
            .system('theSystem2');

        expect(m1.has('theSystem1')).toBe(true);
        expect(m1.has('theSystem2')).not.toBe(true);
        expect(m2.has('theSystem2')).toBe(true);
        expect(m2.has('theSystem1')).not.toBe(true);
    });

    it('should to clean modules after removeAllModules', function() {
        GameEngine.module('theModule')
            .system('theSystem');
        GameEngine.removeAllModules();
        expect(GameEngine.module('theModule').has('theSystem')).not.toBe(true);
    });

    it('should remove world by removeAllModules', function() {
        GameEngine.world('theWorld');
        GameEngine.removeAllWorlds();
        expect( function() {
            GameEngine.world('theWorld');
        }).not.toThrow();
    });
});