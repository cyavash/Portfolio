function validateFormField(fieldName) {
    var fieldElem = $('#id_' + fieldName);
    fieldElem.on('input', function(){
      var fieldVal = fieldElem.val();
      $.ajax({
        type: 'GET',
        data: fieldName + '=' + fieldVal,
        url: '/accounts/validate_' + fieldName + '/',
        success: function(data) {
            var formGroupClass = data['is_valid'] ? 'has-success': 'has-error';
            var iconClass = data['is_valid'] ? 'glyphicon-ok-sign': 'glyphicon-remove-sign';
            var formGroup = fieldElem.parent();
            formGroup.find('.help-block').empty();
            formGroup.removeClass('has-error').removeClass('has-success').addClass(formGroupClass);
            formGroup.find('.validation-icon').remove();
            if (fieldVal.length > 0) {
                formGroup.append('<span class="validation-icon glyphicon ' + iconClass + ' form-control-feedback"></span>');
            }
            if (data['error_message'] != null) {
                formGroup.find('.help-block').html('<span class="error-help">' + data['error_message'] + '</span>')
            }
        }
      });
    })
}