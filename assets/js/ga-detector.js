(function($) {
  'use strict';

  function GaDetector(options) {
    this.options = $.extend({}, GaDetector.defaultOptions, options);
    this.defer = $.Deferred();
    this.retries = 0;
    this.checkWithPooling();
  }

  GaDetector.isLoaded = function() {
    return 'ga' in window;
  };

  GaDetector.prototype = {
    getPromise: function() {
      return this.defer.promise();
    },

    checkWithPooling: function() {
      if (!this.checkInterval) {
        this.checkInterval = setInterval(function() {
          if (this.retries === +this.options.maxRetries) {
            this.destroy();
            this.defer.reject('[ga-detect] It could not detect Universal Google Analytics in ' + this.retries + ' times.');
            return;
          }

          this.retries += 1;

          if (GaDetector.isLoaded()) {
            this.defer.resolve(window.ga);
            this.destroy();
          }
        }.bind(this), +this.options.interval);
      }

      return this.checkInterval;
    },

    destroy: function() {
      if (this.checkInterval) {
        clearInterval(this.checkInterval);
        this.checkInterval = undefined;
      }
    }
  };

  GaDetector.defaultOptions = {
    maxRetries: 10,
    interval: 500
  };

  $.gaDetector = function(options, force) {
    var win = $(window);
    if (!win.data('gaDetector') || force) {
      var gaDetector = new GaDetector(options);
      if (force && win.data('gaDetector')) {
        win.data('gaDetector').destroy();
      }
      win.data('gaDetector', gaDetector);
    }
    return win.data('gaDetector').getPromise();
  };
}(jQuery));
