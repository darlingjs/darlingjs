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

        $addEntity: ['$entity', function($entity) {
            $entity.$remove('ngSelected');
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

        $addEntity: ['$entity', '$world', function($entity, $world) {
            var bonusState = $entity.ngGetBonus;

            //FIX ME: can only remove in timeout
            setTimeout(function() {
                var entities = bonusState.entities.slice();
                for (var i = 0, count = entities.length; i < count; i++) {
                    var entity = entities[i];
                    $world.$remove(entity);
                    $entity.ngScores.score += entity.ngBonus.score;
                    if ($entity.ngScores.handler) {
                        $entity.ngScores.handler.call($entity, $entity.ngScores.score);
                    }
                }
            }, 0);
        }]
    });
}) (darlingjs);