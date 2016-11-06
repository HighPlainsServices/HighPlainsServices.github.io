$( document ).ready(function() {
    
	$("div").filter(function() {
	    var $this = $(this);
	    if ($this.css("border-top-width") == "1px") {
	    	$this.css("border-top-width", "2px");
	    }
	    if ($this.css("border-bottom-width") == "1px") {
	    	$this.css("border-bottom-width", "2px");
	    }
	    if ($this.css("border-left-width") == "1px") {
	    	$this.css("border-left-width", "2px");
	    }
	    if ($this.css("border-right-width") == "1px") {
	    	$this.css("border-right-width", "2px");
	    }
	});

});