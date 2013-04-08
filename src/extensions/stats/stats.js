/**
 * Project: darlingjs / GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */
(function(darlingjs){
    'use strict';
    var m = darlingjs.module('ngStats');
    var stats;
    m.$s('ngStatsBegin', {
        domId: '',
        target: null,

        $added : function() {
            stats = new Stats();
            stats.setMode( 0 );
            this.target = this.target || document.getElementById(this.domId) || document.body;
            this.target.appendChild( stats.domElement );
        },

        $update: function update() {
            stats.begin();
        }
    });

    m.$s('ngStatsEnd', {
        $update: function update() {
            stats.end();
        }
    });
})(darlingjs);
