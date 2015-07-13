'use strict';

var List = require('../../lib/utils/list');

var chai = require('chai');
var expect = require('chai').expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');

chai.use(sinonChai);

describe('List', function() {
  var list;
  var emptyList;

  beforeEach(function() {
    list = new List();
    list.add('a1');
    list.add('a2');
    list.add('a3');
    emptyList = new List();
  });

  it('should be empty', function() {
    expect(emptyList.length()).to.be.equal(0);
    var count = 0;
    emptyList.forEach(function() {
      count++;
    });
    expect(count).to.be.equal(0);
  });

  it('should inc length on add', function() {
    emptyList.add({});
    expect(emptyList.length()).to.be.equal(1);
  });

  it('should dec length on remove', function() {
    var item = {};
    emptyList.add(item);
    expect(emptyList.length()).to.be.equal(1);
    emptyList.remove(item);
    expect(emptyList.length()).to.be.equal(0);
  });

  it('should add to for each added item', function() {
    var addedItem = {};
    emptyList.add(addedItem);
    var count = 0;
    emptyList.forEach(function(item) {
      expect(item).to.be.equal(addedItem);
      count++;
    });
    expect(count).to.be.equal(1);
  });

  it('after added 3 items should contains them', function() {
    var e1 = {name: 'e1'};
    var e2 = {name: 'e2'};
    var e3 = {name: 'e3'};
    emptyList.add(e1);
    emptyList.add(e2);
    emptyList.add(e3);

    var elements = [];
    emptyList.forEach(function(e) {
      elements.push(e);
    });

    expect(elements.length).to.be.equal(3);
    expect(elements[0]).to.be.equal(e1);
    expect(elements[1]).to.be.equal(e2);
    expect(elements[2]).to.be.equal(e3);
  });

  it('should trigger "add" event on add new item', function() {
    var addHandler = sinon.spy();
    var e1 = {name: 'e1'};

    emptyList.on('add', addHandler);
    emptyList.add(e1);
    emptyList.remove(e1);
    expect(addHandler).to.have.been.calledOnce;
    expect(addHandler).to.have.been.calledWith(e1);
  });

  it('should trigger "remove" event on remove item', function() {
    var removeHandler = sinon.spy();
    var e1 = {name: 'e1'};
    var l = new List([e1]);

    l.on('remove', removeHandler);
    l.remove(e1);
    expect(removeHandler).to.have.been.calledOnce;
    expect(removeHandler).to.have.been.calledWith(e1);
  });

  it('should be able to be converted to array', function() {
    var arr = list.value();

    expect(arr).to.have.members(['a1', 'a2', 'a3']);
  });

  it('should init list from array', function() {
    var arr = ['a1', 'a2', 'a3'];
    var l = new List('list', arr);
    expect(l.length()).to.have.equal(arr.length);
    l.forEach(function(e, index) {
      expect(e).to.be.equal(arr[index]);
    });
  });

  it('should add node to the head and return node', function() {
    expect(emptyList.addHead()).to.not.be.undefined;
    expect(emptyList.length()).to.be.equal(1);
  });

  it('should clone list on clone()', function() {
    var cloneOfList = list.clone();
    expect(cloneOfList).to.not.equal(list);

    var cloneOfListArray = cloneOfList.value();
    expect(cloneOfListArray).to.have.members(['a1', 'a2', 'a3']);
  });

  it('should iterate quick on list', function() {
    var i = list.quickIterator();

    expect(i.hasNext()).to.be.true;
    expect(i.next()).to.be.equal('a1');
    expect(i.hasNext()).to.be.true;
    expect(i.next()).to.be.equal('a2');
    expect(i.hasNext()).to.be.true;
    expect(i.next()).to.be.equal('a3');
    expect(i.hasNext()).to.be.false;
  });
});
