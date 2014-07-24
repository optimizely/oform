$.fn.extend({

  oForm: function(options){

    var defaultOptions, settings, formSelector;

    formSelector = $(this);

    //setup all the default options

    defaultOptions = {};

    defaultOptions.validation = {};

    defaultOptions.validation.validators = {};

    defaultOptions.emailIsValid = function(email){

      if(typeof email === 'string'){

          var emailRegEx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

          return emailRegEx.test(email);

      } else {

        return false;

      }

    };

    defaultOptions.phoneIsValid = function(phone){

      if(typeof phone === 'string'){

        var phoneOnlyDigits = phone.replace(/\D/g, '');

        if( phoneOnlyDigits.length >= 10 ){

          return true;

        } else {

          return false;

        }

      } else {

        return false;

      }

    };

    defaultOptions.checkboxIsValid = function(checkbox){

      return $(checkbox).prop('checked') ? true : false;

    };

    defaultOptions.stringHasValue = function(value){

      return value ? true : false;

    };

    defaultOptions.alertValidationError = function(element, isValid){

      if(typeof settings.reportValidationError === 'function' && !isValid){

        settings.reportValidationError(element);

      }

    };

    defaultOptions.adjustClasses = function(element, isValid){

      var relatedClass = '.' + element.attr('name') + '-related';

      if(isValid){

        element.removeClass('error-show');

        $(relatedClass).each(function(index, value){

          $(value).removeClass('error-show');

        });

      } else {

        element.addClass('error-show');

        $(relatedClass).each(function(index, value){

          $(value).addClass('error-show');

        });

        settings.alertValidationError(element, isValid);

      }

      if(element.attr('type') === 'checkbox'){

        element.focus();

      }

      return isValid;

    };

    defaultOptions.validateFields = function(args){

        var invalidFields = 0;

        $.each( args.selector.find('input:not([type="hidden"])'), function(index, value){

          var element, dataValidation, elementValue, type, validate;

          element = $(value);

          dataValidation = $(element).attr('data-validation');

          elementValue = element.val();

          validate = function(valid){

            if( !valid ){

              invalidFields++;

            }

          };

          if( dataValidation && settings.validation[dataValidation] ){

            settings.adjustClasses(element, settings.validation[dataValidation](elementValue) );

          } else if( element.attr('required') ){

            type = element.attr('type');

            switch(type){

              case 'url':

              case 'text':

                validate( settings.adjustClasses(element, settings.stringHasValue(elementValue)) );

                break;

              case 'email':

                validate( settings.adjustClasses(element, settings.emailIsValid(elementValue)) );

                break;

              case 'tel':

                validate( settings.adjustClasses(element, settings.phoneIsValid(elementValue)) );

                break;

              case 'checkbox':

                validate( settings.adjustClasses(element, settings.checkboxIsValid(element)) );

            }

          }

        });

        if( invalidFields === 0 ){

          $('body').removeClass('error');

          return true;

        } else {

          $('body').addClass('error');

          return false;

        }

    };

    defaultOptions.submitData = function(){

      var request;

      request = $.ajax({

        type: 'POST',
        url: formSelector.attr('action') || settings.url,
        data: formSelector.serialize()

      });

      request.always(function(){

        executeAfterCallbacks(request);

      });

    };

    if( typeof jQuery.oFormGlobalOverrides === 'object'){

      defaultOptions = $.extend(true, defaultOptions, jQuery.oFormGlobalOverrides);

    }

    settings = $.extend(true, defaultOptions, options);

    var executeAfterCallbacks = function(response){

      if(typeof settings.afterLocal === 'function'){

        settings.afterLocal(response, settings.afterGlobal ? settings.afterGlobal : undefined);

      } else {

        settings.afterGlobal(response);

      }

    };

    formSelector.submit(function(event){

      event.preventDefault();

      if(typeof settings.beforeLocal === 'function'){

        if(settings.beforeLocal({selector: formSelector}) === false){

          return false;

        }

      }

      if(typeof settings.beforeGlobal === 'function'){

        if(settings.beforeGlobal({selector: formSelector}) === false){

          return false;

        }

      }

      if(typeof settings.validateFields === 'function'){

        var validFields = settings.validateFields({

          selector: formSelector,

          localValidationCallback: settings.afterValidationLocal ? settings.afterValidationLocal : undefined,

          globalValidationCallback: settings.afterValidationGlobal ? settings.afterValidationGlobal : undefined,

        });

        if(validFields === false){

          executeAfterCallbacks(undefined);

          return;

        }

      }

      settings.submitData();

      event.preventDefault();

    });

  }

});