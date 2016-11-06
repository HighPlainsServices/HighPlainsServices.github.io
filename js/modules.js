
                    $(document).ready(function(){
	var $mainContainer = $('.main-container');

	$('.navbar-toggle[data-toggle="sidebar"]').click(function(){
		if($mainContainer.hasClass("open")) {
			$mainContainer.removeClass("open");
		}
		else {
			$mainContainer.addClass("open");
		}
	});

	$('.protective-glass').click(function(){
		$mainContainer.removeClass("open");
	});

});  
                    /**
* Custom module for handling slide details:
*   - rendering the slide title and caption
*   - Managing slides' state.
**/
var photoGalleryDetails = (function () {
  /* FotoSlide represents each slide */
  var FotoSlide = function (opts) {
    var self = this;
    self.id = opts.id;
    self.html = opts.html;
    self.isShowingMore = opts.state;
    self.$imgDetailsFrame = $('[data-imgid="' + opts.id + '"]');
    self.$caption = $('#js-foto-img-caption-' + opts.id);
    self.$readMore = self.$imgDetailsFrame.find('.js-foto-img-show-more');
    self.captionCopy = self.$caption.text();
    self.wordLimit = 25;
    self.widthLimit = '375px';
    self.checkWidthLimit = function () {
      return +$('#js-my-image-details').css('width')
             .replace('px', '') < +self.widthLimit.replace('px', '');
    };
    self.isWordsLimit = self.captionCopy.split(' ').length > self.wordLimit;

    self.readMoreHandle = function () {
      self.$readMore.on('click', function (event) {
        event.preventDefault();
        self.isShowingMore = !self.isShowingMore;
        self.setDetails();
        allSlides.states[self.id] = self.isShowingMore;
      });
    };
    self.setDetails = function () {
      var lessCopy = self.captionCopy.split(' ').slice(0, self.wordLimit).join(' ') + '...';
      self.isWidthLimit = self.checkWidthLimit();
      if (self.isWidthLimit && self.isWordsLimit) {
        self.$readMore.css({display: 'block'});
        self.$readMore.text(self.isShowingMore ? 'Read Less' : 'Read More');
        self.$caption.text(self.isShowingMore ? self.captionCopy: lessCopy);
      } else {
        self.$readMore.css({display: 'none'});
        self.$caption.text(self.captionCopy);
      }
    };
    self.render = function () {
      self.isWordsLimit && self.readMoreHandle();
      self.setDetails();
      $(window).on('resize', function () {
        self.setDetails();
      });
    };
  };

  /* `AllSlides` holds a reference to all the slides
  * It knows what slides are rendered on the page
  * and can be used to keep track of states of
  * each slide.
  */
  var AllSlides = function () {
    var self = this;
    self.instances = {};
    self.states = {};
    self.add = function (slide) {
      self.instances[slide.id] = slide;
      self.slidesCount = Object.keys(self.instances).length;
      self.states[slide.id] = slide.isShowingMore; /* this could be as well an object */
    };
  };
  var allSlides = new AllSlides;

  /**
  * Called when the all slides are ready and when a
  * slide is in focus. It handles image title and
  * description for each slide.
  */
  var renderDetails = function (fotoInstance, isReadyOrActive) {

    /**
    * Make the html for image title and description.
    */
    var makeHtmlContent = function (img) {
      return [
      '<div class="foto-img -frame" id="js-foto-img-frame" data-imgid="' + img.id + '">',
        '<h2 class="foto-img -title">', img.title, '</h2>',
        '<p class="foto-img -caption" id="js-foto-img-caption-' + img.id +'">', img.caption, '</p>',
        '<a href="" class="js-foto-img-show-more foto-img -show-more">More ...</a>',
      '</div>'
      ].join('');
    };

    /**
    * Get caption and title from the fotorama instance
    * active slide.
    */
    var img = {
      title: fotoInstance.activeFrame.imgtitle,
      caption: fotoInstance.activeFrame.imgcaption,
      id: fotoInstance.activeFrame.imgid,
    };

    /**
    * Check if we have saved the slide yet.
    * If not, add to the list of slides.
    */
    if (img.id in allSlides.instances) {
      var savedSlide = allSlides.instances[img.id];
      $('#js-my-image-details').html(savedSlide.html);
      savedSlide = new FotoSlide({
        id: savedSlide.id,
        html: savedSlide.html,
        state: allSlides.states[savedSlide.id]
      });
      savedSlide.render();
    } else {
      var htmlContent = makeHtmlContent(img);
      $('#js-my-image-details').html(htmlContent);
      var newSlide = new FotoSlide({
        id: img.id,
        html: htmlContent,
        state: false
      });
      allSlides.add(newSlide);
      allSlides.instances[img.id].render();
    }
  };

  return {
    renderDetails: renderDetails
  };
})();

