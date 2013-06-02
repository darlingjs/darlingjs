/**
 * Project: darlingjs / GameEngine.
 * Copyright (c) 2013, Eugene-Krevenets
 */

(function(darlingjs) {
    'use strict';

    var m = darlingjs.module('ngSound');

    m.$c('ngAmbientSound', {
        /**
         * The source URLs to the track(s) to be loaded for the sound.
         * These should be in order of preference,
         */
        urls: null,

        /**
         * loop sound
         */
        loop: false,

        /**
         * auto stop sound when the component removes
         */
        stopPlayAfterRemove: true,

        /**
         * volume of sound
         */
        volume: 1.0,

        /**
         * Apply any components to the Entity when the sound finishes playing
         * (if it is looping, it'll fire at the end of each loop)
         */
        onend: null,

        /**
         * Auto remove entity when the sound finishes playing
         * (if it is looping, it doesn't works)
         */
        removeEntityOnEnd: true,

        removeComponentOnEnd: false,

        /**
         * offset time in the buffer (in seconds) where playback
         * will begin
         */
        offset: 0
    });

    /**
     * Component of sound
     */
    m.$c('ngSound', {
        /**
         * The source URLs to the track(s) to be loaded for the sound.
         * These should be in order of preference,
         */
        urls: null,

        /**
         * loop sound
         */
        loop: false,

        /**
         * auto stop sound when the component removes
         */
        stopPlayAfterRemove: true,

        /**
         * volume of sound
         */
        volume: 1.0,

        /**
         * distance value eq to 1.0 in sound coordinates
         */
        distance: 50.0,

        /**
         * Apply any components to the Entity when the sound finishes playing
         * (if it is looping, it'll fire at the end of each loop)
         */
        onend: null,

        /**
         * Auto remove entity when the sound finishes playing
         * (if it is looping, it doesn't works)
         */
        removeEntityOnEnd: true,

        removeComponentOnEnd: false,

        /**
         * offset time in the buffer (in seconds) where playback
         * will begin
         */
        offset: 0
    });

})(darlingjs);