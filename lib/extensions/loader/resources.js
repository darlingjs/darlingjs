/**
 * Project: darlingjs (GameEngine).
 * Copyright (c) 2013, Eugene-Krevenets
 */

(function(darlingjs, darlingutil) {
    'use strict';
    var m = darlingjs.module('ngResources');

    /**
     * Resource repository
     */
    m.$s('ngResourceLoader', {

        availableCount: 0,
        totalCount: 0,
        loading: {},
        loaded: {},

        //TODO:.....
        load: function(url) {
            if (this.loaded[url]) {
                //TODO : already loaded
            } else {
                //TODO : start loading new resource
                this.trigger('newResource', url);
            }
        },

        startLoading: function(url) {
            if (darlingutil.isArray(url)) {
                for (var i = 0, count = url.length; i < count; i++) {
                    this.startLoading(url[i]);
                }
                return;
            }

            if (this.loading[url] || this.loaded[url]) {
                return;
            }

            console.log('startLoading ' + url);

            this.loading[url] = true;
            this.totalCount++;
            this._onChangeResourceCount();
        },

        errorLoading: function(url) {
            if (this.loading[url]) {
                return;
            }
            this.loading[url] = null;
            this.availableCount--;
            this._onChangeResourceCount();
        },

        stopLoading: function(url) {
            if (darlingutil.isArray(url)) {
                for (var i = 0, count = url.length; i < count; i++) {
                    this.stopLoading(url[i]);
                }
                return;
            }

            if (!this.loading[url]) {
                return;
            }

            console.log('stopLoading ' + url);

            this.loaded[url] = true;
            this.loading[url] = null;
            this.availableCount++;
            this._onChangeResourceCount();
        },

        isLoaded: function(url) {
            return darlingutil.isDefined(this.loaded[url]);
        },

        _onChangeResourceCount: function () {
            if (this.availableCount == this.totalCount) {
                this.trigger('complete', this);
            } else {
                this.trigger('progress', this);
            }
        }
    });
})(darlingjs, darlingutil);