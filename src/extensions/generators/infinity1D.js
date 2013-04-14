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
        _tail: null,
        _head: null,

        _lastLeftClampNode: null,
        _lastRightClampTile: null,

        seed: null,
        generator: null,
        removeUnseen: true,

        $added: function() {
            if (this.generator === null) {
                throw new Error('To use ngInfinity1DWorld you should define generator function. To create next node of infinity world');
            }
        },

        $update: ['ng2DViewPort', function(ng2DViewPort) {
            var half = 0.5 * ng2DViewPort.width;
            var center = ng2DViewPort.lookAt.x;
            var leftClamp = center + half;
            var rightClamp = center - half;

            var rightClampTile = this._lastRightClampTile || this._tail;

            //add new
            while(!rightClampTile || rightClampTile.right < rightClamp) {
                //* generate right tile
                //* until we inside of clamp
                var newTile = this.generator(new GeneratorTile(), rightClampTile || this.seed);
                newTile.prev = rightClampTile;
                if (rightClampTile) {
                    rightClampTile.next = newTile;
                }
                rightClampTile = newTile;
                if (!this._tail) {
                    this._head = this._tail = newTile;
                }
            }

            //remove useless
            if (this.removeUnseen) {

            }

            this._lastRightClampTile = rightClampTile;

            //add new
            var leftClampNode = this._lastLeftClampNode || this._tail;
            while(!leftClampNode) {

            }

            //remove useless
            if (this.removeUnseen) {

            }

            this._lastLeftClampNode = leftClampNode;
        }]
    });

    function newTile() {

    }

    function disposeTile() {

    }

    var GeneratorTile = function() {};
    GeneratorTile.prototype.next = null;
    GeneratorTile.prototype.prev = null;
    GeneratorTile.prototype.entities = [];
})(darlingjs);
