/**
 * Project: darlingjs / GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */
(function(darlingjs) {
    'use strict';

    var m = darlingjs.module('ngPlayer');

    /**
     * Marker of winner's
     */
    m.$c('ngWinner');

    /**
     * Marker of finish
     */
    m.$c('ngFinish');

    /**
     * Marker of controlled entity
     */
    m.$c('ngControlledByPlayer');

    /**
     * Auto-remove selection on win
     */
    m.$s('ngRemoveSelectionFromWinner', {
        $require: ['ngWinner', 'ngSelected'],

        $addNode: ['$node', function($node) {
            $node.$remove('ngSelected');
        }]
    });
}) (darlingjs);