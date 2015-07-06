'use strict';

var faker = require('faker');
var testWorldInstance = require('./worldInstanceSpecHelper');
var World = require('../lib/core/world');

describe('world', function() {
  testWorldInstance(function() {
    var world = new World();
    world.name = faker.name.findName();
    return world;
  });
});
