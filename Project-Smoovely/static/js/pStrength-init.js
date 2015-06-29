$(document).ready(function() {
   /* File field */
   var intervalFunc = function () {
        $('#companyLogoFileName').html($('#id_company_logo').val());
   };
   $('#LogoUploadBtn').on('click', function () {
     $('#id_company_logo').click();
     setInterval(intervalFunc, 1);
     return false;
    });

   /* Password strength */
   var field1 = $('#id_password1').parent('.form-group')
   var field2 = $('#id_password2').parent('.form-group')
   function passwordMatchStatus () {
     if ($('#id_password1').val() != $('#id_password2').val()) {
       field2.removeClass('has-success').addClass('has-error');
       field2.find('.help-block').html("<span class=\"error-help\">Passwords don't match</span>");
     } else {
       field2.removeClass('has-error').addClass('has-success');
       field2.find('.help-block').empty();
     }
   };

   $('#id_password1, #id_password2').pStrength({
        'changeBackground'          : false,
        'onPasswordStrengthChanged' : function(passwordStrength, strengthPercentage) {
          passwordMatchStatus();
          if (strengthPercentage > 40) {
            field1.find('.help-block').html("<span class=\"success-help\">Strong password</span>");
          } else if ($('#id_password1').val()) {
            field1.find('.help-block').html("<span class=\"error-help\">Weak password</span>");
          }
        }
   });
 });