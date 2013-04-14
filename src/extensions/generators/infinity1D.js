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

(function(darlingjs) {
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

            var rightClampTile = this._list._tail;
            //var rightClampTile = this._lastRightClampTile || this._tail;

            //add new from right side
            while(!rightClampTile || rightClampTile.rightEdge < rightClamp) {
                var newRightTile = this._list.add();
                this.generator(newRightTile, rightClampTile || this.seed, null);
                rightClampTile = newRightTile;
            }

            //this._lastRightClampTile = rightClampTile;

            var leftClampTile = this._list._head;
//            var leftClampTile = this._lastLeftClampTile || this._head;

            //add new from left side
            while(!leftClampTile || leftClampTile.leftEdge > leftClamp) {
                var newLeftTile = this._list.addHead();
                this.generator(newLeftTile, null, leftClampTile || this.seed);
                leftClampTile = newLeftTile;
            }

            //remove old from right side
            leftClampTile = this._list._head;
            while(leftClampTile && leftClampTile.rightEdge + width < leftClamp) {
                this._list.remove(leftClampTile);
                removeAllEntitesFrom($world, leftClampTile.entities);
                leftClampTile.entities = null;

                leftClampTile = leftClampTile.$next;
            }
        }
    });

    function removeAllEntitesFrom($world, entities) {
        console.log('removeAllEntitesFrom');
        if (darlingutil.isUndefined(entities) || entities === null) {
            return;
        }
        for (var i = 0, count = entities.length; i < count; i++) {
            console.log('remove entity : ' + entities[i].$name);
            $world.$remove(entities[i]);
        }
    }

})(darlingjs);
