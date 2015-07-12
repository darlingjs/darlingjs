'use strict';

var List = require('../../lib/utils/list');

var expect = require('chai').expect;

describe('List', function() {
  var list;

  beforeEach(function() {
    list = new List();
    list.add('a1');
    list.add('a2');
    list.add('a3');
  });

  it('should be able to be converted to array', function() {
    var arr = list.value();

    expect(arr).to.have.members(['a1', 'a2', 'a3']);
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
