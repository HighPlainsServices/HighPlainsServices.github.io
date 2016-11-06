window.lofthaus = window.lofthaus || {};
window.lofthaus.ui = window.lofthaus.ui || {};
window.lofthaus.ui.form = (function ($) {
    
    function submitForm(submitUrl, successHandler, errorHandler) {
        var data = $(this).serialize();
        $.post(submitUrl, data, successHandler, 'json')
                .fail(errorHandler);
    }

    function init(selector, submitUrl, successHandler, errorHandler) {
        $(selector).submit(function(event) {
            event.preventDefault();
            submitForm.call(this, submitUrl, successHandler, errorHandler);
            return true;
        });
    }
    
    return {
        init: init
    };

}(jQuery));