$(document).ready(function(){

	var galleryWidth = $('#photo-gallery').width(),
		thumbWidth = galleryWidth / 7,
		navWidth = Math.ceil(galleryWidth - (thumbWidth * 2));

	var $photoGallery = $('#photo-gallery').on('fotorama:ready', function(e, fotorama){
		var $this = $(this);
		// Reposition left/right control
		$this.find('.fotorama__arr').css('bottom', (-thumbWidth)+"px");
    /**
    * When the fotorama is initialized, render
    * the details of the slide in focus.
    */
    photoGalleryDetails.renderDetails(fotorama, {isReady: true});

		// Show loaded image
		$this.addClass('ready');
	}).fotorama({
		ratio: 5/3,
		width: '100%',
		nav: 'thumbs',
		navwidth: navWidth,
		fit: 'scaledown',
		transition: 'dissolve',
		thumbwidth: thumbWidth,
		thumbheight: thumbWidth,
		thumbmargin: 0,
		startindex: 0,
		thumbborderwidth: 0,
		keyboard: true
	}),
		fotorama = $photoGallery.data('fotorama'),
		$galleryCtrl = $photoGallery.find('.fotorama__arr');

    /**
    * When a slide is in focus, render
    * the slide details.
    */
    $('#photo-gallery').on('fotorama:show', function (event, fotorama, extra) {
      photoGalleryDetails.renderDetails(fotorama, {isActive: true});
    });

	$(window).resize(function(){
		if($('#photo-gallery').length) {
			var galleryWidth = $('#photo-gallery').width(),
				thumbWidth = galleryWidth / 7,
				navWidth = Math.ceil(galleryWidth - (thumbWidth * 2));

			fotorama.setOptions({
				thumbwidth: thumbWidth,
				thumbheight: thumbWidth,
				navwidth: navWidth,
			});

			$galleryCtrl.css('bottom', (-thumbWidth)+"px");
		}
	});

});
  
        
                    $(document).ready(function(){

    if($('#map-container').length) {
        
        var geocoder = new google.maps.Geocoder();
        var address = "982 S Simms St Lakewood, CO 80228";

        geocoder.geocode( {'address': address}, function(results, status) {

            if (status == google.maps.GeocoderStatus.OK) {
                var latitude = results[0].geometry.location.lat();
                var longitude = results[0].geometry.location.lng();
            } 
        
            // console.log(address);
            // console.log(latitude);
            // console.log(longitude);

            var myLatlng = new google.maps.LatLng(latitude, longitude);

var mapOptions = {
    center: myLatlng,
    zoom: 15,
    draggable: true,
    disableDefaultUI: false,
    scrollwheel: false,
    disableDoubleClickZoom: false,
    streetViewControl: false,
    styles: []
};


    mapOptions.styles = [
        {
            "featureType": "landscape",
            "stylers": [{ "saturation": -100},{"lightness": 65},{"visibility": "on"}]
        },
        {
            "featureType": "poi",
            "stylers": [{"saturation": -100},{"lightness": 51},{"visibility": "simplified"}]
        },
        {
            "featureType": "road.highway",
            "stylers": [{"saturation": -100},{"visibility": "simplified"}]
        },
        {
            "featureType": "road.arterial",
            "stylers": [{"saturation": -100},{"lightness": 30},{"visibility": "on"}]
        },
        {
            "featureType": "road.local",
            "stylers": [{"saturation": -100},{"lightness": 40},{"visibility": "on"}]
        },
        {
            "featureType": "transit",
            "stylers": [{"saturation": -100},{"visibility": "simplified"}]
        },
        {
            "featureType": "administrative.province",
            "stylers": [{"visibility": "off"}]
        },
        {
            "featureType": "water",
            "elementType": "labels",
            "stylers": [{"visibility": "on"},{"lightness": -25},{"saturation": -100}]
        },
        {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [{"hue": "#ffff00"},{"lightness": -25},{"saturation": -97}]
        }
    ];

            var map = new google.maps.Map(document.getElementById("map-container"), mapOptions);

    var marker = new google.maps.Marker({
        position: myLatlng,
        map: map,
        clickable: false
    });

    google.maps.event.addDomListener(window, "resize", function() {
        var center = map.getCenter();
        google.maps.event.trigger(map, "resize");
        map.setCenter(center); 
    });

         });

    }
   
});  
                    $(document).ready(function() {

        var photoLists = {"Floor And Building Maintenance": {"ownerId": "yc.client.305090", "photoIds": ["571ac5b9d07c8e000d9acf7f", "571afa41d07c8e000d9acf90", "5720337fac2e820008c83cdb", "571afa3eac2e820008c83511", "571af6e4ac2e820008c8350c", "571af80347690b0007fc746a", "571af6e4d07c8e000d9acf8e", "571afa4347690b0007fc746f", "571af6e5ac2e820008c8350d", "5720337fd07c8e000d9ad917", "571af6e5ac2e820008c8350e", "5712ef1947690b0007fc6411", "57119c1547690b0007fc633f", "57119168d07c8e000d9ac2a8", "571197f447690b0007fc6338", "571184d1ac2e820008c82994", "5711845747690b0007fc631c", "571197f8ac2e820008c829af", "57119503d07c8e000d9ac2b3", "571191c8d07c8e000d9ac2a9", "57118411d07c8e000d9ac297", "57119e38ac2e820008c829b8", "57119e43d07c8e000d9ac2c2", "57119c1447690b0007fc633d", "57119c1447690b0007fc633e", "57119c1647690b0007fc6340", "57119c17d07c8e000d9ac2ba", "57119a6547690b0007fc633b", "57119a61ac2e820008c829b3", "57119a6147690b0007fc633a", "571197f7ac2e820008c829ae", "57119502d07c8e000d9ac2b2", "5711950347690b0007fc6333", "5711937b47690b0007fc632d", "571192e3ac2e820008c829a5", "57119216ac2e820008c829a4", "571190e247690b0007fc632a", "57118536ac2e820008c82995", "57119e3ad07c8e000d9ac2c1", "571afb6fac2e820008c83513", "571afb7747690b0007fc7471", "571afa43d07c8e000d9acf91", "5712ef97ac2e820008c82a1f", "5712f003d07c8e000d9ac332"], "photoCount": 44, "id": "571e36d69a077c000cbf428d", "metadata": {"lastUpdatedOnInMilliSeconds": 1472257612776, "displayName": "Floor And Building Maintenance", "name": "Floor And Building Maintenance", "sourceEvent": "website-content-create", "lastUpdatedBy": 6550608431, "type": "SERVICE_DETAIL"}}, "Floor Cleaning And Renovating ": {"ownerId": "yc.client.305090", "photoIds": [], "photoCount": 0, "id": "571e36d69a077c0007a181b8", "metadata": {"displayName": "Floor Cleaning And Renovating ", "type": "SERVICE_DETAIL", "name": "Floor Cleaning And Renovating ", "sourceEvent": "website-content-create"}}, "Commercial Carpet Cleaning": {"ownerId": "yc.client.305090", "photoIds": ["571afa41d07c8e000d9acf90", "5720337fac2e820008c83cdb", "571af6e4ac2e820008c8350c", "571af80347690b0007fc746a", "571af6e4d07c8e000d9acf8e", "571afa4347690b0007fc746f", "571af6e5ac2e820008c8350d", "5720337fd07c8e000d9ad917", "571af6e5ac2e820008c8350e", "5712ef1947690b0007fc6411", "57119c1547690b0007fc633f", "57119168d07c8e000d9ac2a8", "571197f447690b0007fc6338", "571184d1ac2e820008c82994", "5711845747690b0007fc631c", "571197f8ac2e820008c829af", "57119503d07c8e000d9ac2b3", "571191c8d07c8e000d9ac2a9", "57118411d07c8e000d9ac297", "57119e38ac2e820008c829b8", "57119e43d07c8e000d9ac2c2", "57119c1447690b0007fc633d", "57119c1447690b0007fc633e", "57119c1647690b0007fc6340", "57119c17d07c8e000d9ac2ba", "57119a6547690b0007fc633b", "57119a6747690b0007fc633c", "57119a61ac2e820008c829b3", "57119a6147690b0007fc633a", "571197f7ac2e820008c829ae", "57119502d07c8e000d9ac2b2", "5711950347690b0007fc6333", "5711937b47690b0007fc632d", "571192e3ac2e820008c829a5", "57119216ac2e820008c829a4", "571190e247690b0007fc632a", "57118536ac2e820008c82995", "57119e3ad07c8e000d9ac2c1", "571afb7747690b0007fc7471", "571afa43d07c8e000d9acf91"], "photoCount": 40, "id": "571a93f09a077c000cbf4160", "metadata": {"lastUpdatedOnInMilliSeconds": 1472257612776, "serviceGroupId": "177239201", "displayName": "Commercial Carpet Cleaning", "name": "Commercial Carpet Cleaning", "sourceEvent": "website-content-create", "lastUpdatedBy": 6550608431, "type": "SERVICE_DETAIL"}}, "Photo Gallery": {"ownerId": "yc.client.305090", "photoIds": ["57534f20d07c8e000d9b4d7b", "571afa41d07c8e000d9acf90", "5720337fac2e820008c83cdb", "571af6e4ac2e820008c8350c", "571af80347690b0007fc746a", "571af6e4d07c8e000d9acf8e", "571afa4347690b0007fc746f", "571af6e5ac2e820008c8350d", "5720337fd07c8e000d9ad917", "571af6e5ac2e820008c8350e", "5712ef1947690b0007fc6411", "57119c1547690b0007fc633f", "57119168d07c8e000d9ac2a8", "571197f447690b0007fc6338", "571184d1ac2e820008c82994", "5711845747690b0007fc631c", "571197f8ac2e820008c829af", "57119503d07c8e000d9ac2b3", "571191c8d07c8e000d9ac2a9", "57118411d07c8e000d9ac297", "57119e38ac2e820008c829b8", "57119e43d07c8e000d9ac2c2", "57119c1447690b0007fc633d", "57119c1447690b0007fc633e", "57119c1647690b0007fc6340", "57119c17d07c8e000d9ac2ba", "57119a6547690b0007fc633b", "57119a6747690b0007fc633c", "57119a61ac2e820008c829b3", "57119a6147690b0007fc633a", "571197f7ac2e820008c829ae", "57119502d07c8e000d9ac2b2", "5711950347690b0007fc6333", "5711937b47690b0007fc632d", "571192e3ac2e820008c829a5", "57119216ac2e820008c829a4", "571190e247690b0007fc632a", "57118536ac2e820008c82995", "57119e3ad07c8e000d9ac2c1", "571afb7747690b0007fc7471", "571afa43d07c8e000d9acf91"], "photoCount": 41, "id": "5706e1629a077c000cbf1cbd", "metadata": {"lastUpdatedOnInMilliSeconds": 1472257612776, "displayName": "Photo Gallery", "sourceEvent": "feature-transition-on", "lastUpdatedBy": 6550608431, "pageType": "PHOTO_GALLERY", "type": "MAIN_PAGE"}}, "About Us": {"ownerId": "yc.client.305090", "photoIds": ["571afa41d07c8e000d9acf90", "5720337fac2e820008c83cdb", "571af6e4ac2e820008c8350c", "571af80347690b0007fc746a", "571af6e4d07c8e000d9acf8e", "571afa4347690b0007fc746f", "571af6e5ac2e820008c8350d", "5720337fd07c8e000d9ad917", "571af6e5ac2e820008c8350e", "5712ef1947690b0007fc6411", "57119c1547690b0007fc633f", "57119168d07c8e000d9ac2a8", "571197f447690b0007fc6338", "571184d1ac2e820008c82994", "5711845747690b0007fc631c", "571197f8ac2e820008c829af", "57119503d07c8e000d9ac2b3", "571191c8d07c8e000d9ac2a9", "57118411d07c8e000d9ac297", "57119e38ac2e820008c829b8", "57119e43d07c8e000d9ac2c2", "57119c1447690b0007fc633d", "57119c1447690b0007fc633e", "57119c1647690b0007fc6340", "57119c17d07c8e000d9ac2ba", "57119a6547690b0007fc633b", "57119a61ac2e820008c829b3", "57119a6147690b0007fc633a", "571197f7ac2e820008c829ae", "57119502d07c8e000d9ac2b2", "5711950347690b0007fc6333", "5711937b47690b0007fc632d", "571192e3ac2e820008c829a5", "57119216ac2e820008c829a4", "571190e247690b0007fc632a", "57118536ac2e820008c82995", "57119e3ad07c8e000d9ac2c1", "571afb7747690b0007fc7471", "571afa43d07c8e000d9acf91"], "photoCount": 39, "id": "5707d3d89a077c000cbf1db4", "metadata": {"lastUpdatedOnInMilliSeconds": 1472257612776, "displayName": "About Us", "name": "About Us", "sourceEvent": "website-content-create", "lastUpdatedBy": 6550608431, "pageType": "ABOUT_US", "type": "MAIN_PAGE"}}, "The HPS Difference ": {"ownerId": "yc.client.305090", "photoIds": ["571ac5b9d07c8e000d9acf7f", "571afa41d07c8e000d9acf90", "5720337fac2e820008c83cdb", "571af6e4ac2e820008c8350c", "571af80347690b0007fc746a", "571af6e4d07c8e000d9acf8e", "571afa4347690b0007fc746f", "571af6e5ac2e820008c8350d", "5720337fd07c8e000d9ad917", "571af6e5ac2e820008c8350e", "5712ef1947690b0007fc6411", "57119c1547690b0007fc633f", "57119168d07c8e000d9ac2a8", "571197f447690b0007fc6338", "571184d1ac2e820008c82994", "5711845747690b0007fc631c", "571197f8ac2e820008c829af", "57119503d07c8e000d9ac2b3", "571191c8d07c8e000d9ac2a9", "57118411d07c8e000d9ac297", "57119e38ac2e820008c829b8", "57119e43d07c8e000d9ac2c2", "57119c1447690b0007fc633d", "57119c1447690b0007fc633e", "57119c1647690b0007fc6340", "57119c17d07c8e000d9ac2ba", "57119a6547690b0007fc633b", "57119a61ac2e820008c829b3", "57119a6147690b0007fc633a", "571197f7ac2e820008c829ae", "57119502d07c8e000d9ac2b2", "5711950347690b0007fc6333", "5711937b47690b0007fc632d", "571192e3ac2e820008c829a5", "57119216ac2e820008c829a4", "571190e247690b0007fc632a", "57118536ac2e820008c82995", "57119e3ad07c8e000d9ac2c1", "571afb7747690b0007fc7471", "571afa43d07c8e000d9acf91"], "photoCount": 40, "id": "571e36d59a077c000cbf428c", "metadata": {"lastUpdatedOnInMilliSeconds": 1472257612776, "displayName": "The HPS Difference ", "name": "The HPS Difference ", "sourceEvent": "website-content-create", "lastUpdatedBy": 6550608431, "pageType": "The HPS Difference ", "type": "MAIN_PAGE"}}, "Commercial Floor Cleaning": {"ownerId": "yc.client.305090", "photoIds": ["571afb7747690b0007fc7471", "571afa43d07c8e000d9acf91", "571afa41d07c8e000d9acf90", "571af80347690b0007fc746a", "571af6e4ac2e820008c8350c", "571af6e4d07c8e000d9acf8e", "571af6e5ac2e820008c8350d", "571af6e5ac2e820008c8350e", "5712ef1947690b0007fc6411", "57119e3f47690b0007fc6348", "57119e43d07c8e000d9ac2c2", "57119e38ac2e820008c829b8", "57119e3ad07c8e000d9ac2c1", "57119c1447690b0007fc633d", "57119c1447690b0007fc633e", "57119c1547690b0007fc633f", "57119c1647690b0007fc6340", "57119c17d07c8e000d9ac2ba", "57119a61ac2e820008c829b3", "57119a6147690b0007fc633a", "571197f8ac2e820008c829af", "571197f7ac2e820008c829ae", "571197f447690b0007fc6338", "57119502d07c8e000d9ac2b2", "5711950347690b0007fc6333", "57119503d07c8e000d9ac2b3", "5711937b47690b0007fc632d", "571192e3ac2e820008c829a5", "57119216ac2e820008c829a4", "571191c8d07c8e000d9ac2a9", "57119168d07c8e000d9ac2a8", "57118536ac2e820008c82995", "571184d1ac2e820008c82994", "5711845747690b0007fc631c", "57118411d07c8e000d9ac297"], "photoCount": 35, "id": "5706fb911700fb00077507fa", "metadata": {"lastUpdatedOnInMilliSeconds": 1461727698935, "serviceGroupId": "1241465694", "displayName": "Commercial Floor Cleaning", "name": "Commercial Floor Cleaning", "sourceEvent": "website-content-create", "lastUpdatedBy": 6550608431, "type": "SERVICE_DETAIL"}}, "Carpet Cleaning": {"ownerId": "yc.client.305090", "photoIds": [], "photoCount": 0, "id": "5706fb921700fb00077507fb", "metadata": {"lastUpdatedOnInMilliSeconds": 1460942073240, "serviceGroupId": "177239194", "displayName": "Carpet Cleaning", "name": "Carpet Cleaning", "sourceEvent": "website-content-create", "lastUpdatedBy": 6550608431, "type": "SERVICE_DETAIL"}}, "All Photos": {"ownerId": "yc.client.305090", "photoIds": ["571afa41d07c8e000d9acf90", "5720337fac2e820008c83cdb", "57534f20d07c8e000d9b4d7b", "571af6e4ac2e820008c8350c", "571af80347690b0007fc746a", "571af6e4d07c8e000d9acf8e", "571afa4347690b0007fc746f", "571af6e5ac2e820008c8350d", "5720337fd07c8e000d9ad917", "571af6e5ac2e820008c8350e", "5712ef1947690b0007fc6411", "57119c1547690b0007fc633f", "57119168d07c8e000d9ac2a8", "571197f447690b0007fc6338", "571184d1ac2e820008c82994", "5711845747690b0007fc631c", "571197f8ac2e820008c829af", "57119503d07c8e000d9ac2b3", "571191c8d07c8e000d9ac2a9", "57118411d07c8e000d9ac297", "57119e38ac2e820008c829b8", "57119e43d07c8e000d9ac2c2", "57119c1447690b0007fc633d", "57119c1447690b0007fc633e", "57119c1647690b0007fc6340", "57119c17d07c8e000d9ac2ba", "57119a6547690b0007fc633b", "57119a6747690b0007fc633c", "57119a61ac2e820008c829b3", "57119a6147690b0007fc633a", "571197f7ac2e820008c829ae", "57119502d07c8e000d9ac2b2", "5711950347690b0007fc6333", "5711937b47690b0007fc632d", "571192e3ac2e820008c829a5", "57119216ac2e820008c829a4", "571190e247690b0007fc632a", "57118536ac2e820008c82995", "57119e3ad07c8e000d9ac2c1", "571afb7747690b0007fc7471", "571afa43d07c8e000d9acf91", "571ac5b9d07c8e000d9acf7f", "5712ef97ac2e820008c82a1f", "5712f003d07c8e000d9ac332", "571afb6fac2e820008c83513", "571afa3eac2e820008c83511", "57119e3f47690b0007fc6348"], "photoCount": 47, "id": "5706e1629a077c0007a15c63", "metadata": {"displayName": "All Photos", "lastUpdatedOnInMilliSeconds": 1472257627467, "lastUpdatedBy": 6550608431, "type": "ALL_PHOTOS", "sourceEvent": "feature-transition-on"}}, "Floor Waxing": {"ownerId": "yc.client.305090", "photoIds": ["571afa41d07c8e000d9acf90", "5720337fac2e820008c83cdb", "571af6e4ac2e820008c8350c", "571af80347690b0007fc746a", "571af6e4d07c8e000d9acf8e", "571afa4347690b0007fc746f", "571af6e5ac2e820008c8350d", "5720337fd07c8e000d9ad917", "571af6e5ac2e820008c8350e", "5712ef1947690b0007fc6411", "57119c1547690b0007fc633f", "57119168d07c8e000d9ac2a8", "571197f447690b0007fc6338", "571184d1ac2e820008c82994", "5711845747690b0007fc631c", "571197f8ac2e820008c829af", "57119503d07c8e000d9ac2b3", "571191c8d07c8e000d9ac2a9", "57118411d07c8e000d9ac297", "57119e38ac2e820008c829b8", "57119e43d07c8e000d9ac2c2", "57119c1447690b0007fc633d", "57119c1447690b0007fc633e", "57119c1647690b0007fc6340", "57119c17d07c8e000d9ac2ba", "57119a6547690b0007fc633b", "57119a61ac2e820008c829b3", "57119a6147690b0007fc633a", "571197f7ac2e820008c829ae", "57119502d07c8e000d9ac2b2", "5711950347690b0007fc6333", "5711937b47690b0007fc632d", "571192e3ac2e820008c829a5", "57119216ac2e820008c829a4", "571190e247690b0007fc632a", "57118536ac2e820008c82995", "57119e3ad07c8e000d9ac2c1", "571afb7747690b0007fc7471", "571afa43d07c8e000d9acf91"], "photoCount": 39, "id": "571e36d61700fb0007753002", "metadata": {"lastUpdatedOnInMilliSeconds": 1472257612776, "displayName": "Floor Waxing", "name": "Floor Waxing", "sourceEvent": "website-content-create", "lastUpdatedBy": 6550608431, "type": "SERVICE_DETAIL"}}, "Commercial Cleaning": {"ownerId": "yc.client.305090", "photoIds": ["571afa41d07c8e000d9acf90", "5720337fac2e820008c83cdb", "571af6e4ac2e820008c8350c", "571af80347690b0007fc746a", "571af6e4d07c8e000d9acf8e", "571afa4347690b0007fc746f", "571af6e5ac2e820008c8350d", "5720337fd07c8e000d9ad917", "571af6e5ac2e820008c8350e", "5712ef1947690b0007fc6411", "57119c1547690b0007fc633f", "57119168d07c8e000d9ac2a8", "571197f447690b0007fc6338", "571184d1ac2e820008c82994", "5711845747690b0007fc631c", "571197f8ac2e820008c829af", "57119503d07c8e000d9ac2b3", "571191c8d07c8e000d9ac2a9", "57118411d07c8e000d9ac297", "57119e38ac2e820008c829b8", "57119e43d07c8e000d9ac2c2", "57119c1447690b0007fc633d", "57119c1447690b0007fc633e", "57119c1647690b0007fc6340", "57119c17d07c8e000d9ac2ba", "57119a6547690b0007fc633b", "57119a61ac2e820008c829b3", "57119a6147690b0007fc633a", "571197f7ac2e820008c829ae", "57119502d07c8e000d9ac2b2", "5711950347690b0007fc6333", "5711937b47690b0007fc632d", "571192e3ac2e820008c829a5", "57119216ac2e820008c829a4", "571190e247690b0007fc632a", "57118536ac2e820008c82995", "57119e3ad07c8e000d9ac2c1", "571afb7747690b0007fc7471", "571afa43d07c8e000d9acf91"], "photoCount": 39, "id": "5706fb919a077c000cbf1ce3", "metadata": {"lastUpdatedOnInMilliSeconds": 1472257612776, "serviceGroupId": "177238826", "displayName": "Commercial Cleaning", "name": "Commercial Cleaning", "sourceEvent": "website-content-create", "lastUpdatedBy": 6550608431, "type": "SERVICE_DETAIL"}}, "Commercial Floor Cleaning And Renovating": {"ownerId": "yc.client.305090", "photoIds": ["57534f20d07c8e000d9b4d7b", "571afa41d07c8e000d9acf90", "5720337fac2e820008c83cdb", "571af6e4ac2e820008c8350c", "571af80347690b0007fc746a", "571af6e4d07c8e000d9acf8e", "571afa4347690b0007fc746f", "571af6e5ac2e820008c8350d", "5720337fd07c8e000d9ad917", "571af6e5ac2e820008c8350e", "5712ef1947690b0007fc6411", "57119c1547690b0007fc633f", "57119168d07c8e000d9ac2a8", "571197f447690b0007fc6338", "571184d1ac2e820008c82994", "5711845747690b0007fc631c", "571197f8ac2e820008c829af", "57119503d07c8e000d9ac2b3", "571191c8d07c8e000d9ac2a9", "57118411d07c8e000d9ac297", "57119e38ac2e820008c829b8", "57119e43d07c8e000d9ac2c2", "57119c1447690b0007fc633d", "57119c1447690b0007fc633e", "57119c1647690b0007fc6340", "57119c17d07c8e000d9ac2ba", "57119a6547690b0007fc633b", "57119a61ac2e820008c829b3", "57119a6147690b0007fc633a", "571197f7ac2e820008c829ae", "57119502d07c8e000d9ac2b2", "5711950347690b0007fc6333", "5711937b47690b0007fc632d", "571192e3ac2e820008c829a5", "57119216ac2e820008c829a4", "571190e247690b0007fc632a", "57118536ac2e820008c82995", "57119e3ad07c8e000d9ac2c1", "571afb7747690b0007fc7471", "571afa43d07c8e000d9acf91"], "photoCount": 40, "id": "571fa2971700fb0007753395", "metadata": {"lastUpdatedOnInMilliSeconds": 1472257612776, "displayName": "Commercial Floor Cleaning And Renovating", "name": "Commercial Floor Cleaning And Renovating", "sourceEvent": "website-content-create", "lastUpdatedBy": 6550608431, "type": "SERVICE_DETAIL"}}, "Home Page": {"ownerId": "yc.client.305090", "photoIds": ["571ac5b9d07c8e000d9acf7f", "571afa41d07c8e000d9acf90", "5720337fac2e820008c83cdb", "571af6e4ac2e820008c8350c", "571af80347690b0007fc746a", "571af6e4d07c8e000d9acf8e", "571afa4347690b0007fc746f", "571af6e5ac2e820008c8350d", "5720337fd07c8e000d9ad917", "571af6e5ac2e820008c8350e", "5712ef1947690b0007fc6411", "57119c1547690b0007fc633f", "57119168d07c8e000d9ac2a8", "571197f447690b0007fc6338", "571184d1ac2e820008c82994", "5711845747690b0007fc631c", "571197f8ac2e820008c829af", "57119503d07c8e000d9ac2b3", "571191c8d07c8e000d9ac2a9", "57118411d07c8e000d9ac297", "57119e38ac2e820008c829b8", "57119e43d07c8e000d9ac2c2", "57119c1447690b0007fc633d", "57119c1447690b0007fc633e", "57119c1647690b0007fc6340", "57119c17d07c8e000d9ac2ba", "57119a6547690b0007fc633b", "57119a61ac2e820008c829b3", "57119a6147690b0007fc633a", "571197f7ac2e820008c829ae", "57119502d07c8e000d9ac2b2", "5711950347690b0007fc6333", "5711937b47690b0007fc632d", "571192e3ac2e820008c829a5", "57119216ac2e820008c829a4", "571190e247690b0007fc632a", "57118536ac2e820008c82995", "57119e3ad07c8e000d9ac2c1", "571afb7747690b0007fc7471", "571afa43d07c8e000d9acf91"], "photoCount": 40, "id": "5706fb901700fb00077507f9", "metadata": {"lastUpdatedOnInMilliSeconds": 1472257612776, "displayName": "Home Page", "name": "Home Page", "sourceEvent": "website-content-create", "lastUpdatedBy": 6550608431, "pageType": "HOME_PAGE", "type": "MAIN_PAGE"}}};
        var photos = {"5712ef97ac2e820008c82a1f": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/942611/12.jpg", "fileName": "942611_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/942611/19.jpg", "fileName": "942611_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/942611/24.jpg", "fileName": "942611_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/942611/17.jpg", "fileName": "942611_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/942611/13.jpg", "fileName": "942611_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/942611/18.jpg", "fileName": "942611_18.jpg"}}, "id": "5712ef97ac2e820008c82a1f", "metadata": {"altText": "Before a completed cleaning service project in the  area", "description": "VCT Tile before stripping", "title": "Before pic 1", "userId": "4782758556", "lastUpdatedBy": 6550608431, "deviceType": "DESKTOP", "type": "BEFORE", "lastUpdatedOnMilliSeconds": 1472257168830}}, "57119168d07c8e000d9ac2a8": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/942163/12.jpg", "fileName": "942163_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/942163/19.jpg", "fileName": "942163_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/942163/24.jpg", "fileName": "942163_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/942163/17.jpg", "fileName": "942163_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/942163/13.jpg", "fileName": "942163_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/942163/18.jpg", "fileName": "942163_18.jpg"}}, "id": "57119168d07c8e000d9ac2a8", "metadata": {"deviceType": "DESKTOP", "userId": "4782758556", "description": "", "title": "Medical center, Boulder, CO"}}, "57119e38ac2e820008c829b8": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/942237/12.jpg", "fileName": "942237_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/942237/19.jpg", "fileName": "942237_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/942237/24.jpg", "fileName": "942237_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/942237/17.jpg", "fileName": "942237_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/942237/13.jpg", "fileName": "942237_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/942237/18.jpg", "fileName": "942237_18.jpg"}}, "id": "57119e38ac2e820008c829b8", "metadata": {"deviceType": "DESKTOP", "userId": "4782758556", "description": "VCT Tile", "title": "Medical Center, Westminster, CO"}}, "57118536ac2e820008c82995": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/942116/12.jpg", "fileName": "942116_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/942116/19.jpg", "fileName": "942116_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/942116/24.jpg", "fileName": "942116_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/942116/17.jpg", "fileName": "942116_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/942116/13.jpg", "fileName": "942116_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/942116/18.jpg", "fileName": "942116_18.jpg"}}, "id": "57118536ac2e820008c82995", "metadata": {"deviceType": "DESKTOP", "userId": "4782758556", "description": "VCT Tile", "title": "American Roofing, Commerce City, CO"}}, "57119a61ac2e820008c829b3": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/942216/12.jpg", "fileName": "942216_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/942216/19.jpg", "fileName": "942216_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/942216/24.jpg", "fileName": "942216_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/942216/17.jpg", "fileName": "942216_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/942216/13.jpg", "fileName": "942216_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/942216/18.jpg", "fileName": "942216_18.jpg"}}, "id": "57119a61ac2e820008c829b3", "metadata": {"deviceType": "DESKTOP", "userId": "4782758556", "description": "VCT Tile", "title": "Shoe Carnival, Lakewood, CO"}}, "57119e3f47690b0007fc6348": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/942240/12.jpg", "fileName": "942240_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/942240/19.jpg", "fileName": "942240_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/942240/24.jpg", "fileName": "942240_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/942240/17.jpg", "fileName": "942240_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/942240/13.jpg", "fileName": "942240_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/942240/18.jpg", "fileName": "942240_18.jpg"}}, "id": "57119e3f47690b0007fc6348", "metadata": {"deviceType": "DESKTOP", "userId": "4782758556", "description": "VCT Tile", "title": "Beauty School, Thornton, CO"}}, "57119c1647690b0007fc6340": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/942224/12.jpg", "fileName": "942224_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/942224/19.jpg", "fileName": "942224_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/942224/24.jpg", "fileName": "942224_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/942224/17.jpg", "fileName": "942224_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/942224/13.jpg", "fileName": "942224_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/942224/18.jpg", "fileName": "942224_18.jpg"}}, "id": "57119c1647690b0007fc6340", "metadata": {"deviceType": "DESKTOP", "userId": "4782758556", "description": "Epoxy Sealed Concrete", "title": "Superior Liquor, Superior, CO"}}, "57119216ac2e820008c829a4": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/942165/12.jpg", "fileName": "942165_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/942165/19.jpg", "fileName": "942165_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/942165/24.jpg", "fileName": "942165_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/942165/17.jpg", "fileName": "942165_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/942165/13.jpg", "fileName": "942165_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/942165/18.jpg", "fileName": "942165_18.jpg"}}, "id": "57119216ac2e820008c829a4", "metadata": {"deviceType": "DESKTOP", "userId": "4782758556", "description": "", "title": "Hair Salon, Commerce City, CO"}}, "571afa4347690b0007fc746f": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/949046/12.jpg", "fileName": "949046_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/949046/19.jpg", "fileName": "949046_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/949046/24.jpg", "fileName": "949046_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/949046/17.jpg", "fileName": "949046_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/949046/13.jpg", "fileName": "949046_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/949046/18.jpg", "fileName": "949046_18.jpg"}}, "id": "571afa4347690b0007fc746f", "metadata": {"deviceType": "DESKTOP", "userId": "4782758556", "description": "", "title": "Carpet"}}, "571ac5b9d07c8e000d9acf7f": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/948941/12.jpg", "fileName": "948941_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/948941/19.jpg", "fileName": "948941_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/948941/24.jpg", "fileName": "948941_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/948941/17.jpg", "fileName": "948941_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/948941/13.jpg", "fileName": "948941_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/948941/18.jpg", "fileName": "948941_18.jpg"}}, "id": "571ac5b9d07c8e000d9acf7f", "metadata": {"altText": "A recent cleaning service job in the  area", "description": "Jerry buffing Med Center VCT tile", "title": "Buffing ", "userId": "4782758556", "lastUpdatedBy": 6550608431, "deviceType": "DESKTOP", "type": "RECENT_JOB", "lastUpdatedOnMilliSeconds": 1472257506169}}, "57118411d07c8e000d9ac297": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/942108/12.jpg", "fileName": "942108_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/942108/19.jpg", "fileName": "942108_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/942108/24.jpg", "fileName": "942108_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/942108/17.jpg", "fileName": "942108_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/942108/13.jpg", "fileName": "942108_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/942108/18.jpg", "fileName": "942108_18.jpg"}}, "id": "57118411d07c8e000d9ac297", "metadata": {"deviceType": "DESKTOP", "userId": "4782758556", "description": "Epoxy Sealed Concrete", "title": "Superior Liquor, Superior, CO"}}, "571197f7ac2e820008c829ae": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/942206/12.jpg", "fileName": "942206_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/942206/19.jpg", "fileName": "942206_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/942206/24.jpg", "fileName": "942206_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/942206/17.jpg", "fileName": "942206_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/942206/13.jpg", "fileName": "942206_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/942206/18.jpg", "fileName": "942206_18.jpg"}}, "id": "571197f7ac2e820008c829ae", "metadata": {"deviceType": "DESKTOP", "userId": "4782758556", "description": "Commercial Grade Linoleum ", "title": "Medical Center, Lakewood, CO"}}, "571af6e4ac2e820008c8350c": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/949030/12.jpg", "fileName": "949030_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/949030/19.jpg", "fileName": "949030_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/949030/24.jpg", "fileName": "949030_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/949030/17.jpg", "fileName": "949030_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/949030/13.jpg", "fileName": "949030_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/949030/18.jpg", "fileName": "949030_18.jpg"}}, "id": "571af6e4ac2e820008c8350c", "metadata": {"deviceType": "DESKTOP", "userId": "4782758556", "description": "VCT Tile", "title": "Beauty School, Thornton, CO"}}, "5712f003d07c8e000d9ac332": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/942612/12.jpg", "fileName": "942612_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/942612/19.jpg", "fileName": "942612_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/942612/24.jpg", "fileName": "942612_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/942612/17.jpg", "fileName": "942612_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/942612/13.jpg", "fileName": "942612_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/942612/18.jpg", "fileName": "942612_18.jpg"}}, "id": "5712f003d07c8e000d9ac332", "metadata": {"altText": "After a completed cleaning service project in the  area", "description": "VCT Tile after finished", "title": "After pic 1", "userId": "4782758556", "lastUpdatedBy": 6550608431, "deviceType": "DESKTOP", "type": "AFTER", "lastUpdatedOnMilliSeconds": 1472257198293}}, "571afb6fac2e820008c83513": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/949053/12.jpg", "fileName": "949053_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/949053/19.jpg", "fileName": "949053_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/949053/24.jpg", "fileName": "949053_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/949053/17.jpg", "fileName": "949053_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/949053/13.jpg", "fileName": "949053_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/949053/18.jpg", "fileName": "949053_18.jpg"}}, "id": "571afb6fac2e820008c83513", "metadata": {"altText": "Before a completed cleaning service project in the  area", "description": "Scrubbing floor before wax and buff.", "title": "Medical center, Lakewood, CO", "userId": "4782758556", "lastUpdatedBy": 6550608431, "deviceType": "DESKTOP", "type": "BEFORE", "lastUpdatedOnMilliSeconds": 1472257411749}}, "57534f20d07c8e000d9b4d7b": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/987120/12.png", "fileName": "987120_12.png"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/987120/19.png", "fileName": "987120_19.png"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/987120/24.png", "fileName": "987120_24.png"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/987120/17.png", "fileName": "987120_17.png"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/987120/13.png", "fileName": "987120_13.png"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/987120/18.png", "fileName": "987120_18.png"}}, "id": "57534f20d07c8e000d9b4d7b", "metadata": {"altText": "A recent cleaning service job in the  area", "description": "Med Center, Denver VCT Tile", "title": "Buffing ", "userId": "4782758556", "lastUpdatedBy": 6550608431, "deviceType": "DESKTOP", "type": "RECENT_JOB", "lastUpdatedOnMilliSeconds": 1472256775260}}, "57119a6547690b0007fc633b": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/942218/12.jpg", "fileName": "942218_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/942218/19.jpg", "fileName": "942218_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/942218/24.jpg", "fileName": "942218_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/942218/17.jpg", "fileName": "942218_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/942218/13.jpg", "fileName": "942218_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/942218/18.jpg", "fileName": "942218_18.jpg"}}, "id": "57119a6547690b0007fc633b", "metadata": {"deviceType": "DESKTOP", "userId": "4782758556", "description": "Engineered, Press, Snap Together, Wood look Product", "title": "Great Clips, Highlands Ranch, CO"}}, "571af6e4d07c8e000d9acf8e": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/949031/12.jpg", "fileName": "949031_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/949031/19.jpg", "fileName": "949031_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/949031/24.jpg", "fileName": "949031_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/949031/17.jpg", "fileName": "949031_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/949031/13.jpg", "fileName": "949031_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/949031/18.jpg", "fileName": "949031_18.jpg"}}, "id": "571af6e4d07c8e000d9acf8e", "metadata": {"deviceType": "DESKTOP", "userId": "4782758556", "description": "VCT Tile", "title": "Beauty School"}}, "571afa3eac2e820008c83511": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/949044/12.jpg", "fileName": "949044_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/949044/19.jpg", "fileName": "949044_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/949044/24.jpg", "fileName": "949044_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/949044/17.jpg", "fileName": "949044_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/949044/13.jpg", "fileName": "949044_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/949044/18.jpg", "fileName": "949044_18.jpg"}}, "id": "571afa3eac2e820008c83511", "metadata": {"altText": "After a completed cleaning service project in the  area", "description": "After servicing ", "title": "Medical Center, Lakewood", "userId": "4782758556", "lastUpdatedBy": 6550608431, "deviceType": "DESKTOP", "type": "AFTER", "lastUpdatedOnMilliSeconds": 1472257456266}}, "571197f447690b0007fc6338": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/942205/12.jpg", "fileName": "942205_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/942205/19.jpg", "fileName": "942205_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/942205/24.jpg", "fileName": "942205_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/942205/17.jpg", "fileName": "942205_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/942205/13.jpg", "fileName": "942205_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/942205/18.jpg", "fileName": "942205_18.jpg"}}, "id": "571197f447690b0007fc6338", "metadata": {"deviceType": "DESKTOP", "userId": "4782758556", "description": "VCT Tile", "title": "Great Clips, Longmont, CO"}}, "571af80347690b0007fc746a": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/949038/12.jpg", "fileName": "949038_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/949038/19.jpg", "fileName": "949038_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/949038/24.jpg", "fileName": "949038_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/949038/17.jpg", "fileName": "949038_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/949038/13.jpg", "fileName": "949038_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/949038/18.jpg", "fileName": "949038_18.jpg"}}, "id": "571af80347690b0007fc746a", "metadata": {"deviceType": "DESKTOP", "userId": "4782758556", "description": "", "title": "Hair Salon, Commerce City, CO"}}, "571197f8ac2e820008c829af": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/942207/12.jpg", "fileName": "942207_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/942207/19.jpg", "fileName": "942207_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/942207/24.jpg", "fileName": "942207_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/942207/17.jpg", "fileName": "942207_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/942207/13.jpg", "fileName": "942207_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/942207/18.jpg", "fileName": "942207_18.jpg"}}, "id": "571197f8ac2e820008c829af", "metadata": {"deviceType": "DESKTOP", "userId": "4782758556", "description": "VCT Tile", "title": "Dental Center, Lakewood, CO"}}, "5711845747690b0007fc631c": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/942112/12.jpg", "fileName": "942112_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/942112/19.jpg", "fileName": "942112_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/942112/24.jpg", "fileName": "942112_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/942112/17.jpg", "fileName": "942112_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/942112/13.jpg", "fileName": "942112_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/942112/18.jpg", "fileName": "942112_18.jpg"}}, "id": "5711845747690b0007fc631c", "metadata": {"deviceType": "DESKTOP", "userId": "4782758556", "description": "Epoxy Sealed Concrete", "title": "Superior Liquor, Superior, CO"}}, "57119502d07c8e000d9ac2b2": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/942188/12.jpg", "fileName": "942188_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/942188/19.jpg", "fileName": "942188_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/942188/24.jpg", "fileName": "942188_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/942188/17.jpg", "fileName": "942188_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/942188/13.jpg", "fileName": "942188_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/942188/18.jpg", "fileName": "942188_18.jpg"}}, "id": "57119502d07c8e000d9ac2b2", "metadata": {"deviceType": "DESKTOP", "userId": "4782758556", "description": "VCT Tile", "title": "Shoe Carnival, Lakewood, CO"}}, "57119a6747690b0007fc633c": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/942219/12.jpg", "fileName": "942219_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/942219/19.jpg", "fileName": "942219_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/942219/24.jpg", "fileName": "942219_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/942219/17.jpg", "fileName": "942219_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/942219/13.jpg", "fileName": "942219_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/942219/18.jpg", "fileName": "942219_18.jpg"}}, "id": "57119a6747690b0007fc633c", "metadata": {"altText": "A happy customer of High Plains Services", "description": "Carpet", "title": "Great Clips, Highlands Ranch, CO", "userId": "4782758556", "lastUpdatedBy": 6550608431, "deviceType": "DESKTOP", "type": "HAPPY_CUSTOMER", "lastUpdatedOnMilliSeconds": 1472256999051}}, "57119e43d07c8e000d9ac2c2": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/942241/12.jpg", "fileName": "942241_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/942241/19.jpg", "fileName": "942241_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/942241/24.jpg", "fileName": "942241_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/942241/17.jpg", "fileName": "942241_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/942241/13.jpg", "fileName": "942241_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/942241/18.jpg", "fileName": "942241_18.jpg"}}, "id": "57119e43d07c8e000d9ac2c2", "metadata": {"deviceType": "DESKTOP", "userId": "4782758556", "description": "VCT Tile", "title": "Beauty School, Thornton, CO"}}, "571184d1ac2e820008c82994": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/942115/12.jpg", "fileName": "942115_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/942115/19.jpg", "fileName": "942115_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/942115/24.jpg", "fileName": "942115_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/942115/17.jpg", "fileName": "942115_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/942115/13.jpg", "fileName": "942115_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/942115/18.jpg", "fileName": "942115_18.jpg"}}, "id": "571184d1ac2e820008c82994", "metadata": {"deviceType": "DESKTOP", "userId": "4782758556", "description": "VCT Tile", "title": "American Roofing, Commerce City, CO"}}, "57119c1547690b0007fc633f": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/942223/12.jpg", "fileName": "942223_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/942223/19.jpg", "fileName": "942223_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/942223/24.jpg", "fileName": "942223_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/942223/17.jpg", "fileName": "942223_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/942223/13.jpg", "fileName": "942223_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/942223/18.jpg", "fileName": "942223_18.jpg"}}, "id": "57119c1547690b0007fc633f", "metadata": {"deviceType": "DESKTOP", "userId": "4782758556", "description": "Epoxy Sealed Concrete", "title": "Superior Liquor, Superior, CO"}}, "57119a6147690b0007fc633a": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/942217/12.jpg", "fileName": "942217_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/942217/19.jpg", "fileName": "942217_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/942217/24.jpg", "fileName": "942217_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/942217/17.jpg", "fileName": "942217_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/942217/13.jpg", "fileName": "942217_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/942217/18.jpg", "fileName": "942217_18.jpg"}}, "id": "57119a6147690b0007fc633a", "metadata": {"deviceType": "DESKTOP", "userId": "4782758556", "description": "VCT Tile", "title": "Shoe Carnival, Lakewood, CO"}}, "571afa41d07c8e000d9acf90": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/949045/12.jpg", "fileName": "949045_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/949045/19.jpg", "fileName": "949045_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/949045/24.jpg", "fileName": "949045_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/949045/17.jpg", "fileName": "949045_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/949045/13.jpg", "fileName": "949045_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/949045/18.jpg", "fileName": "949045_18.jpg"}}, "id": "571afa41d07c8e000d9acf90", "metadata": {"deviceType": "DESKTOP", "userId": "4782758556", "description": "Epoxy coated cement.", "title": "Superior Liquor, Superior, CO"}}, "57119503d07c8e000d9ac2b3": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/942190/12.jpg", "fileName": "942190_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/942190/19.jpg", "fileName": "942190_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/942190/24.jpg", "fileName": "942190_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/942190/17.jpg", "fileName": "942190_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/942190/13.jpg", "fileName": "942190_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/942190/18.jpg", "fileName": "942190_18.jpg"}}, "id": "57119503d07c8e000d9ac2b3", "metadata": {"deviceType": "DESKTOP", "userId": "4782758556", "description": "VCT Tile", "title": "Beauty School, Aurora, CO"}}, "5711950347690b0007fc6333": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/942189/12.jpg", "fileName": "942189_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/942189/19.jpg", "fileName": "942189_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/942189/24.jpg", "fileName": "942189_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/942189/17.jpg", "fileName": "942189_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/942189/13.jpg", "fileName": "942189_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/942189/18.jpg", "fileName": "942189_18.jpg"}}, "id": "5711950347690b0007fc6333", "metadata": {"deviceType": "DESKTOP", "userId": "4782758556", "description": "VCT Tile", "title": "Dental Center,Lakewood, CO"}}, "57119c1447690b0007fc633e": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/942222/12.jpg", "fileName": "942222_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/942222/19.jpg", "fileName": "942222_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/942222/24.jpg", "fileName": "942222_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/942222/17.jpg", "fileName": "942222_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/942222/13.jpg", "fileName": "942222_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/942222/18.jpg", "fileName": "942222_18.jpg"}}, "id": "57119c1447690b0007fc633e", "metadata": {"deviceType": "DESKTOP", "userId": "4782758556", "description": "VCT Tile", "title": "Shoe Carnival, Lakewood, CO"}}, "57119c1447690b0007fc633d": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/942221/12.jpg", "fileName": "942221_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/942221/19.jpg", "fileName": "942221_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/942221/24.jpg", "fileName": "942221_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/942221/17.jpg", "fileName": "942221_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/942221/13.jpg", "fileName": "942221_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/942221/18.jpg", "fileName": "942221_18.jpg"}}, "id": "57119c1447690b0007fc633d", "metadata": {"deviceType": "DESKTOP", "userId": "4782758556", "description": "VCT Tile", "title": "Shoe Carnival, Lakewood, CO"}}, "571afb7747690b0007fc7471": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/949054/12.jpg", "fileName": "949054_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/949054/19.jpg", "fileName": "949054_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/949054/24.jpg", "fileName": "949054_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/949054/17.jpg", "fileName": "949054_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/949054/13.jpg", "fileName": "949054_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/949054/18.jpg", "fileName": "949054_18.jpg"}}, "id": "571afb7747690b0007fc7471", "metadata": {"deviceType": "DESKTOP", "userId": "4782758556", "description": "", "title": "Medical center, Parker, CO"}}, "5720337fd07c8e000d9ad917": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/952206/12.jpg", "fileName": "952206_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/952206/19.jpg", "fileName": "952206_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/952206/24.jpg", "fileName": "952206_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/952206/17.jpg", "fileName": "952206_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/952206/13.jpg", "fileName": "952206_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/952206/18.jpg", "fileName": "952206_18.jpg"}}, "id": "5720337fd07c8e000d9ad917", "metadata": {"deviceType": "DESKTOP", "userId": "4782758556", "description": "Commercial Linoleum", "title": "Medical Center, Boulder, CO"}}, "571190e247690b0007fc632a": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/942158/12.jpg", "fileName": "942158_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/942158/19.jpg", "fileName": "942158_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/942158/24.jpg", "fileName": "942158_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/942158/17.jpg", "fileName": "942158_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/942158/13.jpg", "fileName": "942158_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/942158/18.jpg", "fileName": "942158_18.jpg"}}, "id": "571190e247690b0007fc632a", "metadata": {"deviceType": "DESKTOP", "userId": "4782758556", "description": "VCT", "title": "Medical Center, Denver"}}, "571192e3ac2e820008c829a5": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/942169/12.jpg", "fileName": "942169_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/942169/19.jpg", "fileName": "942169_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/942169/24.jpg", "fileName": "942169_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/942169/17.jpg", "fileName": "942169_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/942169/13.jpg", "fileName": "942169_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/942169/18.jpg", "fileName": "942169_18.jpg"}}, "id": "571192e3ac2e820008c829a5", "metadata": {"deviceType": "DESKTOP", "userId": "4782758556", "description": "VCT Tile", "title": "Daycare, Lakewood, CO"}}, "5712ef1947690b0007fc6411": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/942610/12.jpg", "fileName": "942610_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/942610/19.jpg", "fileName": "942610_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/942610/24.jpg", "fileName": "942610_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/942610/17.jpg", "fileName": "942610_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/942610/13.jpg", "fileName": "942610_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/942610/18.jpg", "fileName": "942610_18.jpg"}}, "id": "5712ef1947690b0007fc6411", "metadata": {"deviceType": "DESKTOP", "userId": "4782758556", "description": "VCT Tile", "title": "Shoe Carnival, Lakewood, CO"}}, "57119c17d07c8e000d9ac2ba": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/942225/12.jpg", "fileName": "942225_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/942225/19.jpg", "fileName": "942225_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/942225/24.jpg", "fileName": "942225_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/942225/17.jpg", "fileName": "942225_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/942225/13.jpg", "fileName": "942225_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/942225/18.jpg", "fileName": "942225_18.jpg"}}, "id": "57119c17d07c8e000d9ac2ba", "metadata": {"deviceType": "DESKTOP", "userId": "4782758556", "description": "Epoxy Sealed Concrete", "title": "Superior Liquor, Superior, CO"}}, "571af6e5ac2e820008c8350d": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/949032/12.jpg", "fileName": "949032_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/949032/19.jpg", "fileName": "949032_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/949032/24.jpg", "fileName": "949032_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/949032/17.jpg", "fileName": "949032_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/949032/13.jpg", "fileName": "949032_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/949032/18.jpg", "fileName": "949032_18.jpg"}}, "id": "571af6e5ac2e820008c8350d", "metadata": {"deviceType": "DESKTOP", "userId": "4782758556", "description": "VCT Tile", "title": "Beauty School, Aurora, CO"}}, "571af6e5ac2e820008c8350e": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/949033/12.jpg", "fileName": "949033_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/949033/19.jpg", "fileName": "949033_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/949033/24.jpg", "fileName": "949033_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/949033/17.jpg", "fileName": "949033_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/949033/13.jpg", "fileName": "949033_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/949033/18.jpg", "fileName": "949033_18.jpg"}}, "id": "571af6e5ac2e820008c8350e", "metadata": {"deviceType": "DESKTOP", "userId": "4782758556", "description": "VCT Tile", "title": "Beauty School"}}, "5720337fac2e820008c83cdb": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/952207/12.jpg", "fileName": "952207_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/952207/19.jpg", "fileName": "952207_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/952207/24.jpg", "fileName": "952207_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/952207/17.jpg", "fileName": "952207_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/952207/13.jpg", "fileName": "952207_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/952207/18.jpg", "fileName": "952207_18.jpg"}}, "id": "5720337fac2e820008c83cdb", "metadata": {"deviceType": "DESKTOP", "userId": "4782758556", "description": "Commercial Linoleum ", "title": "Medical center, Boulder, CO"}}, "57119e3ad07c8e000d9ac2c1": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/942238/12.jpg", "fileName": "942238_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/942238/19.jpg", "fileName": "942238_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/942238/24.jpg", "fileName": "942238_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/942238/17.jpg", "fileName": "942238_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/942238/13.jpg", "fileName": "942238_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/942238/18.jpg", "fileName": "942238_18.jpg"}}, "id": "57119e3ad07c8e000d9ac2c1", "metadata": {"deviceType": "DESKTOP", "userId": "4782758556", "description": "VCT Tile", "title": "Pharmacy, Golden, CO"}}, "571afa43d07c8e000d9acf91": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/949047/12.jpg", "fileName": "949047_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/949047/19.jpg", "fileName": "949047_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/949047/24.jpg", "fileName": "949047_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/949047/17.jpg", "fileName": "949047_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/949047/13.jpg", "fileName": "949047_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/949047/18.jpg", "fileName": "949047_18.jpg"}}, "id": "571afa43d07c8e000d9acf91", "metadata": {"deviceType": "DESKTOP", "userId": "4782758556", "description": "", "title": "Great Clips"}}, "571191c8d07c8e000d9ac2a9": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/942164/12.jpg", "fileName": "942164_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/942164/19.jpg", "fileName": "942164_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/942164/24.jpg", "fileName": "942164_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/942164/17.jpg", "fileName": "942164_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/942164/13.jpg", "fileName": "942164_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/942164/18.jpg", "fileName": "942164_18.jpg"}}, "id": "571191c8d07c8e000d9ac2a9", "metadata": {"deviceType": "DESKTOP", "userId": "4782758556", "description": "VCT Tile", "title": "Great Clips, Commerce City, CO"}}, "5711937b47690b0007fc632d": {"ownerId": "yc.client.305090", "resolutions": {"SCALED_TO_FIT_1000x1000": {"uri": "http://cdn.ycdn.io/images/942172/12.jpg", "fileName": "942172_12.jpg"}, "SCALED_TO_HEIGHT_60": {"uri": "http://cdn.ycdn.io/images/942172/19.jpg", "fileName": "942172_19.jpg"}, "SCALED_TO_WIDTH_622": {"uri": "http://cdn.ycdn.io/images/942172/24.jpg", "fileName": "942172_24.jpg"}, "SCALED_TO_FIT_398x280": {"uri": "http://cdn.ycdn.io/images/942172/17.jpg", "fileName": "942172_17.jpg"}, "SCALED_TO_HEIGHT_160": {"uri": "http://cdn.ycdn.io/images/942172/13.jpg", "fileName": "942172_13.jpg"}, "SCALED_TO_FIT_682x350": {"uri": "http://cdn.ycdn.io/images/942172/18.jpg", "fileName": "942172_18.jpg"}}, "id": "5711937b47690b0007fc632d", "metadata": {"deviceType": "DESKTOP", "userId": "4782758556", "description": "", "title": "Medical Center"}}};
        var photoGalleryPhotoList = photoLists['Photo Gallery'];

        var slides = [];

        for (var i = 0; i < photoGalleryPhotoList.photoIds.length; i++) {
            var photoId = photoGalleryPhotoList.photoIds[i];
            var photo = photos[photoId];

            var slide = {
                image_title: photo.metadata.title,
                image_caption: photo.metadata.description,
                image_alt: photo.metadata.altText
            };

            slides.push(slide);
        }

	var $title = $('#gallery-lightbox .caption-wrapper .title'),
		$caption = $('#gallery-lightbox .caption-wrapper .caption');

    var $lightbox = $('#gallery-lightbox'),
        lightboxWidthOriginal = $lightbox.outerWidth();

	function changeCaption(pos) {
		$title.text(slides[pos].image_title);
		$caption.text(slides[pos].image_caption);
	}

	$('.photo-thumbnails-module .project').each(function(){
        var $this = $(this),
        	$image = $this.find('.image'),
        	$wrapper = $image.parent(),
        	imageWidth, imageHeight;

        // Render image based on focus point
        // To solve the cache issue in chrome, reload image here

        var d = new Date();

        $image.attr('src', "");
        $image.attr('src', $image.attr('data-src') + "?v=" + d.getTime());

        $image.load(function() {
        	imageWidth = $image.width();
        	imageHeight = $image.height();

        	$wrapper.attr('data-image-w', imageWidth);
        	$wrapper.attr('data-image-h', imageHeight);

        	$wrapper.focusPoint();

        	$image.addClass('loaded');
        });

        //Click to open lightbox
        $this.on('click', function(evt){
        	evt.preventDefault();

            var windowWidth = $(window).width();

        	if(windowWidth < lightboxWidthOriginal) {
                $lightbox.css('width', windowWidth*0.9 +"px");
            }

            window.lofthaus.ui.lightbox.open('#gallery-lightbox');
            current = parseInt($this.attr('data-gallery-index'));


            //Init photo gallery slider
			var $photoGalleryLightbox = $('#photo-gallery-lightbox').on('fotorama:ready', function(e, fotorama){
				var $this = $(this);

				// Show loaded image 
				$this.addClass('ready');
			})
			.on('fotorama:show', function(e, fotorama) {
				changeCaption(fotorama.activeIndex);
			}).fotorama({
				ratio: 5/3,
				width: '100%',
				nav: 'none',
                fit: 'scaledown',
				startindex: current,
				transition: 'dissolve',
                keyboard: true
			}),
				fotoramaLightbox = $photoGalleryLightbox.data('fotorama'),
				$galleryCtrlLightbox = $photoGalleryLightbox.find('.fotorama__arr');

			fotoramaLightbox.show(current);
        });

    });

    //Resize photo gallery lightbox

    $(window).resize(function(){
        if($lightbox.is(":visible")) {
            var windowWidth = $(window).width(),
                lightboxWidth = $lightbox.outerWidth();

            if(windowWidth <= lightboxWidthOriginal) {
                $lightbox.css("width",windowWidth*0.9+"px");
            }
            else {
                $lightbox.css("width",lightboxWidthOriginal+"px");
            }
        }
    });


    $('.photo-thumbnails-toggle').each(function(){
    	var $this = $(this),
    		selectorId = $this.attr('data-toggle-target'),
    		$selector = $('#'+selectorId);

    	$this.on('click', function() {
    		if ($selector.hasClass('open')) {
    			$selector.removeClass('open');
    		}
    		else {
    			$selector.addClass('open');
    		}
    	});
    });
});  
                    function initTeamSlides() {

    var $teamSlidesMobile = $("#team-slider-mobile");
    $teamSlidesMobile.responsiveSlides({
        auto: false,
        pager: false,
        speed: 0,
        timeout: 5000,
        prevText: "",
        nextText: "",
        nav: true
    });

    /* slider for team on desktop */
    $('#js-all-bios').slick({
      infinite: false,
      slidesToShow: 3,
      slidesToScroll: 3,
      draggable: false
    });
    /* and the modal for each slider */
    $('#js-all-bios li').each(function() {
      var $this = $(this);

      var readMoreLink = $this.find(".link");
      var lightboxId = readMoreLink.attr("data-bio-index");

      readMoreLink.on('click', function(evt) {
        evt.preventDefault();
        window.lofthaus.ui.lightbox.open('#bio-lightbox-' + lightboxId);
      });
    });
}

