'use strict';
/**
 * Project: darlingjs / GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */
describe('infinity1DWorldGenerator', function() {
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
                console.log('generator 1');

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

                console.log('generator 2');

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

                newTile.enties = [];
                var e = world.$add(world.$e());
                newTile.enties.push(e);
                generatorExecuteCount++;
            }
        });

        //look outside of known world
        viewPort.lookAt.x = viewPort.width;
        world.$update();

        expect(generatorExecuteCount).toBe(12);
        expect(world.$numEntities()).toBe(6);
    });
});