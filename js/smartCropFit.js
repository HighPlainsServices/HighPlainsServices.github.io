$(window).load(function() {
    
	$(".smart-crop").each(function(){

		var cropWindow = $(this);
		var cropImage = $(this).find("img");

		cropWindow.css("overflow", "hidden");

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

});