'use strict';
/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

describe('entity', function() {
    var module,
        world;

    beforeEach(function () {
        module = darlingjs.module('theModule', {})
                           .s('theSystem')
                           .c('theComponent', {
                                z: 99
                            });
        world = darlingjs.world('theWorld', ['theModule']);
    });

    afterEach(function() {
        darlingjs.removeAllModules();
        darlingjs.removeAllWorlds();
    });

    it('should throw exception on add null component', function() {
        var e = world.$entity('theEntity');
        expect(function() {
            e.$add(null);
        }).toThrow();
        expect(function() {
            e.$add('name');
        }).toThrow();
    });

    it('should add component in entity scope', function() {
        var e = world.$entity('theEntity');
        e.$add('theComponent', { x : 10});
        expect(e.theComponent).toBeDefined();
        expect(e.theComponent.x).toBe(10);
        expect(e.theComponent.y).not.toBeDefined();
        expect(e.theComponent.z).toBe(99);
    });

    it('should has added component', function() {
        var e = world.$entity('theEntity');
        e.$add('theComponent');
        expect(e.$has('theComponent')).toBe(true);
    });

    it('should be able to remove component', function() {
        var e = world.$entity('theEntity');
        e.$add('theComponent', {});
        e.$remove('theComponent');
        expect(e.$has('theComponent')).toBe(false);
        expect(e.theComponent).not.toBeDefined();
    });

    it('should trigger event after add component', function() {
        var e = world.$entity('theEntity');
        var handler = sinon.spy();
        e.on('add', handler);
        var c = e.$add('theComponent');

        expect(handler.calledOnce).toBeTruthy();
        expect(handler.calledWith(e, c)).toBeTruthy();
    });

    it('should trigger event after remove component', function() {
        var e = world.$entity('theEntity');
        var handler = sinon.spy();
        e.on('remove', handler);
        e.$remove('theComponent');
        var c = e.$add('theComponent');
        e.$remove('theComponent');

        expect(handler.calledOnce).toBeTruthy();
        expect(handler.calledWith(e, c)).toBeTruthy();
    });
})