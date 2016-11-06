window.lofthaus = window.lofthaus || {};
window.lofthaus.contactform = (function ($) {

    var FORM_SELECTOR = '#contact-form .contact-form';
    var STATUS_MESSAGE_SELECTOR = '#contact-form .status-message';

    function showSubmitSuccessStatusMessage() {
        $(FORM_SELECTOR).fadeOut(500, function() {
            $(STATUS_MESSAGE_SELECTOR).fadeIn(500);
        });
    }

    function maybeTrackSessionWebLead(responseData) {
        ga('send', 'event', 'conversions', 'click', 'desktop and responsive form submission');

        var sessionTrackingEnabled = window.lofthaus.hasOwnProperty('sessiontracking');
        var leadCorrelatorId = responseData.hasOwnProperty('leadCorrelatorId') ? responseData['leadCorrelatorId'] : null;

        if (sessionTrackingEnabled && leadCorrelatorId !== null)
            window.lofthaus.sessiontracking.trackSessionWebLead(leadCorrelatorId);
    }

    function onSubmitSuccess(responseData) {
        showSubmitSuccessStatusMessage();
        maybeTrackSessionWebLead(responseData);
    }

    function onSubmitError() {
        // TODO: We probably want to do something here (e.g. automatically retry, prompt the user to manually retry, etc.)
    }

    function initSpamTrap() {
        var spamTrap = $(FORM_SELECTOR).find('input[name="_yodleST"]');
        var formButton = $(FORM_SELECTOR).find('input[type=submit]');

        formButton.click(function (event) {
            spamTrap.val('x537hd');
            return true;
        });
    }

    function init() {
        window.lofthaus.ui.validation.init(FORM_SELECTOR);
        window.lofthaus.ui.form.init(FORM_SELECTOR, '/capture.weblead.ajax', onSubmitSuccess, onSubmitError);

        initSpamTrap();
    }

    return {
        init: init
    };

})(jQuery);


$(document).ready(function(){
    window.lofthaus.contactform.init();
    renderServicesContent();
    renderGoogleMap();
    resizeOverlays();

    $( window ).resize(function() {
        resizeOverlays();
        resizeGallery();
        resizeServicesNavigation();
    });

    $(".gallery-arrow").on("click", function(){
        $(".gallery-container .expanded").slideToggle('slow');
    });


    initReviewSlides();
    initGallerySlides(gallerySlides); 

    $('.gallery-container .gallery-image').each(function(){
        var $this = $(this);
        $this.on('click', function(){
            window.lofthaus.ui.lightbox.open('#gallery-lightbox');
            $('#gallery-lightbox #slideshow').rsfSlideshow('goToSlide',$this.attr('data-photo-index'));
            resizeGallery();
        })

    });
});

function resizeGallery(){
    var $lightbox = $('#gallery-lightbox'),
        $slideshow = $('#slideshow'),
        $img = $slideshow.find('img');

    if($lightbox.is(':visible') && $(window).width() <= 956) {
        //resize lightbox container
        $lightbox.css('width',0.9*$(window).width());

        //resize slideshow
        $slideshow.css({
            'width': 0.9 * $(window).width(),
            'height': 0.495 * $(window).width()
        });

        //resize image
        $slideshow.rsfSlideshow('goToSlide',$slideshow.rsfSlideshow('currentSlideKey'));
    }    
}

function initGallerySlides(slides){
    var opts = {
        slides: slides,
        slide_size: {
            max_width: 800,
            max_height: 440
        },
        autostart: false,
        transition: 0,
        controls: {
            previousSlide: {auto: true},
            nextSlide: {auto: true},
            status: {auto: true}
        }
    };

    $('#gallery-lightbox #slideshow').rsfSlideshow(opts);
}

function initReviewSlides() {
    var $reviewSlides = $("#reviews-slider");

    $reviewSlides.find('.rslides-item').each(function(){
        var $body = $(this).find('.review-content .text'),
            fullBodyText = $body.text(),
            isLinkDisplayed = false,
            $link = $('<a class="link">'),
            truncatedBodyText;


        if (fullBodyText.length > 120) {
            truncatedBodyText = fullBodyText.slice(0, 119).split(" ").slice(0, -1).join(" ") + "..."
            $body.text(truncatedBodyText);
            isLinkDisplayed = true;
        }

        if(isLinkDisplayed) {
            $link.text("More").addClass('expand');
            $body.append($link);
        }

        $body.on('click', '.expand', function(){
            $link.removeClass('expand').text('Less').addClass('hide');
            $body.text(fullBodyText).append($link);
        });

        $body.on('click', '.hide', function(){
            $link.removeClass('hide').text('More').addClass('expand');
            $body.text(truncatedBodyText).append($link);
        });
    }); 


    $reviewSlides.responsiveSlides({
        auto: false,
        pager: true,
        speed: 300,
        maxwidth: 956,
        timeout: 5000

    });
}

function renderServicesContent(){
    var queryServiceName = getParameterByName('service');

    var $servicesNav = $('#servicesNav'),
        $dropdownTrigger = $('#servicesNav .dropdown-trigger'),
        $servicesItems = $('#servicesNav .services-item');

    $servicesItems.each(function(){
        var $this = $(this);

        var index = $this.attr('data-content-index'),
            serviceName = $this.attr('data-service-name'),
            contentId = "content-index-" + index,
            $content = $("#"+contentId);

        $this.click(function(){

            $this.siblings().removeClass('active');
            $this.addClass('active');

            $content.siblings().removeClass('active');
            $content.addClass('active');

            if($(window).width() <= 767) {
                $servicesItems.hide();
                $servicesNav.removeClass('expanded');

                $dropdownTrigger.find('.text').text($this.text());
            }
        });


        if(queryServiceName == serviceName) {
            $this.siblings().removeClass('active');
            $this.addClass('active');

            $content.siblings().removeClass('active');
            $content.addClass('active');
        }
    });

    $dropdownTrigger.find('.text').text($('#servicesNav .services-item.active').text());
    $dropdownTrigger.click(function(){
        if($servicesNav.hasClass('expanded')) {
            $servicesItems.hide();
            $servicesNav.removeClass('expanded');
        }
        else {
            $servicesItems.show();
            $servicesNav.addClass('expanded');
        }
    });
    resizeServicesNavigation();
}

function resizeServicesNavigation() {
    var queryServiceName = getParameterByName('service');
    var $servicesNav = $('#servicesNav'),
        $dropdownTrigger = $('#servicesNav .dropdown-trigger'),
        $servicesItems = $('#servicesNav .services-item');

    if($(window).width() <= 767) {
        $dropdownTrigger.show();
        $servicesItems.hide();
    }
    else {
        $dropdownTrigger.hide();
        $servicesItems.show();
    }
    $servicesNav.removeClass('expanded');
}

function renderGoogleMap(){
    mapOptions.styles = [
    {
        "featureType": "water",
        "stylers": [
            {
                "color": "#46bcec"
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "landscape",
        "stylers": [
            {
                "color": "#f2f2f2"
            }
        ]
    },
    {
        "featureType": "road",
        "stylers": [
            {
                "saturation": -100
            },
            {
                "lightness": 45
            }
        ]
    },
    {
        "featureType": "road.highway",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#444444"
            }
        ]
    },
    {
        "featureType": "transit",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
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
}


function resizeOverlays() {
    var windowWidth = $( window ).width();
    var overlayRemainder = (windowWidth - 956) / 2;

    $(".left-overlay, .right-overlay").width(overlayRemainder);

}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

