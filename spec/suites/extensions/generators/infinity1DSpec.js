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
            width: 400,
            height: 300
        });
    });

    afterEach(function() {

    });

    it('should execute generate on adding world', function() {
        world.$add('ngInfinity1DWorld', {
            generator: function(newTile, seedTile) {
                //newTile.
            }
        });
    });
});