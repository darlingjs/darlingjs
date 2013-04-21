/**
 * Project: darlingjs / GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */
(function(darlingjs){
    'use strict';
    var m = darlingjs.module('ngStats');

    var stats;

    m.$s('ngStatsBegin', {

        $added : function() {
            stats = new Stats();
            stats.setMode( 0 );
        },

        $update: function update() {
            stats.begin();
        }
    });

    m.$s('ngStatsEnd', {
        domId: null,
        target: null,

        $added: function() {
            this.target = this.target || this.domId && document.getElementById(this.domId) || document.body;
            this.target.appendChild( stats.domElement );
        },
        $update: function update() {
            stats.end();
        }
    });
})(darlingjs);
