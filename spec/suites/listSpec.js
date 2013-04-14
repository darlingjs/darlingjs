'use strict';
/**
 * Project: GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

describe('list', function() {
    it('should be empty', function() {
        var list = new List();
        expect(list.length()).toBe(0);
        var count = 0;
        list.forEach(function() {
            count++;
        });
        expect(count).toBe(0);
    });

    it('should inc length on add', function() {
        var list = new List();
        list.add({});
        expect(list.length()).toBe(1);
    });

    it('should dec length on remove', function() {
        var list = new List();
        var item = {};
        list.add(item);
        expect(list.length()).toBe(1);
        list.remove(item);
        expect(list.length()).toBe(0);
    });

    it('should add to for each added item', function() {
        var list = new List();
        var addedItem = {};
        list.add(addedItem);
        var count = 0;
        list.forEach(function(item) {
            expect(item).toBe(addedItem);
            count++;
        });
        expect(count).toBe(1);
    });

    it('should remove from for each removed item', function() {
        var list = new List();
        var addedItem = {};
        list.add(addedItem);
        list.remove(addedItem);
        var count = 0;
        list.forEach(function(item) {
            expect(item).not.toBe(addedItem);
            count++;
        });
        expect(count).toBe(0);
    });

    it('after added 3 items should contains them', function() {
        var list = new List();
        var e1 = {name:'e1'};
        var e2 = {name:'e2'};
        var e3 = {name:'e3'};
        list.add(e1);
        list.add(e2);
        list.add(e3);
        var elements = [];
        list.forEach(function(e) {
            elements.push(e);
        });
        expect(elements.length).toBe(3);
        expect(elements[0]).toBe(e1);
        expect(elements[1]).toBe(e2);
        expect(elements[2]).toBe(e3);
        //expect(elements).toContain(e3);
    });

    it('should trigger "add" event on add new item', function() {
        var addHandler = sinon.spy();
        var list = new List();
        var e1 = {name:'e1'};

        list.on('add', addHandler);
        list.add(e1);
        list.remove(e1);
        expect(addHandler.callCount).toBe(1);
        expect(addHandler.calledWith(e1)).toBeTruthy();
    });

    it('should trigger "remove" event on remove item', function() {
        var removeHandler = sinon.spy();
        var list = new List();
        var e1 = {name:'e1'};

        list.on('remove', removeHandler);
        list.add(e1);
        list.remove(e1);
        expect(removeHandler.callCount).toBe(1);
        expect(removeHandler.calledWith(e1)).toBeTruthy();
    });

    it('should return new node after add empty instance', function() {
        var list = new List();
        expect(list.add()).toBeDefined();
    });

    it('should add node to the head and return node', function() {
        var list = new List();
        expect(list.addHead()).toBeDefined();
    });

    it('should remove node by instace of node', function() {
        var list = new List();
        var e1 = list.add();
        var e2 = list.add();
        var e3 = list.add();
        list.remove(e2);
        expect(list.length()).toBe(2);
    });
});