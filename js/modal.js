window.lofthaus = window.lofthaus || {};
window.lofthaus.ui = window.lofthaus.ui || {};
window.lofthaus.ui.modal = (function ($) {

    /////////////////////////////////
    // Private methods and functions
    /////////////////////////////////

	var OFFSET_MARGIN = 0; // This is the margin offset for the 956 grid 
	var MODAL_SUFFIX = '-yoModalized'; // Add this suffix to the identified IDs for yodle.ui.modal div wrappers
	
	// Wrap the given ID with the div structure necessary for displaying the modals and lightboxes
	function wrapAndPosition(elementId){
		
		// Detach the ID from the page for manipulation
		var _modal = $(elementId).detach();
		
		// Append to the bottom of the page
		$('body').append(_modal);
		
		// Display the content in the identified ID (this will normally have been hidden)
		_modal.show();
		
		// Wrap the ID in a new div that controls it's on/off behavior from this point forward. We create 
		// a new ID appended with the MODAL_SUFFIX variable
		var _wrapper = $('<div id="' + _modal.attr("id") + MODAL_SUFFIX + '" class="yo-modal-container" / >');
		_modal.wrap(_wrapper);
				
		// Append a div that functions as the overlay (washed out background)
		$('#' + _modal.attr('id') + MODAL_SUFFIX).append('<div class="yo-modal-overlay"></div>');

		// Add Class of Yo-Modal for specification
		_modal.addClass('yo-modal');
		
		// Reposition the modal given its width
		var _modalWidth = _modal.width() + OFFSET_MARGIN;
		_modalWidth = Math.min(956, _modalWidth);
		_modal.css({'width': _modalWidth + 'px'});

		// Automatic Default Styles
		$(".yo-modal-container").hide();
		$(".yo-modal-overlay").css({'position': 'fixed', 'top': '0', 'left': '0', 'margin': '0', 'padding': '0', 'width': '100%', 'height': '100%', 'z-index': '997'});
	}

	/////////////////////////////////
    // Public methods and functions
    /////////////////////////////////
    return {
		// This function takes an HTML id and wraps it with the required div structure to display it as a modal
		open: function(elementId, callback){
			// To leave the original IDs intact, we create(d) a wrapper ID with an easily identifiable suffix
			var _modalizedID =  elementId + MODAL_SUFFIX;
			
			// Attempt to pull up the wrapped ID
			var _modal = $(_modalizedID);
			
			// Check to see if the ID has already been wrapped and exits; if not, wrap it.
			if(_modal.length === 0 ) {
				wrapAndPosition(elementId);
				// Pull up the variable that is newly wrapped
				_modal = $(_modalizedID);
			}
			
			// Reposition the modal relative to the top of the screen
			var _modalTopPosition = $(window).scrollTop() + ($(window).height() * 0.10) + 'px';
			$(elementId).css('top', _modalTopPosition);
			
			// Run callbacks if provided
			if(callback !== undefined) {
				callback();
			}
				
			// Display the modal
			_modal.fadeIn(function(){
				// try to focus the first input element
				$(this).find('input, select, textarea').filter(':enabled').filter(':visible').first().focus();
			});
				
			// Return the modal for chaining
			return _modal;
		},

		openOnMobile: function(elementId, callback){
			// To leave the original IDs intact, we create(d) a wrapper ID with an easily identifiable suffix
			var _modalizedID =  elementId + MODAL_SUFFIX;
			
			// Attempt to pull up the wrapped ID
			var _modal = $(_modalizedID);
			
			// Check to see if the ID has already been wrapped and exits; if not, wrap it.
			if(_modal.length === 0 ) {
				wrapAndPosition(elementId);
				// Pull up the variable that is newly wrapped
				_modal = $(_modalizedID);
			}
			
			// Run callbacks if provided
			if(callback !== undefined) {
				callback();
			}
				
			// Display the modal
			_modal.fadeIn(function(){
				// try to focus the first input element
				$(this).find('input, select, textarea').filter(':enabled').filter(':visible').first().focus();
			});
				
			// Return the modal for chaining
			return _modal;
		},
	
	
		// This function closes the modal
		close: function(elementId, callback){
			$(elementId + MODAL_SUFFIX).fadeOut();
			
			// Run callbacks if provided
			if(callback !== undefined) {
				callback();
			}
		}
	};
})(jQuery); 