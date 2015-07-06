'use strict';

var expect = require('chai').expect;
var faker = require('faker');
var Stream = require('../lib/core/stream');
var testWorldInstance = require('./worldInstanceSpecHelper');
var darling = require('../');

describe('stream', function() {
  var rootStream;

  beforeEach(function() {
    rootStream = new Stream();
    rootStream.name = faker.name.findName();
  });

  it('should return stream on pipe', function() {
    var w = rootStream.pipe();
    expect(w).to.be.instanceOf(Stream);
  });

  describe('world wrapper', function() {
    testWorldInstance(function() {
      var world = darling.world();
      world.name = faker.name.findName();
      return world;
    });
  });
});
