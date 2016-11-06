$(window).load(function() {
    
	$(".smart-crop").each(function(){

		var cropWindow = $(this);
		var cropImage = $(this).find("img");

		cropWindow.css("overflow", "hidden");

		if (cropImage.width() > cropImage.height()) {
			
			cropImage.css("height", "100%");

			var cropWindowWidth = cropWindow.width();
			var offset = (cropImage.width() - cropWindowWidth) / 2;

			cropImage.css("margin-left", "-" + offset + "px");

		}

		else if (cropImage.width() < cropImage.height()) {

			cropImage.css("width", "100%");

			var cropWindowHeight = cropWindow.height();
			var offset = (cropImage.height() - cropWindowHeight) / 2;

			cropImage.css("margin-top", "-" + offset + "px");

		}

		else {

			cropImage.css("width", "100%");

		}

	});

});