(function($) {
  $(function() {
    var analytics;
    var scrollTracker;

    $(window).on('scrollTracker:changeTarget', function(e, currentTarget) {
      var data = $(currentTarget).data('sectionTracker');
      analytics('set', data);
      console.debug('[section-tracker] The section ' + data.title + ' is going to be tracked with the page URL "' + data.page + '".');
      analytics('send', 'pageview');
    });

    var sectionsToTrack = $('.section-tracker')
      .filter(function() {
        var section = $(this);
        var id = section.closest('.vntd-section-default').attr('id');

        if (!id) {
          console.error('[section-tracker] This section is not going to be tracked because it was not identified.', section);
          return false;
        }

        section.data('sectionTracker', {
          page: '/#' + id,
          title: id
        });

        return true;
      });

    var doScrollTracker = function() {
      var navigationSticky = $('#navigation_sticky');
      var options = {
        delay: 500,
        thresholding: (navigationSticky.is(':visible') && navigationSticky.outerHeight(true)) || 0
      };

      if (!scrollTracker) {
        scrollTracker = sectionsToTrack.scrollTracker(options);
      } else {
        scrollTracker.setOptions(options);
        scrollTracker.restart();
      }
    };

    $.gaDetector()
      .then(function(_analytics_) {
        analytics = _analytics_;

        // Change options when resize
        $(window).on('resize', $.debounce(options.delay, doScrollTracker));

        // And then, init it
        doScrollTracker();
      })
      .fail(console.error);
  });
}(jQuery));