$(document).ready(function(){

	initTeamSlides();

	$('.team-module .bio-item').each(function() {
		var $this = $(this);

    var readMoreLink = $this.find(".more-link .link");
    var avatar = $this.find(".avatar");

		var lightboxId = readMoreLink.attr("data-bio-index");

		readMoreLink.on('click', function(evt){
			evt.preventDefault();

            window.lofthaus.ui.lightbox.open('#bio-lightbox-' + lightboxId);

            if ('layout-heron' == 'layout-albatross') {
                $(".smart-crop").each(function(){

                    var cropWindow = $(this);
                    var cropImage = $(this).find("img");

                    cropWindow.css("overflow", "hidden");

                    cropImage.css("height", "auto");
                    cropImage.css("width", "auto");

                    if (cropImage.width() > cropImage.height()) {

                        cropImage.css("width", "100%");

                        var cropWindowHeight = cropWindow.height();
                        var difference = (cropWindowHeight - cropImage.height()) / 2;

                        cropImage.css("top", difference + "px");

                    }

                    else if (cropImage.width() < cropImage.height()) {

                        cropImage.css("height", "100%");

                    }

                    else {

                        cropImage.css("width", "100%");

                    }

                });

            }
		});

        avatar.on('click', function(evt){
            evt.preventDefault();

            window.lofthaus.ui.lightbox.open('#bio-lightbox-' + lightboxId);

            if ('layout-heron' == 'layout-albatross') {
                $(".smart-crop").each(function(){

                    var cropWindow = $(this);
                    var cropImage = $(this).find("img");

                    cropWindow.css("overflow", "hidden");

                    cropImage.css("height", "auto");
                    cropImage.css("width", "auto");

                    if (cropImage.width() > cropImage.height()) {

                        cropImage.css("width", "100%");

                        var cropWindowHeight = cropWindow.height();
                        var difference = (cropWindowHeight - cropImage.height()) / 2;

                        cropImage.css("top", difference + "px");

                    }

                    else if (cropImage.width() < cropImage.height()) {

                        cropImage.css("height", "100%");

                    }

                    else {

                        cropImage.css("width", "100%");

                    }

                });

            }

        });
	})
});  
                    $(function () {
  /* Debounce helper */
  function debounce(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() { timeout = null; if (!immediate) {func.apply(context, args);}};
      var callNow = immediate && !timeout; clearTimeout(timeout);
      timeout = setTimeout(later, wait); if (callNow) {func.apply(context, args);}
    };
  }

  /* Settings */
  var defaultMaxHeight = 100;
  var maxQty = 20;
  var defaults = {
    speed: 400,
    maxHeight: defaultMaxHeight,
    moreLink: '<a href="#" class="link">Read More<i class="icon-readmore">v</i></a>',
    lessLink: '<a href="#" class="link">Read Less<i class="icon-readmore">^</i></a>'
  };

  /**
  * Readmore Handler.
  */
  function readMoreFor (selector, limit) {
    var maxLimit = limit || maxQty;
    $(selector).slice(0, maxLimit).each(function() {
      var $this = $(this);
      var height = $this.attr('data-height') ? +$this.attr('data-height') : defaultMaxHeight;
      var settings = $.extend(defaults, { maxHeight: height });
      $this.readmore(settings);

      /* if the `data-desktop-height` value is given,
      *  set the height to that value for desktop. ie > 450px
      */
      if ($this.attr('data-desktop-height')) {
        var isDesktop = Modernizr.mq('(min-width: 450px)');
        var readmoreHeight = isDesktop ? parseInt($this.attr('data-desktop-height')) : parseInt($this.attr('data-height'));
        var desktopSetting = $.extend(defaults, { maxHeight: readmoreHeight });
        $this.readmore(desktopSetting);
      }
    });
  }

  /** main */
  var main = (function () {
    var callMain = function () {
      readMoreFor('.content-block .readmore');
      readMoreFor('.responsive-reviews-module .readmore');
      readMoreFor('.jsq-readmore'); /* usage: <div class="jsq-readmore"><p>.</p></div> */
    };
    callMain();
    return callMain;
  })();

  $(window).on('resize', debounce(function () { main(); }, 200));
});  
                    window.lofthaus = window.lofthaus || {};
