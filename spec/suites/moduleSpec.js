'use strict';
/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

describe('module', function() {
    var module;
    beforeEach(function() {
        module = darlingjs.m('testModule1');
    });

    afterEach(function() {
        darlingjs.removeAllModules();
        darlingjs.removeAllWorlds();
    });

    it('should has created components', function() {
        module.$c('testComponent');
        expect(module.$has('testComponent')).toEqual(true);
    });

    it('should create system', function() {
        var s = module.$system('theSystem');
        expect(s).toBeDefined();
    });
});