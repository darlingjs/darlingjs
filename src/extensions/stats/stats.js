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
            document.body.appendChild( stats.domElement );
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