window.lofthaus.contactform = (function ($) {

    var FORM_SELECTOR = '.simple-contact-form-module form.contact-form',
        SUPPORTED_FIELDS = 'input:not("[type=submit], [type=button], [type=hidden]"):visible, textarea:visible, select:visible';
    var STATUS_MESSAGE_SELECTOR = '.simple-contact-form-module .status-message',
        RESET_BUTTON = '.simple-contact-form-module .status-message .reset-button';

    var $form = $(FORM_SELECTOR),
        $fields = $form.find(SUPPORTED_FIELDS),
        $statusMessage = $(STATUS_MESSAGE_SELECTOR);

    function showSubmitSuccessStatusMessage() {
        $form.fadeOut(500, function() {
            $statusMessage.fadeIn(500);
        });
    }

    function trackSessionWebLead() {
        ga('send', 'event', 'conversions', 'click', 'desktop and responsive form submission');
    }

    function onSubmitSuccess(responseData) {
        showSubmitSuccessStatusMessage();
        trackSessionWebLead();
    }

    function initSpamTrap() {
        var spamTrap = $form.find('input[name="_yodleST"]');
        var formButton = $form.find(' .form-footer #contactBtn');
        formButton.click(function (event) {
            spamTrap.val('x537hd');
            return true;
        });
    }

    function getErrorMessageByType(type) {
        switch(type) {
            case 'required':
                return 'Required.';
            //end required
            case 'email':
                return 'Invalid email address.';

            case 'tel':
                return 'Invalid phone number.';

            case 'url':
                return 'Invalid web URL.';

            case 'zip':
                return 'Invalid zip code.';

            case 'number':
                return 'Invalid number.';

            case 'currency':
                return 'Invalid amount';

            case 'rate':
                return 'Invalid percentage (0-100).';

            case 'custom':
                return invalidMessage;
            default:
                return 'Invalid entry.';
        }
    }

    function getAllValidators($selector) {
        var validators = {},
            dataInputType = $selector.attr('data-input-type');

        if($selector.attr('required')) {
            validators.notEmpty = {
                message: getErrorMessageByType("required")
            };
        }
        if($selector.attr('type')==='email' || dataInputType==='email') {
            validators.emailAddress = {
                message: getErrorMessageByType("email")
            };
        }
        if(dataInputType==='tel') {
            validators.phone = {
                country: 'US',
                message: getErrorMessageByType("tel")
            };
        }

        return validators;
    }

    function getAllFields() {
        var allFields={};

        $fields.each(function() {
            var $this = $(this),
                validators = getAllValidators($this),
                name = $this.attr('name');

            allFields[name] = {
                validators: validators,
                trigger: 'blur'
            };
        });

        return allFields;
    }

    function initFormValidation() {


        $form.bootstrapValidator({
            fields: getAllFields()
        })
        .on('success.form.bv', function(e) {
            e.preventDefault();

            var $currentForm = $(e.target);
            var bv = $currentForm.data('bootstrapValidator');

            $.post('/capture.weblead.ajax', $form.serialize(), function(){
                onSubmitSuccess();
                $form.bootstrapValidator('resetForm', true);
            }, 'json');
        });
    }

    function initNewMessageButton() {
        $(RESET_BUTTON).on('click', function() {
            $statusMessage.fadeOut(500, function() {
                $form.fadeIn(500);
            });
        });
    }

    return {
        init: function(){
            initFormValidation();
            initNewMessageButton();
            
            initSpamTrap();
        }
    };

})(jQuery);

