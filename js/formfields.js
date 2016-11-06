window.lofthaus = window.lofthaus || {};
window.lofthaus.ui = window.lofthaus.ui || {};
window.lofthaus.ui.formfields = (function ($) {

    /////////////////////////////////
    // Private methods and functions
    /////////////////////////////////

    var SUPPORTED_FIELDS = 'input:not("[type=submit], [type=button], [type=hidden]"), textarea, select';

    // Formats all text fields with default wrappers if they have not been added.
    function formatTextField($field) {
        var $this = $field.not('input[type=radio], input[type=checkbox], input[type=search]'); // do not include radio and checkbox fields
        var $target = $this.parent('.field-wrapper');

        $target = $target.add($this.filter(function() { return $target.has(this).length === 0; }));

        $target.each(function(e){
            var $this = $(this);
            var requiredField = $this.attr('required');

            // If field is not already wrapped
            if ($this.parents('.yv-formfield').length === 0) {
                $this.wrap('<div class="yv-formfield">'); // Wrap field to style error messages and helperText
            }

            var $fieldWrap = $this.parents('.yv-formfield');

            addCaptionToFieldWrap($fieldWrap);
			addIconToFieldWrap($fieldWrap);
            addAsteriskToLabel($this);
        });

        formatWrapOnFocus($field);
    }

    function formatWrapOnFocus($fields) {
        $fields.on('focus', function(){
            var $fieldWrap; 
            $this = $(this);

            if ($this.parents('.yv-formfield').length !== 0){
                $fieldWrap = $this.parents('.yv-formfield');
            } else {
                $fieldWrap = $this.parents('.field-wrapper');
            }

            $fieldWrap.addClass('focus');
        });

        $fields.on('blur', function(){
            var $fieldWrap; 
            $this = $(this);

            if ($this.parents('.yv-formfield').length !== 0){
                $fieldWrap = $this.parents('.yv-formfield');
            } else {
                $fieldWrap = $this.parents('.field-wrapper');
            }

            $fieldWrap.removeClass('focus');
        });
    }

    function addCaptionToFieldWrap ($fieldWrap) {
        // If field does not have a caption
        if ($fieldWrap.find('.fieldCaption').length === 0) {
            $fieldWrap.append('<div class="fieldCaption"></div>'); // This field caption element will display messages (i.e. errors, helperText)
        }
    }

	function addIconToFieldWrap ($fieldWrap) {
		// If field does not have a icon
		if ($fieldWrap.find('.fieldIcon').length === 0) {
			$fieldWrap.append('<div class="fieldIcon"><i class="icon-validation"></i></div>');
		}
	}

    function formatRadioCheckboxField($form) {
        var fieldNameList = $.makeArray();
        var i = 0;

        $form.find("input[type=radio]:not('[data-toggle]'), input[type=checkbox]:not('[data-toggle]')").each(function(index) { // search through all radio and checkbox fields
            fieldNameList[index] = $(this).attr("name");
        });

        var fieldName = $.unique(fieldNameList); // Save only the unique field names

        // For each unique field name, wrap inputs
        $.each(fieldName, function(i) {
        var $field = $form.find('input[name="'+ fieldName[i] +'"]');

            if ($field.parents(".yv-formfield").length === 0) {
                $field.parent().wrapAll('<div class="yv-formfield radioCheckbox" />');
            }
            addCaptionToFieldWrap($field.parents('.yv-formfield'));
        });
    }

    function formatSelectField($fields){
        // Add class of select to wrapper to allow styling
        $fields.each(function(e){
            var $this = $(this),
                $fieldWrap = $this.parent('.field-wrapper');

            var $fieldValue = $fieldWrap.find('select option:eq(0)').text();

            // If it currently has no div with a class of selected-option, append it
            if ($fieldWrap.find('.select-option').length === 0) {
                $fieldWrap.append('<div class="select-option">' + $fieldValue + '</div>');
            }

            var $selectOption = $fieldWrap.find('.select-option');

            $this.on('change', function(){
                $selectOption.html($this.children("option:selected").text());
            });

            // If field is not already wrapped
            if ($fieldWrap.parents('.yv-formfield').length === 0) {
                $fieldWrap.wrap('<div class="yv-formfield">'); // Wrap field to style error messages and helperText
            }

            addCaptionToFieldWrap($fieldWrap.parents('.yv-formfield'));
        });
    }

    // Styles if field is valid
    function isValid($fieldWrap){
        $fieldWrap.removeClass("invalid").addClass("valid");
    }

    // Styles if field is invalid
    function isInvalid($fieldWrap){
        $fieldWrap.removeClass("valid").addClass("invalid");
    }

    // Default styles
    function defaultStyles($fieldWrap){
        $fieldWrap.removeClass("invalid").removeClass("valid");
    }

    // Automatically adds asterisk to field's label if it doesn't already have one and field is required
    function addAsteriskToLabel($fields){
        var required = $fields.attr('required');
        var label = getFieldLabelType($fields);

        $fields.each(function(){
            var $this = $(this);
            var required = $this.attr('required');
            var label = getFieldLabelType($this);
            
            var $formfieldWrap = $this.parents('.yv-formfield');

            labelValue = $this.parents('.yv-formfield').siblings(label).text();

            if (required && !hasAsterisk(labelValue)){
                $formfieldWrap.siblings(label).append('<span class="yv-required-field ' + label +'">*</span>'); // Add asterisk to label
            }
        });

    }
 
    // Checks if string contains an asterisk
    function hasAsterisk(string){
        // Checks to see if an asterisk
        if (string.indexOf('*') !== -1){
            return true;
        }
    }

    // Appropriately returns the field's label.
    function getFieldLabelType($field){
        if ($field.is('input[type=checkbox], input[type=radio]')){
            return 'legend';
        } else {
            return 'label';
        }
    }


	/////////////////////////////////
    // Public methods and functions
    /////////////////////////////////
    return {
        // Initializes the function. Receives type. Type is the tcaptionMessageype of formatting. The only option supported at the moment is "validate"
        format : function (selector, type) {
            var $form = $(selector);
            var $textFields = $form.find('input:not("[type=submit], [type=button], [type=hidden]"), textarea');

            // Search through form for all radio/checkbox fields of the same name and wrap them
            formatRadioCheckboxField($form);

            // Search through all text fields and wrap it
            formatTextField($textFields);

            // Search through all select and wrap it 
            var $selects = $(selector).find('select');
            formatSelectField($selects);

            // Search each form for search fields and format them
            $form.each(function(){
                $this = $(this);

                if ($this.find("input[type=search], input[data-input-type=search]").length !== 0){
                    lofthaus.components.search.format($this);
                }
            });
            
        },

        // Shows or hides caption message
        captionMessage : function (element, msgType, msg) {
            var $fieldWrap = $(element).parents('.yv-formfield');
            var $fieldCaption = $fieldWrap.find('.fieldCaption');
            // Call appropriate format function depending on message Type (i.e. valid, invalid, default)
            switch(msgType) {
                case 'valid':
                    isValid($fieldWrap);
                    break;
                case 'invalid':
                    isInvalid($fieldWrap);
                    break;
                default:
                    defaultStyles($fieldWrap);
            }

            // If there's a message, add class to wrapper, and add message to caption
            if (msg){
                $fieldWrap.addClass('showMessage'); // Adds class of show message (adds padding to the fieldwrap);
                $fieldCaption.text(msg); // Display message on field caption
            } else {
                $fieldWrap.removeClass('showMessage'); // Hide message
            }
        },

		// Shows or hide validation icon
		validationIcon : function (element, msgType, iconName) {
			var $fieldWrap = $(element).parents('.yv-formfield');
			var $fieldIcon = $fieldWrap.find('.fieldIcon');
			var $icon = $fieldIcon.find('.icon-validation');
			
			// Call appropriate format function depending on message Type (i.e. valid, invalid, default)
			switch(msgType) {
                case 'valid':
                    isValid($fieldWrap);
                    break;
                case 'invalid':
                    isInvalid($fieldWrap);
                    break;
                default:
                    defaultStyles($fieldWrap);
            }

			// If there's a message, add class to wrapper, and add message to caption
            if (iconName){
                $fieldWrap.addClass('showIcon'); // Adds class of show message (adds padding to the fieldwrap);
                $icon.text(iconName); // Display message on field caption
            } else {
                $fieldWrap.removeClass('showIcon'); // Hide message
            }
		}
    };
})(jQuery);