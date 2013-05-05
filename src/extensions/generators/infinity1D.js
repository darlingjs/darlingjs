/**
 * Project: darlingjs / GameEngine.
 *
 * Module of generation infinity 1d world
 *
 * depends on: ng2DViewPort
 *
 * need to implements generator
 * that generate new tile and put in 1st param (newTile) information about new tile:
 * leftEdge, rightEdge, rightHeight, array of entities.
 *
 * also implements seed
 * that use for generate 1st tile
 *
 * Copyright (c) 2013, Eugene-Krevenets
 */

(function(darlingjs, darlingutil) {
    'use strict';

    var m = darlingjs.module('ngInfinity1DWorld');
    /**
     * System for generation infinity 1d world
     *
     *
     */
    m.$s('ngInfinity1DWorld', {
        _list: null,

        _lastLeftClampTile: null,
        _lastRightClampTile: null,

        seed: null,
        generator: null,
        removeUnseen: true,

        $added: ['ng2DViewPort', '$world', function(ng2DViewPort, $world) {
            if (this.generator === null) {
                throw new Error('To use ngInfinity1DWorld you should define generator function. To create next node of infinity world');
            }
            this._list = new darlingutil.List();
            this._generate(ng2DViewPort, $world);
        }],

        $update: ['ng2DViewPort', '$world', function(ng2DViewPort, $world) {
            this._generate(ng2DViewPort, $world);
        }],

        _generate: function(ng2DViewPort, $world) {
            var width = ng2DViewPort.width,
                half = 0.5 * ng2DViewPort.width,
                center = ng2DViewPort.lookAt.x,
                leftClamp = center - half,
                rightClamp = center + half;

            var tile = this._list.$tail;

            //add new from right side
            while(!tile || tile.rightEdge < rightClamp) {
                var newRightTile = this._list.add();
                this.generator(newRightTile, tile || this.seed, null);
                tile = newRightTile;
            }

            //this._lastRightClampTile = rightClampTile;

            tile = this._list.$head;
//            var leftClampTile = this._lastLeftClampTile || this._head;

            //add new from left side
            while(!tile || tile.leftEdge > leftClamp) {
                var newLeftTile = this._list.addHead();
                this.generator(newLeftTile, null, tile || this.seed);
                tile = newLeftTile;
            }

            //remove old from right side
            tile = this._list.$head;
            var edge = leftClamp - width;
            while(tile && tile.rightEdge < edge) {
                var next = tile.$next;
                this._list.remove(tile);
                removeAllEntitiesFrom($world, tile.entities);
                tile.entities = null;
                tile = next;
            }
        }
    });

    function removeAllEntitiesFrom($world, entities) {
        //console.log('removeAllEntitesFrom');
        if (darlingutil.isUndefined(entities) || entities === null) {
            return;
        }
        for (var i = 0, count = entities.length; i < count; i++) {
            //console.log('remove entity : ' + entities[i].$name);
            $world.$remove(entities[i]);
        }
    }

})(darlingjs, darlingutil);