$(document).ready(function($) {
    window.lofthaus.contactform.init();
});  
        
        
                    $(document).ready(function(){
	if($('#paymentMethodsTrigger').length) {
		$('#paymentMethodsTrigger').on('click', function(e) {
			e.preventDefault();
			window.lofthaus.ui.lightbox.open('#paymentMethodsLightbox');
		});

		var $paymentMethodsLightbox = $('#paymentMethodsLightbox');
		$(window).resize(function(){
			if($(window).width() <= 956) {
		        //resize lightbox container
		        $paymentMethodsLightbox.css('width',0.9*$(window).width());
		    } 
		    else {
		    	$paymentMethodsLightbox.css('width', "956px");
		    }  
		});
	}
});  
                    window.lofthaus = window.lofthaus || {};
window.lofthaus.openstatus = (function ($) {
    var OPEN_TEXT = "<span class=\"open\">We're Open. </span><span class=\"action\">Call Now!</span>",
        DEFAULT_TEXT = "Call Today";

    if ('layout-heron' == 'layout-albatross') {
        var OPEN_TEXT = "Call Now",
            DEFAULT_TEXT = "Call";

        var OVERLAY_OPEN_TEXT = "We're Open.";
    }

    function getOpenStatus() {
        var tzo = '-600';
        if (tzo == 'None') {
            tzo = clientLocal.getTimezoneOffset(); 
        }

        var hours = {"showBusinessOpenOnWebsite": true, "collectedBy": "", "monday": {"status": "OPEN", "closeMilitaryTime": 2200, "openMilitaryTime": 1400}, "tuesday": {"status": "OPEN", "closeMilitaryTime": 2200, "openMilitaryTime": 1400}, "friday": {"status": "OPEN", "closeMilitaryTime": 2200, "openMilitaryTime": 1400}, "wednesday": {"status": "OPEN", "closeMilitaryTime": 2200, "openMilitaryTime": 1400}, "thursday": {"status": "OPEN", "closeMilitaryTime": 2200, "openMilitaryTime": 1400}, "sunday": {"status": "BY_APPOINTMENT", "closeMilitaryTime": 1700, "openMilitaryTime": 900}, "showHoursOnWebsite": true, "emergency_247": null, "saturday": {"status": "OPEN", "closeMilitaryTime": 2200, "openMilitaryTime": 1400}, "id": 6550608426},
            bizLocal = 0 - parseInt(tzo)/100,
            clientLocal = new Date(),
            relativeOffset = clientLocal.getTimezoneOffset()/60 - bizLocal,
            days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

        if (hours.showHoursOnWebsite && hours.showBusinessOpenOnWebsite) {
            var clientHour = clientLocal.getHours() + relativeOffset,
                clientMinutes = clientLocal.getMinutes().toString();
                clientDay = clientLocal.getDay();
                
            var clientTime, openTime, closeTime, bizDayName, bizDay;

            if (clientHour>=24) {
                clientDay = clientDay+1;
                clientHour = clientHour-24;
            }
            if (clientHour<0)  {
                clientDay = clientDay-1;
                clientHour = clientHour + 24;
            }
            
            bizDayName = days[clientDay];
            bizDay = hours[bizDayName];

            if (bizDay.status=="OPEN_ALL_DAY") {
                return true;
            }


            if (bizDay.status=="OPEN") {
                openTime = bizDay.openMilitaryTime;
                closeTime = bizDay.closeMilitaryTime;

                clientHour = clientHour.toString();
                if ( clientMinutes.length == 1 ) {
                    clientMinutes = '0' + clientMinutes;
                }
                clientTime = parseInt(clientHour + clientMinutes);

                
                if(clientTime>=openTime && clientTime < closeTime) {
                    return true;
                }
            }
        }
        
        return false;
    }

    function initOpenText() {
        var $heading = $('#open-status');

        if(getOpenStatus()) {
            $heading.html(OPEN_TEXT);
        }
        else {
            $heading.html(DEFAULT_TEXT);
        }

        if ('layout-heron' == 'layout-albatross') {
            var $heading = $('#overlay-open-status');

            if(getOpenStatus()) {
                $heading.html(OVERLAY_OPEN_TEXT);
            }
            else {
                $heading.html("");
            }
        }

    }

    return {
        initOpenText: initOpenText
    };
})(jQuery);

