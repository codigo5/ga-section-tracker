(function($) {
  'use strict';

  function ScrollTracker(target, options) {
    this.currentTarget = null;
    this.onContextScroll = this.onContextScroll.bind(this);
    this.setOptions(options);
    this.setTarget(target);
    this.setUp();
  }

  ScrollTracker.defaultOptions = {
    context: window,
    delay: 0,
    thresholding: 0
  };

  ScrollTracker.factory = function(target, options) {
    var target = $(target);
    var scrollTracker;

    target.each(function() {
      var elementScrollTracker = $(this).data('scrollTracker');
      if (elementScrollTracker) {
        if (scrollTracker) {
          elementScrollTracker.destroy();
        } else {
          scrollTracker = elementScrollTracker;
        }
      }
    });

    if (scrollTracker) {
      scrollTracker.setTarget(target);
    } else {
      scrollTracker = new ScrollTracker(target, options);
      target.data('scrollTracker', scrollTracker);
    }

    return scrollTracker;
  };

  ScrollTracker.prototype = {
    getCurrentTarget: function() {
      return this.currentTarget;
    },

    setTarget: function(target) {
      var self = this;
      this.target = $(target);
      this.targetOffsets = this.target.toArray()
        .map(function(element) {
          return {
            element: element,
            offset: $(element).offset().top
          };
        })
        .sort(function(x, y) {
          return x.offset - y.offset;
        });
      this.unreachableTarget = this.target.toArray()
        .filter(function(target) {
          return isReachable(target);
        });
    },

    getTarget: function() {
      return this.target;
    },

    getUnreachableTarget: function() {
      return this.unreachableTarget;
    },

    setOptions: function(options) {
      this.options = $.extend({}, ScrollTracker.defaultOptions, options);
      this.options.context = $(this.options.context);
    },

    getOptions: function() {
      return this.options;
    },

    setUp: function() {
      this.delayedOnContextScroll = $.debounce(+this.options.delay, this.onContextScroll);
      this.options.context
        .on('scroll', this.delayedOnContextScroll);

      this.checkTarget();
    },

    destroy: function() {
      if (this.delayedOnContextScroll) {
        this.options.context
          .off('scroll', this.delayedOnContextScroll);

        this.delayedOnContextScroll = undefined;
      }
    },

    restart: function() {
      this.destroy();
      this.setUp();
    },

    onContextScroll: function() {
      this.checkTarget();
    },

    checkTarget: function() {
      var self = this;
      var scrollTop = this.options.context.scrollTop() + +this.options.thresholding;
      var unreachableEntirelyShownTarget = this.unreachableTarget
        .filter(function(target) {
          return entirelyAppearsInViewport(target);
        });
      var possibleTarget;

      if (unreachableEntirelyShownTarget.length) {
        possibleTarget = unreachableEntirelyShownTarget[0];
      } else {
        this.targetOffsets.forEach(function(target, index) {
          if (possibleTarget) {
            return;
          }

          var nextTarget = self.targetOffsets[index + 1];

          if (scrollTop >= target.offset && (!nextTarget || scrollTop <= nextTarget.offset)) {
            possibleTarget = target.element;
          }
        });
      }

      if (possibleTarget && possibleTarget !== this.currentTarget) {
        this.currentTarget = possibleTarget;
        this.options.context.trigger('scrollTracker:changeTarget', possibleTarget);
      }
    }
  };

  $.fn.scrollTracker = function() {
    if ($(this).length) {
      var self = this;
      var args = Array.prototype.slice.call(arguments);
      var firstArg = args.shift();
      var command;

      switch ($.type(firstArg)) {
        case 'string':
          var scrollTracker = ScrollTracker.factory(self);

          if (['destroy', 'restart'].indexOf(firstArg) > -1) {
            return scrollTracker[firstArg](args);
          }
          break;

        case 'object':
        case 'undefined':
        case 'null':
        default:
          return ScrollTracker.factory(self, firstArg);
      }
    }
  };

  function getMaxScrollTop() {
    return $(document).height() - $(window).height();
  }

  function isReachable(element) {
    return $(element).offset().top > getMaxScrollTop();
  }

  function equalsArray(x, y) {
    return $(x).not(y).length === 0 && $(y).not(x).length === 0;
  }

  function appearsInViewport(element, viewport) {
    element = $(element)[0];
    viewport = $(viewport || window);

    if (!element) {
      return false;
    }

    var rect = element.getBoundingClientRect();

    return (
      rect.bottom > 0 &&
      rect.right > 0 &&
      rect.left < viewport.width() &&
      rect.top < viewport.height()
    );
  }

  function entirelyAppearsInViewport(element, viewport) {
    element = $(element)[0];
    viewport = $(viewport || window);

    if (!element) {
      return false;
    }

    var rect = element.getBoundingClientRect();

    return (
      appearsInViewport(element, viewport) &&
      viewport.height() >= rect.bottom
    );
  }
}(jQuery));
