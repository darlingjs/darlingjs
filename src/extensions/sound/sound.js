/**
 * Project: darlingjs / GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

(function(darlingjs) {
    'use strict';

    var m = darlingjs.module('ngSound');
    m.$c('ngPlaySound', {
        urls: null,
        loop: false,
        stopPlayAfterRemove: true,
        volume: 1.0,
        distance: 50.0,
        onend: null
    });

})(darlingjs);