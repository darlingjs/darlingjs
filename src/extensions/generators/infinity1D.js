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

        $added: ['ng2DViewPort', function(ng2DViewPort) {
            if (this.generator === null) {
                throw new Error('To use ngInfinity1DWorld you should define generator function. To create next node of infinity world');
            }
            this._list = new darlingutil.List();
            this._generate(ng2DViewPort);
        }],

        $update: ['ng2DViewPort', function(ng2DViewPort) {
            this._generate(ng2DViewPort);
        }],

        _generate: function(ng2DViewPort) {
            var half = 0.5 * ng2DViewPort.width;
            var center = ng2DViewPort.lookAt.x;
            var leftClamp = center - half;
            var rightClamp = center + half;

            var rightClampTile = this._lastRightClampTile || this._tail;

            //add new from right side
            while(!rightClampTile || rightClampTile.rightEdge < rightClamp) {
                var newRightTile = this._list.add();
                this.generator(newRightTile, rightClampTile || this.seed, null);
                rightClampTile = newRightTile;
            }

            this._lastRightClampTile = rightClampTile;

            var leftClampTile = this._lastLeftClampTile || this._head;

            //add new from left side
            while(!leftClampTile || leftClampTile.leftEdge > leftClamp) {
                var newLeftTile = this._list.addHead();
                this.generator(newLeftTile, null, leftClampTile || this.seed);
                leftClampTile = newLeftTile;
            }

            this._lastLeftClampTile = leftClampTile;
//
//            //remove useless from left side
//            if (this.removeUnseen) {
//                leftClampTile
//            }


//            //add new
//            var leftClampNode = this._lastLeftClampNode || this._tail;
//            while(!leftClampNode) {
//
//            }
//
//            //remove useless
//            if (this.removeUnseen) {
//
//            }
//
//            this._lastLeftClampNode = leftClampNode;
        }
    });

})(darlingjs);
