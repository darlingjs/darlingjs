/**
 * Project: darlingjs / GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

var darlingjs = require('./../../../../');
var sinon = require('sinon');
require('./../../../../src/extensions/space/flatland.js');
require('./../../../../src/extensions/generators/infinity1D.js');

describe('infinity1DWorldGenerator', function() {
    'use strict';

    var world,
        viewPort;

    beforeEach(function() {
        world = darlingjs.world('myWorld', [
            'ngFlatland',
            'ngInfinity1DWorld'
        ]);

        viewPort = world.$add('ng2DViewPort', {
            lookAt: {
                x:0.0, y:0.0
            },
            width: 600.0,
            height: 400.0
        });
    });

    afterEach(function() {
        darlingjs.removeWorld(world);
    });

    it('should execute generate on adding world', function() {
        var generatorExecuteCount = 0;
        world.$add('ngInfinity1DWorld', {
            seed: {
                leftEdge: 0.0,
                leftHeight: 0.0,
                rightEdge: 0.0,
                rightHeight: 0.0
            },

            generator: function(newTile, leftSeedTile, rightSeedTile) {
                var width = 100,
                    leftEdge,
                    rightEdge,
                    leftHeight;

                if (leftSeedTile) {
                    leftEdge = leftSeedTile.rightEdge;
                } else if (rightSeedTile) {
                    leftEdge = rightSeedTile.leftEdge - width;
                }

                if (rightSeedTile) {
                    rightEdge = rightSeedTile.leftEdge;
                } else if (leftSeedTile) {
                    rightEdge = leftSeedTile.rightEdge + width;
                }

                newTile.leftEdge = leftEdge;
                newTile.rightEdge = rightEdge;

                generatorExecuteCount++;
            }
        });

        expect(generatorExecuteCount).toBe(6);
    });

    it('should remove unseen entities', function() {
        var generatorExecuteCount = 0;
        world.$add('ngInfinity1DWorld', {
            seed: {
                leftEdge: 0.0,
                leftHeight: 0.0,
                rightEdge: 0.0,
                rightHeight: 0.0
            },

            generator: function(newTile, leftSeedTile, rightSeedTile) {
                var width = 100,
                    leftEdge,
                    rightEdge,
                    leftHeight;

                if (leftSeedTile) {
                    leftEdge = leftSeedTile.rightEdge;
                } else if (rightSeedTile) {
                    leftEdge = rightSeedTile.leftEdge - width;
                }

                if (rightSeedTile) {
                    rightEdge = rightSeedTile.leftEdge;
                } else if (leftSeedTile) {
                    rightEdge = leftSeedTile.rightEdge + width;
                }

                newTile.leftEdge = leftEdge;
                newTile.rightEdge = rightEdge;

                newTile.entities = [];
                var e = world.$e();
                newTile.entities.push(e);
                generatorExecuteCount++;
            }
        });

        viewPort.lookAt.x = 2 * viewPort.width;
        world.$update();

        //count of entities still the same
        var entitiesCount = world.$numEntities();

        viewPort.lookAt.x = 4 * viewPort.width;
        world.$update();

        expect(world.$numEntities()).toBe(entitiesCount);
    });
});