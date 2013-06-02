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
                           .$s('theSystem')
                           .$c('theComponent', {
                                z: 99
                            })
                            .$c('theComponent2', {
                                x: 1,
                                y: 2
                            });;
        world = darlingjs.world('theWorld', ['theModule']);
    });

    afterEach(function() {
        darlingjs.removeModule('theModule');
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
        expect(!!e.theComponent).toBeFalsy();
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

    it('should set component name', function() {
        var e = world.$entity('theEntity');
        var c = e.$add('theComponent');
        expect(c.$name).toBe('theComponent');
    });

    it('should add component by instance', function() {
        var e = world.$entity('theEntity');
        e.$add('theComponent');
        var c = e.$remove('theComponent');
        e.$add(c);
        expect(e.$has(c)).toBe(true);
    });

    it('should add component by instance', function() {
        var e = world.$entity('theEntity');
        var c = e.$add('theComponent');
        e.$remove(c);
        expect(e.$has(c)).toBe(false);
    });

    it('should execute modifier function on apply', function() {
        var modifier = sinon.spy();
        var e = world.$entity('theEntity');
        e.$applyModifier(modifier);
        expect(modifier.calledOnce).toBeTruthy();
    });

    it('shouldn\'t execute modifier function on revert', function() {
        var modifier = sinon.spy();
        var e = world.$entity('theEntity');
        e.$revertModifier(modifier);
        expect(modifier.calledOnce).toBeFalsy();
    });

    it('should add component on apply', function() {
        var e = world.$entity('theEntity');
        e.$applyModifier('theComponent');
        expect(e.theComponent).toBeDefined();
    });

    it('should remove component on revert', function() {
        var e = world.$entity('theEntity');
        e.$add('theComponent');
        e.$revertModifier('theComponent');
        expect(e.theComponent).toBeNull();
    });

    it('should add component from array of component names on apply', function() {
        var e = world.$entity('theEntity');
        e.$applyModifier(['theComponent', 'theComponent2']);
        expect(e.theComponent).toBeDefined();
        expect(e.theComponent2).toBeDefined();
    });

    it('should remove component from array of component names on revert', function() {
        var e = world.$entity('theEntity');
        e.$add('theComponent');
        e.$add('theComponent2');
        e.$revertModifier(['theComponent', 'theComponent2']);
        expect(e.theComponent).toBeNull();
        expect(e.theComponent2).toBeNull();
    });

    it('should add component from object with key - component name, value - is config on apply', function() {
        var e = world.$entity('theEntity');
        e.$applyModifier({
            'theComponent': {
                z: 10
            },
            'theComponent2': {
                x: 777
            }
        });
        expect(e.theComponent).toBeDefined();
        expect(e.theComponent.z).toBe(10);
        expect(e.theComponent2).toBeDefined();
        expect(e.theComponent2.x).toBe(777);
    });

    it('should remove component from object with key - component name, value - is config on revert', function() {
        var e = world.$entity('theEntity');
        e.$add('theComponent');
        e.$add('theComponent2');
        e.$revertModifier({
            'theComponent': true,
            'theComponent2': true
        });
        expect(e.theComponent).toBeNull();
        expect(e.theComponent2).toBeNull();
    });

    it('should use result of executed modifier to recursive modify', function(){
        var e = world.$entity('theEntity');
        e.$applyModifier(function() {
            return ['theComponent', 'theComponent2'];
        });

        expect(e.theComponent).toBeDefined();
        expect(e.theComponent2).toBeDefined();
    });
});