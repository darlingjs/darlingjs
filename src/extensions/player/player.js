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

    m.$c('ngBonus', {
        score: 0
    });

    m.$c('ngScores', {
        score: 0
    });

    m.$c('ngGetBonus');

    m.$s('ngCollectBonuses', {
        $require: ['ngGetBonus', 'ngScores'],

        $addNode: ['$node', '$world', function($node, $world) {
            var bonusState = $node.ngGetBonus;

            //FIX ME: can only remove in timeout
            setTimeout(function() {
                var entities = bonusState.entities;
                for (var i = 0, count = entities.length; i < count; i++) {
                    var entity = entities[i];
                    $world.$remove(entity);
                    $node.ngScores.score += entity.ngBonus.score;
                }
            }, 0);
        }]
    });
}) (darlingjs);