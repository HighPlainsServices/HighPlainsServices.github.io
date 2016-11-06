window.lofthaus = window.lofthaus || {};
window.lofthaus.ui = window.lofthaus.ui || {};
window.lofthaus.ui.validation = (function ($) {
    
    /////////////////////////////////
    // Private methods and functions
    /////////////////////////////////

    var SUPPORTED_FIELDS = 'input:not("[type=submit], [type=button], [type=hidden]"):visible, textarea:visible, select:visible';
    var SUPPORTED_INPUT_TYPES = ['email', 'tel', 'url', 'zip', 'number', 'currency', 'rate'];

    // Returns the field's type. (i.e. select, email, checkbox, textarea, etc.)
    function findFieldType($field) {
        var elementType;
        var fieldPattern = $field.attr('pattern');

        if (($field).is('select')) {
            elementType = 'select';
        } else if (($field).is('textarea')) {
			elementType = 'textarea';
		} else if ($field.data('inputType')) {
            elementType = dataInputTypeFallback($field.data('inputType'));
        } else if (fieldPattern) {
            elementType = 'custom';
        } else {
            elementType = $field.attr('type');
        }

        return elementType;
    }

    // Defaults data-input-type to text if system does not support/recognize the specified type (This is the default action for regular input type attribute)
    function dataInputTypeFallback(elementType) {
        var elementIsSupported = $.inArray(elementType, SUPPORTED_INPUT_TYPES) > -1;
        if (!elementIsSupported){
            elementType = 'text';
        }

        return elementType;
    }

    // Displays helper text
    function showHelperText($field) {
        var helperText = $field.data('helperText');

        window.lofthaus.ui.formfields.captionMessage($field, 'helperText', helperText);
    }

    // Removes leading and excess space from string and returns value
    function trimStringVal(string){
        var trimmedVal = $.trim(string);              
        return trimmedVal;
    }

    // Initiate field events
    function initFieldEvents($form) {
        //var fieldType = findFieldType($field); // Field value without the leading and ending spaces
        var timer;

        $form.on('focus', SUPPORTED_FIELDS, function(){
            var $this = $(this).not('select');
            var helperText = $this.data('helperText');

            // If field has helpertext and is not valid
            if (helperText && fieldIsEmpty($this)) {
                showHelperText($this);
            }
        }); // everything

        $form.on('blur', SUPPORTED_FIELDS, function(){
            var $this = $(this);

            clearTimeout(timer); // Clear Timer for keyup event

            validateField($this);

            $this.parents('.yv-formfield').removeClass('focus');
        }); 

        $form.on('change', SUPPORTED_FIELDS, function (){
            var $this = $(this);
            var fieldValue = trimStringVal($this.val()); // Field value without the leading and ending spaces

            clearTimeout(timer); // Clear timer for keyup event

            // Validate field on change, when field is not empty or when field is a select field.
            if (!fieldIsEmpty($this) || findFieldType($this) === 'checkbox' || findFieldType($this) === 'select') {
                validateField($this);
            }
        });

        $form.on('keyup', SUPPORTED_FIELDS, function() {
            var $this = $(this);
            var helperText = $this.data('helperText');
            var fieldValue = trimStringVal($this.val()); // Field value without the leading and ending spaces

            clearTimeout(timer); // Clear Timer

            if (helperText && fieldIsEmpty($this)) {
                showHelperText($this);
            } else {
                timer = setTimeout(function() {
                    if(!fieldIsEmpty($this)){
                        validateField($this);
                    }
                }, 500);
            }
        });
    }

    // Checks if field (entered as the parameter) is empty. 
    function fieldIsEmpty($field) {
        var fieldType = findFieldType($field);
        var fieldValue = trimStringVal($field.val());

        // If field is of type select
        if( (fieldType === 'select') && (fieldValue===''))  {
            return true;
        }

        // If field is of type radio or checkbox and empty
        if ((fieldType === 'radio' || fieldType === 'checkbox') && ($field.parents('.yv-formfield').find('input:checked').length === 0)) {
            return true;
        } else if (fieldValue === '') {
            return true;
        } else {
            return false;
        }
    }

    function validateField($field) {
        var required = $field.parents('.yv-formfield').find('input, select, textarea').attr('required');
        var helperText = $field.data('helperText');
        var fieldType = findFieldType($field);
        var fieldValue = trimStringVal($field.val());
        var fieldPattern = $field.attr('pattern');
        var invalidText = $field.data('invalidMessage');

        // If an inline pattern exists and there is no 
        if (fieldPattern && !invalidText){
            fieldType = 'default';
        }


        // === Required and empty === //
        if (required && fieldIsEmpty($field)) {
            window.lofthaus.ui.formfields.captionMessage($field, 'invalid', invalidMessage('required'));
			window.lofthaus.ui.formfields.validationIcon($field, 'invalid', "b");
            return false;
        }
        // === Field is invalid === //
        else if (fieldType !== 'text' && fieldType !== 'password' && fieldType !== 'select' && fieldType !== 'radio' && fieldType !== 'checkbox' && fieldType !== 'textarea' && !fieldIsValid($field) && !fieldIsEmpty($field)) {
            // TRIGGER REG EXPRESSION VALIDATION VIA SERVERSIDE OR ON THE FRONT-END
            window.lofthaus.ui.formfields.captionMessage($field, 'invalid', invalidMessage(fieldType, invalidText));
			window.lofthaus.ui.formfields.validationIcon($field, 'invalid', "b");
        }
        // === Field is valid === //
        else if (required && !fieldIsEmpty($field)){
			window.lofthaus.ui.formfields.captionMessage($field, 'valid');
			window.lofthaus.ui.formfields.validationIcon($field, 'valid', "o");
            return true;
		}
		else if (fieldType !== 'text' && fieldType !== 'password' && fieldType !== 'select' && fieldType !== 'radio' && fieldType !== 'checkbox' && fieldType !== 'textarea' && fieldIsValid($field) && !fieldIsEmpty($field)) {
			window.lofthaus.ui.formfields.captionMessage($field, 'valid');
			window.lofthaus.ui.formfields.validationIcon($field, 'valid', "o");
            return true;
		}
        else if (!fieldIsEmpty($field)) {
            return true;
        }
        // === Blank field that's not required === //
        else {
            window.lofthaus.ui.formfields.captionMessage($field);
			window.lofthaus.ui.formfields.validationIcon($field);
            return true;
        }
    }

    // Returns error message depending the error and field type
    function invalidMessage(invalidType, invalidMessage) {
        if (invalidMessage){
            invalidType = 'custom';
        } 

        switch(invalidType) {
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

    /* RegExp */
    function fieldIsValid($field) {
        var fieldType = findFieldType($field);
        var fieldValue = $field.val();
		if ($field.attr('pattern')) {
			var fieldPattern = $field.attr('pattern').replace(/\/$/, '').replace(/^[\/]|\/$/, '');
		}

        switch(fieldType) {
            case 'email':
                var pattern = new RegExp(/^(("[\w-+\s]+")|([\w-+]+(?:\.[\w-+]+)*)|("[\w-+\s]+")([\w-+]+(?:\.[\w-+]+)*))(@((?:[\w-+]+\.)*\w[\w-+]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][\d]\.|1[\d]{2}\.|[\d]{1,2}\.))((25[0-5]|2[0-4][\d]|1[\d]{2}|[\d]{1,2})\.){2}(25[0-5]|2[0-4][\d]|1[\d]{2}|[\d]{1,2})\]?$)/i);
                return pattern.test(fieldValue);
            ;
            case 'tel':
               // var pattern = /^1?( |-|\.)?(\([2-9]{1}[0-9]{2}\)|[2-9]{1}[0-9]{2})( |-|\.)?[0-9]{3}( |-|\.)?[0-9]{4}$/; // original strict version
                var pattern = new RegExp(/^\s*1?( |-|\.)?\(?[2-9]{1}[0-9]{2}\)?( |-|\.)?[0-9]{3}( |-|\.)?[0-9]{4}\s*$/);
                return pattern.test(fieldValue);
            ;
            case 'url':
                var pattern = new RegExp(/^(https?:\/\/)?([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}(\/.*)*$/);
                return pattern.test(fieldValue);
            ;
            case 'zip':
                var pattern = new RegExp(/^\d{5}([\-]\d{4})?$/);
                return pattern.test(fieldValue);
            ;
            case 'number':
                var pattern = new RegExp(/^\d+$/);
                return pattern.test(fieldValue);
            ;
            case 'currency':
                var pattern = new RegExp(/^(\d+|\d{1,3}(,\d{3})*)(\.\d{1,2})?$/);
                return pattern.test(fieldValue);
            ;
            case 'rate':
                var pattern = new RegExp(/^\s*(\d{1,2}(?:\.\d{0,2})?|\.\d{0,2})%?$/);
                return pattern.test(fieldValue);
            ;
            case 'custom':
                var pattern = new RegExp(fieldPattern);
                return pattern.test(fieldValue);
            ;
            case ('checkbox' || 'radio'): 
                console.log('test');
            ;
        }
    };

    // Initialize on submit event
    function initOnSubmit($form, callback){
        $form.on('submit', function (evt) {
            var $this = $(this);

            // If at least one field on the form is invalid
            if (!validateForm($this)) {
                evt.stopImmediatePropagation();
                return false;
            } else if (callback !== undefined) {
                return callback(evt);
            } else {
                return true;
            }
        });
    }

    // Initialize on reset event
    function initOnReset($form){
        $form.on('reset', function () {
            var $form = $(this);
            var $fields = getSupportedFields($form);

            setTimeout(function(){
                window.lofthaus.ui.formfields.captionMessage($fields);
            });
        });
    }

    function validateForm($form) {
        var $fields = getSupportedFields($form);
        var submit = true;

        $fields.each(function(){
            var $this = $(this);

            if (!validateField($this)){
                submit = false;
            }
        });

        return submit;
    }
    
    function getSupportedFields($form) {
        return $form.find(SUPPORTED_FIELDS);
    }

    /////////////////////////////////
    // Public methods and functions
    /////////////////////////////////
    return {
        // Initializes the function. Receives form id, as well as a callback if it is defined. 
        init : function (selector, callback) {
            var $form;

            // Search for form within the selector
            if ($(selector).is('form')){ 
                $form = $(selector); 
            } else { 
                $form = $(selector).find('form'); 
            }
			
            // Remove default browser validation
            // $form.get(0).setAttribute('novalidate', 'novalidate');
            // Format Fields
            window.lofthaus.ui.formfields.format($form, 'validate');

            // Initialize field events
            initFieldEvents($form);

            // Initialize on submit;
            initOnSubmit($form, callback);
            
            // Initialize on reset;
            initOnReset($form);
        }
    };
})(jQuery);
