window.lofthaus = window.lofthaus || {};
window.lofthaus.ui = window.lofthaus.ui || {};
window.lofthaus.ui.lightbox = (function ($) {

    /////////////////////////////////
    // Private methods and functions
    /////////////////////////////////

	// Function to bind the item to close and the escape key
	function bindEscape(elementId){
		$(document).keyup(function(e){
			if (e.keyCode == 27) {
				window.lofthaus.ui.lightbox.close(elementId);
			}
		});	
	}

	// Function to prepend close button and bind it to close
	function createCloseButton(elementId){
		// If there is no element with a class of yo-modal-close, create it
		if ($(elementId).find(".yo-lightbox-close").val() === undefined) {
			$(elementId).prepend("<div class='yo-lightbox-close' style='z-index:52; cursor:pointer;'>x</div>");
		}

		// Allow the user to click on the close button dismiss the lightbox
		closeOnClick(".yo-lightbox-close", elementId);
	}
	
	// Function to close lightbox on trigger click
	function closeOnClick(elementId, wrapperId){
		$(elementId).click(function(){
			window.lofthaus.ui.lightbox.close(wrapperId);
		});
	}

	function initLightbox(elementId) {
		// Change Class to from yo-modal to yo-lightbox for specification
		$(elementId).removeClass('yo-modal').addClass('yo-lightbox');

		// Here is a good place to add extra lightbox specific events, look and feel, etc.
	
		// Allow the user to click on the modal overlay to dismiss the lightbox
		closeOnClick(".yo-modal-overlay", elementId);
		
		// Create a close button and allow the user to click on the button to dismiss the lightbox
		createCloseButton(elementId);
		
		// Allow the user to escape the lightbox by pressing the escape key
		bindEscape(elementId);
	}


	/////////////////////////////////
    // Public methods and functions
    /////////////////////////////////
    return {
		open: function(elementId, callback){
			var _lightbox = window.lofthaus.ui.modal.open(elementId, callback);
			initLightbox(elementId);
			
			// Return the lightbox for chaining
			return _lightbox; 
		},

		openOnMobile: function(elementId, callback){
			var _lightbox = window.lofthaus.ui.modal.openOnMobile(elementId, callback);
			initLightbox(elementId);
			
			// Return the lightbox for chaining
			return _lightbox; 
		},
	
		// Close the lightbox
		close: function(elementId, callback){
			window.lofthaus.ui.modal.close(elementId, callback);

			// Unbind the escape key
			$(document).unbind("keyup");
		}
	};
})(jQuery);
