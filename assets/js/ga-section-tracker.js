(function($) {
  var navigationSticky = $('#navigation_sticky');
  window.gaSectionTrackerOptions = window.gaSectionTrackerOptions || {
    autoResize: true,
    delay: 500,
    thresholding: (navigationSticky.is(':visible') && navigationSticky.outerHeight(true)) || 0,
    sectionSelector: '.section-tracker',
    sectionId: function(section) {
      return section.closest('section').attr('id');
    },
    sectionTitle: function() {}
  };

  $(function() {
    var analytics;
    var scrollTracker;
    var sectionTrackerOptions = window.gaSectionTrackerOptions;

    $(window).on('scrollTracker:changeTarget', function(e, currentTarget) {
      var data = $(currentTarget).data('sectionTracker');
      analytics('set', data);
      console.debug('[section-tracker] The section ' + data.title + ' is going to be tracked with the page URL "' + data.page + '".');
      analytics('send', 'pageview');
    });

    var sectionsToTrack = $(sectionTrackerOptions.sectionSelector)
      .filter(function() {
        var section = $(this);
        var id = sectionTrackerOptions.sectionId(section);
        var title = ((typeof sectionTrackerOptions.sectionTitle === 'function') ? sectionTrackerOptions.sectionTitle(section) : null) || id;

        if (!id) {
          console.error('[section-tracker] This section is not going to be tracked because it was not identified.', section);
          return false;
        }

        section.data('sectionTracker', {
          page: '/#' + id,
          title: title
        });

        return true;
      });

    var doScrollTracker = function() {
      if (!scrollTracker) {
        scrollTracker = sectionsToTrack.scrollTracker(sectionTrackerOptions);
      } else {
        scrollTracker.setOptions(options);
        scrollTracker.restart();
      }
    };

    $.gaDetector()
      .then(function(_analytics_) {
        analytics = _analytics_;

        // Change options when resize
        if (sectionTrackerOptions.autoResize) {
          $(window).on('resize', $.debounce(sectionTrackerOptions.delay, doScrollTracker));
        }

        // And then, init it
        doScrollTracker();
      })
      .fail(console.error);
  });
}(jQuery));
