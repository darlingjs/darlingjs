/**
 * Project: darlingjs / GameEngine.
 *
 * Module with common components and systems:
 *
 * * ngSelected - marker for selected entity;
 *
 * Copyright (c) 2013, Eugene-Krevenets
 */

(function(darlingjs) {
    'use strict';

    var m = darlingjs.module('ngCommon');

    m.$c('ngSelected');

    m.$s('ngFollowSelected', {
        _avgPosition: {x:0.0, y:0.0},

        shift: {
            x: 0.0,
            y: 0.0
        },

        $require: ['ng2D', 'ngSelected'],

        $beforeUpdate: function() {
            this._avgPosition.x = 0.0;
            this._avgPosition.y = 0.0;
            this._avgPosition.count = 0;
        },

        $update: ['$node', function($node) {
            this._avgPosition.x += $node.ng2D.x;
            this._avgPosition.y += $node.ng2D.y;
            this._avgPosition.count++;
        }],

        $afterUpdate: ['ng2DViewPort', function(ng2DViewPort) {
            if (this._avgPosition.count > 1) {
                var coef = 1 / this._avgPosition.count;
                this._avgPosition.x *= coef;
                this._avgPosition.y *= coef;
            }

            ng2DViewPort.lookAt.x = this._avgPosition.x + this.shift.x;
            ng2DViewPort.lookAt.y = this._avgPosition.y + this.shift.y;
        }]
    });

})(darlingjs);