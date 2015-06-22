/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

var darlingjs = require('./../../../');
var sinon = require('sinon');

describe('module', function() {
    'use strict';

    var module;
    beforeEach(function() {
        module = darlingjs.m('theModule');
    });

    afterEach(function() {
        darlingjs.removeModule('theModule');
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