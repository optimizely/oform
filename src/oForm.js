(function(w,d){

  w.Oform = function(instanceOverrideOptions){

    var instance,
        mergeObjects,
        instanceDefaultOptions,
        elements;

    instance = this;

    instance.on = function(type, cb){

      if(

        type === 'abort' ||
        type === 'error' ||
        type === 'load' ||
        type === 'loadend' ||
        type === 'loadstart' ||
        type === 'progress'

      ){

        instance.options.xhr = instance.options.xhr || {};

        instance.options.xhr[type] = cb;

      } else {

        instance.options[type] = cb;

      }

      return instance;

    };

    instance.run = function(event){

      event.preventDefault();

      var before,
          invalidFields,
          inputs,
          data;

      invalidFields = 0;

      data = [];

      if(typeof instance.options.before === 'function'){

        before = instance.options.before() ? true : false;

      } else {

        before = true;

      }

      if(before){

        inputs = d.querySelectorAll(instance.options.selector + ' input');

        inputs = Array.prototype.slice.call(inputs);

        inputs.forEach(function(item){

          var type,
              name,
              value;

          type = item.getAttribute('type');

          name = item.getAttribute('name');

          value = item.value;

          if( item.hasAttribute('required') ){

            if(

              typeof instance.options.customValidation === 'object' &&

              typeof instance.options.customValidation[name] === 'function'

            ){

              if( instance.options.customValidation[name](item) ){

                instance.options.adjustClasses(item, true);

              } else {

                instance.options.adjustClasses(item, false);

                if(typeof instance.options.validationerror === 'function'){

                  instance.options.validationerror(item);

                }

                invalidFields++;

              }

            } else {

              if( instance.options.validate[type](item) ){

                instance.options.adjustClasses(item, true);

              } else {

                instance.options.adjustClasses(item, false);

                if(typeof instance.options.validationerror === 'function'){

                  instance.options.validationerror(item);

                }

                invalidFields++;

              }

            }

          }

          if(name) {

            data.push( name + '=' + encodeURIComponent(value) );

          }

        });

        data = data.join('&');

      }

      if(invalidFields === 0 && before){

        //run submit function
        var request = new XMLHttpRequest();

        if(typeof instance.options.xhr === 'object'){

          for(var key in instance.options.xhr){

            request['on' + key] = instance.options.xhr[key];

          }

          request.open('POST', event.target.getAttribute('action'), true);

          request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

          if(typeof instance.options.middleware === 'function'){

            data = instance.options.middleware(request, data);

          }

          request.send(data);

        }

      }

      if(typeof instance.options.done === 'function'){

        instance.options.done();

      }

      return instance;

    };

    mergeObjects = function (obj1,obj2){

      var obj3,
          attrname;

      obj3 = {};

      for (attrname in obj1) { obj3[attrname] = obj1[attrname]; }

      for (attrname in obj2) { obj3[attrname] = obj2[attrname]; }

      return obj3;
    };

    var validateString = function(element){

      if(typeof element.value === 'string'){

          if(element.value){

            return true;

          } else {

            return false;

          }

      } else {

        return false;

      }

    };

    //default options
    instanceDefaultOptions = {

      selector: 'form',

      errorHiddenClass: 'error-hidden',

      errorShownClass: 'error-show',

      validate: {

        email: function(email){

          var value;

          if(typeof email === 'string'){

            value = email;

          } else {

            value = email.value;

          }

          var emailRegEx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

          return emailRegEx.test(value);

        },

        tel: function(phone){

          var value;

          if(typeof phone === 'string'){

            value = phone;

          } else {

            value = phone.value;

          }

          var phoneOnlyDigits = value.replace(/\D/g, '');

          return phoneOnlyDigits.length >= 10 ? true : false;

        },

        checkbox: function(checkbox){

          return checkbox.checked ? true : false;

        },

        text: validateString,

        url: validateString,

        password: validateString

      },

      adjustClasses: function(element, isValid){

        var relatedClass,
            hasClass,
            removeClass,
            addClass,
            relatedClasses;

        relatedClass = '.' + element.getAttribute('name') + '-related';

        hasClass = function(ele,cls) {

          return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));

        };

        addClass = function(ele,cls) {

          if ( !hasClass(ele,cls) ) {

            ele.className += ' ' + cls;

          }

        };

        removeClass = function(ele,cls) {

          if (hasClass(ele,cls)) {

            var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');

            ele.className=ele.className.replace(reg,' ');

          }

        };

        if(isValid){

          removeClass(element, instance.options.errorShownClass);

          relatedClasses = document.querySelectorAll(instance.options.selector + ' ' + relatedClass);

          relatedClasses = Array.prototype.slice.call(relatedClasses);

          relatedClasses.forEach(function(item){

            removeClass(item, instance.options.errorShownClass);

          });


        } else {

          addClass(element, instance.options.errorShownClass);

          relatedClasses = document.querySelectorAll(instance.options.selector + ' ' + relatedClass);

          relatedClasses = Array.prototype.slice.call(relatedClasses);

          relatedClasses.forEach(function(item){

            addClass(item, instance.options.errorShownClass);

          });

        }

        return isValid;

      }

    };

    //use instance overrides
    instance.options = mergeObjects(instanceDefaultOptions, instanceOverrideOptions);

    elements = d.querySelectorAll(instance.options.selector);

    elements = Array.prototype.slice.call(elements);
    //attach a submit event listener to all the selected forms forms

    elements.forEach(function(item){

      item.addEventListener('submit', instance.run, false);

    });

    instance.remove = function(){

      //get the selected forms in the dom
      var elements;

      elements = d.querySelectorAll(instance.options.selector);

      elements = Array.prototype.slice.call(elements);

      //attach a submit event listener to all the selected forms forms
      elements.forEach(function(item){

        item.removeEventListener('submit', instance.run, false);

      });

      return instance;

    };

    return instance;

  };

})(window,document);
