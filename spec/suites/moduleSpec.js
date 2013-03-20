'use strict';
/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

describe('module', function() {
    var module;
    beforeEach(function() {
        module = GameEngine.m('testModule1');
    });

    afterEach(function() {
        GameEngine.removeAllModules();
        GameEngine.removeAllWorlds();
    });

    it('should has created components', function() {
        module.c('testComponent');
        expect(module.has('testComponent')).toEqual(true);
    });
});