$(document).ready(function() {
	window.lofthaus.openstatus.initOpenText();
});  
                    $(document).ready(function($) {

    function onSubmitSuccess() {
        $('.simple-referral-module .module-body').hide();
        $('.simple-referral-module .thanks-message').show();
    }

    function onSubmitError() {
        alert("Error submitting referral. Please try again.")
    }

    function getUrlParameterByName(name) {
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }


    if (getUrlParameterByName('referrer')) {
        window.lofthaus.ui.lightbox.open('#referralLightbox');

        $('.simple-referral-module #close-button').click(function() {
            window.lofthaus.ui.lightbox.close('#referralLightbox');
        });

        $('#referrer-id-input').val(getUrlParameterByName('referrer'));



        $('.simple-referral-module .form').bootstrapValidator ({
            framework: 'bootstrap',
            fields: {

                firstName1: {
                    validators: {
                        notEmpty: { message: "Required." }
                    },
                    trigger: 'blur keyup'
                },
                email1: {
                    validators: {
                        notEmpty: { message: "Required." },
                        emailAddress: { message: "Invalid email address." }
                    },
                    trigger: 'blur keyup'
                },
                email2: {
                    validators: {
                        emailAddress: { message: "Invalid email address." }
                    },
                    trigger: 'blur keyup'
                },
                email3: {
                    validators: {
                        emailAddress: { message: "Invalid email address." }
                    },
                    trigger: 'blur keyup'
                }

            }
        })
        .on('success.form.bv', function(e) {
            e.preventDefault();

            var $currentForm = $(e.target);
            var bv = $currentForm.data('bootstrapValidator');

            $.post('http://labs.natpal.com/referral', $('.simple-referral-module .form').serialize(), function(){
                onSubmitSuccess();
                $('.simple-referral-module .form').bootstrapValidator('resetForm', true);
            });
        });
    };


});


  
                    $(document).ready(function(){

	$.fn.bookAppiontmentWidget = function() {

        window.lofthaus.ui.lightbox.open('#book-now-modal');

        var openDays = ['BY_APPOINTMENT', 'OPEN', 'OPEN', 'OPEN', 'OPEN', 'OPEN', 'OPEN'];

        var openTimes = {
            sunday: {
                open: '900',
                close: '1700'
            },
            monday: {
                open: '1400',
                close: '2200'
            },
            tuesday: {
                open: '1400',
                close: '2200'
            },
            wednesday: {
                open: '1400',
                close: '2200'
            },
            thursday: {
                open: '1400',
                close: '2200'
            },
            friday: {
                open: '1400',
                close: '2200'
            },
            saturday: {
                open: '1400',
                close: '2200'
            }
        }

        $("#timepicker").timepicker({
            timeFormat: 'h:mm p',
            minTime: '9:00',
            interval: '30',
            maxTime: '17:00',
            change: function(time) {
                $("#timepicker").trigger("change");
            }
        });

        $("#datepicker").datepicker({
            showAnim: "slideDown",
            minDate: '0',
            beforeShowDay: function(date) {

                if (openDays[date.getDay()] == "CLOSED" || openDays[date.getDay()] == "BY_APPOINTMENT") {
                    return [false, ''];
                } else {
                    return [true, ''];
                }

            },
            onSelect: function(){
                $("#timepicker").prop('disabled', false);

                $("#timepicker").val('');
                $(".ui-timepicker-standard .ui-timepicker-viewport").scrollTop(0);

                var date = $(this).datepicker('getDate');
                var dayOfWeek = date.getUTCDay();

                var dayOfWeekName = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"][dayOfWeek];

                $('#timepicker').data('TimePicker').options.minTime = openTimes[dayOfWeekName].open;
                $('#timepicker').data('TimePicker').options.maxTime = openTimes[dayOfWeekName].close;
                $('#timepicker').data('TimePicker').items = null;
                $('#timepicker').data('TimePicker').widget.instance = null;

            }
        });

        $('#book-now-modal .book-now-form').bootstrapValidator ({
            framework: 'bootstrap',
            fields: {

                appointmentName: {
                    validators: {
                        notEmpty: { message: "Required." }
                    },
                    trigger: 'blur keyup'
                },
                appointmentEmail: {
                    validators: {
                        emailAddress: { message: "Invalid email address." }
                    },
                    trigger: 'blur keyup'
                },
                appointmentDate: {
                    validators: {
                        notEmpty: { message: "Required." }
                    },
                    trigger: 'change'
                },
                appointmentTime: {
                    validators: {
                        notEmpty: { message: "Required." }
                    },
                    trigger: 'change'
                }

            }
        })
        .on('success.form.bv', function(e) {
            e.preventDefault();

            console.log("submitted");

            var $currentForm = $(e.target);
            var bv = $currentForm.data('bootstrapValidator');

                    $.ajax({
                        type: "GET",
                        url: 'http://labs.natpal.com/trk/lead',
                        data: $('#book-now-modal .book-now-form').serialize(),
                        dataType: 'jsonp',
                        complete: function(){
                            $("#book-now-modal .modal-info .intro").hide();
                            $('#book-now-modal .book-now-form').hide();
                            $('#book-now-modal .book-now-form').bootstrapValidator('resetForm', true);

                            $("#book-now-modal .modal-info .confirmation-message").show();
                        }
                    });
                });

    };

    $(".navbar-header #book-now-modal").remove();

	$(".book-now-button").on('click', function(evt){
		evt.preventDefault();
        $(this).bookAppiontmentWidget();
	});

	/**
     * jQuery Timepicker - v1.3.2 - 2014-09-13
     * http://timepicker.co
     *
     * Enhances standard form input fields helping users to select (or type) times.
     *
     * Copyright (c) 2014 Willington Vega; Licensed MIT, GPL
     */

    if (typeof jQuery !== 'undefined') {
        (function($, undefined) {

            function pad(str, ch, length) {
                return (new Array(length + 1 - str.length).join(ch)) + str;
            }

            function normalize() {
                if (arguments.length === 1) {
                    var date = arguments[0];
                    if (typeof date === 'string') {
                        date = $.fn.timepicker.parseTime(date);
                    }
                    return new Date(0, 0, 0, date.getHours(), date.getMinutes(), date.getSeconds());
                } else if (arguments.length === 3) {
                    return new Date(0, 0, 0, arguments[0], arguments[1], arguments[2]);
                } else if (arguments.length === 2) {
                    return new Date(0, 0, 0, arguments[0], arguments[1], 0);
                } else {
                    return new Date(0, 0, 0);
                }
            }

            $.TimePicker = function() {
                var widget = this;

                widget.container = $('.ui-timepicker-container');
                widget.ui = widget.container.find('.ui-timepicker');

                if (widget.container.length === 0) {
                    widget.container = $('<div></div>').addClass('ui-timepicker-container')
                                        .addClass('ui-timepicker-hidden ui-helper-hidden')
                                        .appendTo('body')
                                        .hide();
                    widget.ui = $( '<div></div>' ).addClass('ui-timepicker')
                                        .addClass('ui-widget ui-widget-content ui-menu')
                                        .addClass('ui-corner-all')
                                        .appendTo(widget.container);
                    widget.viewport = $('<ul></ul>').addClass( 'ui-timepicker-viewport' )
                                        .appendTo( widget.ui );

                    if ($.fn.jquery >= '1.4.2') {
                        widget.ui.delegate('a', 'mouseenter.timepicker', function() {
                            // passing false instead of an instance object tells the function
                            // to use the current instance
                            widget.activate(false, $(this).parent());
                        }).delegate('a', 'mouseleave.timepicker', function() {
                            widget.deactivate(false);
                        }).delegate('a', 'click.timepicker', function(event) {
                            event.preventDefault();
                            widget.select(false, $(this).parent());
                        });
                    }

                    widget.ui.bind('click.timepicker, scroll.timepicker', function() {
                        clearTimeout(widget.closing);
                    });
                }
            };

            $.TimePicker.count = 0;
            $.TimePicker.instance = function() {
                if (!$.TimePicker._instance) {
                    $.TimePicker._instance = new $.TimePicker();
                }
                return $.TimePicker._instance;
            };

            $.TimePicker.prototype = {
                // extracted from from jQuery UI Core
                // http://github,com/jquery/jquery-ui/blob/master/ui/jquery.ui.core.js
                keyCode: {
                    ALT: 18,
                    BLOQ_MAYUS: 20,
                    CTRL: 17,
                    DOWN: 40,
                    END: 35,
                    ENTER: 13,
                    HOME: 36,
                    LEFT: 37,
                    NUMPAD_ENTER: 108,
                    PAGE_DOWN: 34,
                    PAGE_UP: 33,
                    RIGHT: 39,
                    SHIFT: 16,
                    TAB: 9,
                    UP: 38
                },

                _items: function(i, startTime) {
                    var widget = this, ul = $('<ul></ul>'), item = null, time, end;

                    // interval should be a multiple of 60 if timeFormat is not
                    // showing minutes
                    if (i.options.timeFormat.indexOf('m') === -1 && i.options.interval % 60 !== 0) {
                        i.options.interval = Math.max(Math.round(i.options.interval / 60), 1) * 60;
                    }

                    if (startTime) {
                        time = normalize(startTime);
                    } else if (i.options.startTime) {
                        time = normalize(i.options.startTime);
                    } else {
                        time = normalize(i.options.startHour, i.options.startMinutes);
                    }

                    end = new Date(time.getTime() + 24 * 60 * 60 * 1000);

                    while(time < end) {
                        if (widget._isValidTime(i, time)) {
                            item = $('<li>').addClass('ui-menu-item').appendTo(ul);
                            $('<a>').addClass('ui-corner-all').text($.fn.timepicker.formatTime(i.options.timeFormat, time)).appendTo(item);
                            item.data('time-value', time);
                        }
                        time = new Date(time.getTime() + i.options.interval * 60 * 1000);
                    }

                    return ul.children();
                },

                _isValidTime: function(i, time) {
                    var min = null, max = null;

                    time = normalize(time);

                    if (i.options.minTime !== null) {
                        min = normalize(i.options.minTime);
                    } else if (i.options.minHour !== null || i.options.minMinutes !== null) {
                        min = normalize(i.options.minHour, i.options.minMinutes);
                    }

                    if (i.options.maxTime !== null) {
                        max = normalize(i.options.maxTime);
                    } else if (i.options.maxHour !== null || i.options.maxMinutes !== null) {
                        max = normalize(i.options.maxHour, i.options.maxMinutes);
                    }

                    if (min !== null && max !== null) {
                        return time >= min && time <= max;
                    } else if (min !== null) {
                        return time >= min;
                    } else if (max !== null) {
                        return time <= max;
                    }

                    return true;
                },

                _hasScroll: function() {
                    // fix for jQuery 1.6 new prop method
                    var m = typeof this.ui.prop !== 'undefined' ? 'prop' : 'attr';
                    return this.ui.height() < this.ui[m]('scrollHeight');
                },

                /**
                 * TODO: Write me!
                 *
                 * @param i
                 * @param direction
                 * @param edge
                 * */
                _move: function(i, direction, edge) {
                    var widget = this;
                    if (widget.closed()) {
                        widget.open(i);
                    }
                    if (!widget.active) {
                        widget.activate( i, widget.viewport.children( edge ) );
                        return;
                    }
                    var next = widget.active[direction + 'All']('.ui-menu-item').eq(0);
                    if (next.length) {
                        widget.activate(i, next);
                    } else {
                        widget.activate( i, widget.viewport.children( edge ) );
                    }
                },

                //
                // protected methods
                //

                register: function(node, options) {
                    var widget = this, i = {}; // timepicker instance object

                    i.element = $(node);

                    if (i.element.data('TimePicker')) {
                        return;
                    }

                    i.options = $.metadata ? $.extend({}, options, i.element.metadata()) : $.extend({}, options);
                    i.widget = widget;

                    // proxy functions for the exposed api methods
                    $.extend(i, {
                        next: function() {return widget.next(i) ;},
                        previous: function() {return widget.previous(i) ;},
                        first: function() { return widget.first(i) ;},
                        last: function() { return widget.last(i) ;},
                        selected: function() { return widget.selected(i) ;},
                        open: function() { return widget.open(i) ;},
                        close: function(force) { return widget.close(i, force) ;},
                        closed: function() { return widget.closed(i) ;},
                        destroy: function() { return widget.destroy(i) ;},

                        parse: function(str) { return widget.parse(i, str) ;},
                        format: function(time, format) { return widget.format(i, time, format); },
                        getTime: function() { return widget.getTime(i) ;},
                        setTime: function(time, silent) { return widget.setTime(i, time, silent); },
                        option: function(name, value) { return widget.option(i, name, value); }
                    });

                    widget._setDefaultTime(i);
                    widget._addInputEventsHandlers(i);

                    i.element.data('TimePicker', i);
                },

                _setDefaultTime: function(i) {
                    if (i.options.defaultTime === 'now') {
                        i.setTime(normalize(new Date()));
                    } else if (i.options.defaultTime && i.options.defaultTime.getFullYear) {
                        i.setTime(normalize(i.options.defaultTime));
                    } else if (i.options.defaultTime) {
                        i.setTime($.fn.timepicker.parseTime(i.options.defaultTime));
                    }
                },

                _addInputEventsHandlers: function(i) {
                    var widget = this;

                    i.element.bind('keydown.timepicker', function(event) {
                        switch (event.which || event.keyCode) {
                        case widget.keyCode.ENTER:
                        case widget.keyCode.NUMPAD_ENTER:
                            event.preventDefault();
                            if (widget.closed()) {
                                i.element.trigger('change.timepicker');
                            } else {
                                widget.select(i, widget.active);
                            }
                            break;
                        case widget.keyCode.UP:
                            i.previous();
                            break;
                        case widget.keyCode.DOWN:
                            i.next();
                            break;
                        default:
                            if (!widget.closed()) {
                                i.close(true);
                            }
                            break;
                        }
                    }).bind('focus.timepicker', function() {
                        i.open();
                    }).bind('blur.timepicker', function() {
                        i.close();
                    }).bind('change.timepicker', function() {
                        if (i.closed()) {
                            i.setTime($.fn.timepicker.parseTime(i.element.val()));
                        }
                    });
                },

                select: function(i, item) {
                    var widget = this, instance = i === false ? widget.instance : i;
                    clearTimeout(widget.closing);
                    widget.setTime(instance, $.fn.timepicker.parseTime(item.children('a').text()));
                    widget.close(instance, true);
                },

                activate: function(i, item) {
                    var widget = this, instance = i === false ? widget.instance : i;

                    if (instance !== widget.instance) {
                        return;
                    } else {
                        widget.deactivate();
                    }

                    if (widget._hasScroll()) {
                        var offset = item.offset().top - widget.ui.offset().top,
                            scroll = widget.ui.scrollTop(),
                            height = widget.ui.height();
                        if (offset < 0) {
                            widget.ui.scrollTop(scroll + offset);
                        } else if (offset >= height) {
                            widget.ui.scrollTop(scroll + offset - height + item.height());
                        }
                    }

                    widget.active = item.eq(0).children('a').addClass('ui-state-hover')
                                                            .attr('id', 'ui-active-item')
                                              .end();
                },

                deactivate: function() {
                    var widget = this;
                    if (!widget.active) { return; }
                    widget.active.children('a').removeClass('ui-state-hover').removeAttr('id');
                    widget.active = null;
                },

                /**
                 * _activate, _deactivate, first, last, next, previous, _move and
                 * _hasScroll were extracted from jQuery UI Menu
                 * http://github,com/jquery/jquery-ui/blob/menu/ui/jquery.ui.menu.js
                 */

                //
                // public methods
                //

                next: function(i) {
                    if (this.closed() || this.instance === i) {
                        this._move(i, 'next', '.ui-menu-item:first');
                    }
                    return i.element;
                },

                previous: function(i) {
                    if (this.closed() || this.instance === i) {
                        this._move(i, 'prev', '.ui-menu-item:last');
                    }
                    return i.element;
                },

                first: function(i) {
                    if (this.instance === i) {
                        return this.active && this.active.prevAll('.ui-menu-item').length === 0;
                    }
                    return false;
                },

                last: function(i) {
                    if (this.instance === i) {
                        return this.active && this.active.nextAll('.ui-menu-item').length === 0;
                    }
                    return false;
                },

                selected: function(i) {
                    if (this.instance === i)  {
                        return this.active ? this.active : null;
                    }
                    return null;
                },

                open: function(i) {
                    var widget = this,
                        selectedTime = i.getTime(),
                        arrange = i.options.dynamic && selectedTime;

                    // return if dropdown is disabled
                    if (!i.options.dropdown) { return i.element; }

                    // if a date is already selected and options.dynamic is true,
                    // arrange the items in the list so the first item is
                    // cronologically right after the selected date.
                    // TODO: set selectedTime
                    if (i.rebuild || !i.items || arrange) {
                        i.items = widget._items(i, arrange ? selectedTime : null);
                    }

                    // remove old li elements keeping associated events, then append
                    // the new li elements to the ul
                    if (i.rebuild || widget.instance !== i || arrange) {
                        // handle menu events when using jQuery versions previous to
                        // 1.4.2 (thanks to Brian Link)
                        // http://github.com/wvega/timepicker/issues#issue/4
                        if ($.fn.jquery < '1.4.2') {
                            widget.viewport.children().remove();
                            widget.viewport.append(i.items);
                            widget.viewport.find('a').bind('mouseover.timepicker', function() {
                                widget.activate(i, $(this).parent());
                            }).bind('mouseout.timepicker', function() {
                                widget.deactivate(i);
                            }).bind('click.timepicker', function(event) {
                                event.preventDefault();
                                widget.select(i, $(this).parent());
                            });
                        } else {
                            widget.viewport.children().detach();
                            widget.viewport.append(i.items);
                        }
                    }

                    i.rebuild = false;

                    // theme
                    widget.container.removeClass('ui-helper-hidden ui-timepicker-hidden ui-timepicker-standard ui-timepicker-corners').show();

                    switch (i.options.theme) {
                    case 'standard':
                        widget.container.addClass('ui-timepicker-standard');
                        break;
                    case 'standard-rounded-corners':
                        widget.container.addClass('ui-timepicker-standard ui-timepicker-corners');
                        break;
                    default:
                        break;
                    }

                    /* resize ui */

                    // we are hiding the scrollbar in the dropdown menu adding a 40px
                    // padding to the wrapper element making the scrollbar appear in the
                    // part of the wrapper that's hidden by the container (a DIV).
                    if ( ! widget.container.hasClass( 'ui-timepicker-no-scrollbar' ) && ! i.options.scrollbar ) {
                        widget.container.addClass( 'ui-timepicker-no-scrollbar' );
                        widget.viewport.css( { paddingRight: 40 } );
                    }

                    var containerDecorationHeight = widget.container.outerHeight() - widget.container.height(),
                        zindex = i.options.zindex ? i.options.zindex : i.element.offsetParent().css( 'z-index' ),
                        elementOffset = i.element.offset();

                    // position the container right below the element, or as close to as possible.
                    widget.container.css( {
                        top: elementOffset.top + i.element.outerHeight(),
                        left: elementOffset.left
                    } );

                    // then show the container so that the browser can consider the timepicker's
                    // height to calculate the page's total height and decide if adding scrollbars
                    // is necessary.
                    widget.container.show();

                    // now we need to calculate the element offset and position the container again.
                    // If the browser added scrollbars, the container's original position is not aligned
                    // with the element's final position. This step fixes that problem.
                    widget.container.css( {
                        left: i.element.offset().left,
                        height: widget.ui.outerHeight() + containerDecorationHeight,
                        width: i.element.outerWidth(),
                        zIndex: zindex,
                        cursor: 'default'
                    } );

                    var calculatedWidth = widget.container.width() - ( widget.ui.outerWidth() - widget.ui.width() );

                    // hardcode ui, viewport and item's width. I couldn't get it to work using CSS only
                    widget.ui.css( { width: calculatedWidth } );
                    widget.viewport.css( { width: calculatedWidth } );
                    i.items.css( { width: calculatedWidth } );

                    // XXX: what's this line doing here?
                    widget.instance = i;

                    // try to match input field's current value with an item in the
                    // dropdown
                    if (selectedTime) {
                        i.items.each(function() {
                            var item = $(this), time;

                            if ($.fn.jquery < '1.4.2') {
                                time = $.fn.timepicker.parseTime(item.find('a').text());
                            } else {
                                time = item.data('time-value');
                            }

                            if (time.getTime() === selectedTime.getTime()) {
                                widget.activate(i, item);
                                return false;
                            }
                            return true;
                        });
                    } else {
                        widget.deactivate(i);
                    }

                    // don't break the chain
                    return i.element;
                },

                close: function(i, force) {
                    var widget = this;
                    if (widget.closed() || force) {
                        clearTimeout(widget.closing);
                        if (widget.instance === i) {
                            widget.container.addClass('ui-helper-hidden ui-timepicker-hidden').hide();
                            widget.ui.scrollTop(0);
                            widget.ui.children().removeClass('ui-state-hover');
                        }
                    } else {
                        widget.closing = setTimeout(function() {
                            widget.close(i, true);
                        }, 150);
                    }
                    return i.element;
                },

                closed: function() {
                    return this.ui.is(':hidden');
                },

                destroy: function(i) {
                    var widget = this;
                    widget.close(i, true);
                    return i.element.unbind('.timepicker').data('TimePicker', null);
                },

                //

                parse: function(i, str) {
                    return $.fn.timepicker.parseTime(str);
                },

                format: function(i, time, format) {
                    format = format || i.options.timeFormat;
                    return $.fn.timepicker.formatTime(format, time);
                },

                getTime: function(i) {
                    var widget = this,
                        current = $.fn.timepicker.parseTime(i.element.val());

                    // if current value is not valid, we return null.
                    // stored Date object is ignored, because the current value
                    // (valid or invalid) always takes priority
                    if (current instanceof Date && !widget._isValidTime(i, current)) {
                        return null;
                    } else if (current instanceof Date && i.selectedTime) {
                        // if the textfield's value and the stored Date object
                        // have the same representation using current format
                        // we prefer the stored Date object to avoid unnecesary
                        // lost of precision.
                        if (i.format(current) === i.format(i.selectedTime)) {
                            return i.selectedTime;
                        } else {
                            return current;
                        }
                    } else if (current instanceof Date) {
                        return current;
                    } else {
                        return null;
                    }
                },

                setTime: function(i, time, silent) {
                    var widget = this, previous = i.selectedTime;

                    if (typeof time === 'string') {
                        time = i.parse(time);
                    }

                    if (time && time.getMinutes && widget._isValidTime(i, time)) {
                        time = normalize(time);
                        i.selectedTime = time;
                        i.element.val(i.format(time, i.options.timeFormat));

                        // TODO: add documentaion about setTime being chainable
                        if (silent) { return i; }
                    } else {
                        i.selectedTime = null;
                    }

                    // custom change event and change callback
                    // TODO: add documentation about this event
                    if (previous !== null || i.selectedTime !== null) {
                        i.element.trigger('time-change', [time]);
                        if ($.isFunction(i.options.change)) {
                            i.options.change.apply(i.element, [time]);
                        }
                    }

                    return i.element;
                },

                option: function(i, name, value) {
                    if (typeof value === 'undefined') {
                        return i.options[name];
                    }

                    var time = i.getTime(),
                        options, destructive;

                    if (typeof name === 'string') {
                        options = {};
                        options[name] = value;
                    } else {
                        options = name;
                    }

                    // some options require rebuilding the dropdown items
                    destructive = ['minHour', 'minMinutes', 'minTime',
                                   'maxHour', 'maxMinutes', 'maxTime',
                                   'startHour', 'startMinutes', 'startTime',
                                   'timeFormat', 'interval', 'dropdown'];


                    $.each(options, function(name) {
                        i.options[name] = options[name];
                        i.rebuild = i.rebuild || $.inArray(name, destructive) > -1;
                    });

                    if (i.rebuild) {
                        i.setTime(time);
                    }
                }
            };

            $.TimePicker.defaults =  {
                timeFormat: 'hh:mm p',
                minHour: null,
                minMinutes: null,
                minTime: null,
                maxHour: null,
                maxMinutes: null,
                maxTime: null,
                startHour: null,
                startMinutes: null,
                startTime: null,
                interval: 30,
                dynamic: true,
                theme: 'standard',
                zindex: null,
                dropdown: true,
                scrollbar: false,
                // callbacks
                change: function(/*time*/) {}
            };

            $.TimePicker.methods = {
                chainable: [
                    'next',
                    'previous',
                    'open',
                    'close',
                    'destroy',
                    'setTime'
                ]
            };

            $.fn.timepicker = function(options) {
                // support calling API methods using the following syntax:
                //   $(...).timepicker('parse', '11p');
                if (typeof options === 'string') {
                    var args = Array.prototype.slice.call(arguments, 1),
                        method, result;

                    // chainable API methods
                    if (options === 'option' && arguments.length > 2) {
                        method = 'each';
                    } else if ($.inArray(options, $.TimePicker.methods.chainable) !== -1) {
                        method = 'each';
                    // API methods that return a value
                    } else {
                        method = 'map';
                    }

                    result = this[method](function() {
                        var element = $(this), i = element.data('TimePicker');
                        if (typeof i === 'object') {
                            return i[options].apply(i, args);
                        }
                    });

                    if (method === 'map' && this.length === 1) {
                        return $.makeArray(result).shift();
                    } else if (method === 'map') {
                        return $.makeArray(result);
                    } else {
                        return result;
                    }
                }

                // calling the constructor again on a jQuery object with a single
                // element returns a reference to a TimePicker object.
                if (this.length === 1 && this.data('TimePicker')) {
                    return this.data('TimePicker');
                }

                var globals = $.extend({}, $.TimePicker.defaults, options);

                return this.each(function() {
                    $.TimePicker.instance().register(this, globals);
                });
            };

            /**
             * TODO: documentation
             */
            $.fn.timepicker.formatTime = function(format, time) {
                var hours = time.getHours(),
                    hours12 = hours % 12,
                    minutes = time.getMinutes(),
                    seconds = time.getSeconds(),
                    replacements = {
                        hh: pad((hours12 === 0 ? 12 : hours12).toString(), '0', 2),
                        HH: pad(hours.toString(), '0', 2),
                        mm: pad(minutes.toString(), '0', 2),
                        ss: pad(seconds.toString(), '0', 2),
                        h: (hours12 === 0 ? 12 : hours12),
                        H: hours,
                        m: minutes,
                        s: seconds,
                        p: hours > 11 ? 'PM' : 'AM'
                    },
                    str = format, k = '';
                for (k in replacements) {
                    if (replacements.hasOwnProperty(k)) {
                        str = str.replace(new RegExp(k,'g'), replacements[k]);
                    }
                }
                // replacements is not guaranteed to be order and the 'p' can cause problems
                str = str.replace(new RegExp('a','g'), hours > 11 ? 'pm' : 'am');
                return str;
            };

            /**
             * Convert a string representing a given time into a Date object.
             *
             * The Date object will have attributes others than hours, minutes and
             * seconds set to current local time values. The function will return
             * false if given string can't be converted.
             *
             * If there is an 'a' in the string we set am to true, if there is a 'p'
             * we set pm to true, if both are present only am is setted to true.
             *
             * All non-digit characters are removed from the string before trying to
             * parse the time.
             *
             * ''       can't be converted and the function returns false.
             * '1'      is converted to     01:00:00 am
             * '11'     is converted to     11:00:00 am
             * '111'    is converted to     01:11:00 am
             * '1111'   is converted to     11:11:00 am
             * '11111'  is converted to     01:11:11 am
             * '111111' is converted to     11:11:11 am
             *
             * Only the first six (or less) characters are considered.
             *
             * Special case:
             *
             * When hours is greater than 24 and the last digit is less or equal than 6, and minutes
             * and seconds are less or equal than 60, we append a trailing zero and
             * start parsing process again. Examples:
             *
             * '95' is treated as '950' and converted to 09:50:00 am
             * '46' is treated as '460' and converted to 05:00:00 am
             * '57' can't be converted and the function returns false.
             *
             * For a detailed list of supported formats check the unit tests at
             * http://github.com/wvega/timepicker/tree/master/tests/
             */
            $.fn.timepicker.parseTime = (function() {
                var patterns = [
                        // 1, 12, 123, 1234, 12345, 123456
                        [/^(\d+)$/, '$1'],
                        // :1, :2, :3, :4 ... :9
                        [/^:(\d)$/, '$10'],
                        // :1, :12, :123, :1234 ...
                        [/^:(\d+)/, '$1'],
                        // 6:06, 5:59, 5:8
                        [/^(\d):([7-9])$/, '0$10$2'],
                        [/^(\d):(\d\d)$/, '$1$2'],
                        [/^(\d):(\d{1,})$/, '0$1$20'],
                        // 10:8, 10:10, 10:34
                        [/^(\d\d):([7-9])$/, '$10$2'],
                        [/^(\d\d):(\d)$/, '$1$20'],
                        [/^(\d\d):(\d*)$/, '$1$2'],
                        // 123:4, 1234:456
                        [/^(\d{3,}):(\d)$/, '$10$2'],
                        [/^(\d{3,}):(\d{2,})/, '$1$2'],
                        //
                        [/^(\d):(\d):(\d)$/, '0$10$20$3'],
                        [/^(\d{1,2}):(\d):(\d\d)/, '$10$2$3']
                    ],
                    length = patterns.length;

                return function(str) {
                    var time = normalize(new Date()),
                        am = false, pm = false, h = false, m = false, s = false;

                    if (typeof str === 'undefined' || !str.toLowerCase) { return null; }

                    str = str.toLowerCase();
                    am = /a/.test(str);
                    pm = am ? false : /p/.test(str);
                    str = str.replace(/[^0-9:]/g, '').replace(/:+/g, ':');

                    for (var k = 0; k < length; k = k + 1) {
                        if (patterns[k][0].test(str)) {
                            str = str.replace(patterns[k][0], patterns[k][1]);
                            break;
                        }
                    }
                    str = str.replace(/:/g, '');

                    if (str.length === 1) {
                        h = str;
                    } else if (str.length === 2) {
                        h = str;
                    } else if (str.length === 3 || str.length === 5) {
                        h = str.substr(0, 1);
                        m = str.substr(1, 2);
                        s = str.substr(3, 2);
                    } else if (str.length === 4 || str.length > 5) {
                        h = str.substr(0, 2);
                        m = str.substr(2, 2);
                        s = str.substr(4, 2);
                    }

                    if (str.length > 0 && str.length < 5) {
                        if (str.length < 3) {
                            m = 0;
                        }
                        s = 0;
                    }

                    if (h === false || m === false || s === false) {
                        return false;
                    }

                    h = parseInt(h, 10);
                    m = parseInt(m, 10);
                    s = parseInt(s, 10);

                    if (am && h === 12) {
                        h = 0;
                    } else if (pm && h < 12) {
                        h = h + 12;
                    }

                    if (h > 24) {
                        if (str.length >= 6) {
                            return $.fn.timepicker.parseTime(str.substr(0,5));
                        } else {
                            return $.fn.timepicker.parseTime(str + '0' + (am ? 'a' : '') + (pm ? 'p' : ''));
                        }
                    } else {
                        time.setHours(h, m, s);
                        return time;
                    }
                };
            })();
        })(jQuery);
    }


});  
