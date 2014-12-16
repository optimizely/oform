(function(w,d){

  w.Oform = function(instanceOverrideOptions){

    var instance,
        nodeList2Array,
        mergeObjects,
        instanceDefaultOptions,
        elements,
        i;

    instance = this;

    //from: http://stackoverflow.com/questions/3010840/loop-through-array-in-javascript
    nodeList2Array = function (nodes){

      var arr = [];

      for (var i=1; i<nodes.length;(i+=1)){

        arr.push(nodes[i]);

      }

      return arr;

    };

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
          data,
          returnData;

      invalidFields = 0;

      data = [];

      returnData = {};

      if(typeof instance.options.before === 'function'){

        before = instance.options.before();

        if(before === undefined){

          before = true;

        }

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

          returnData[name] = value;

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

            if(type === 'checkbox'){

              if(item.checked){

                data.push( name + '=' + encodeURIComponent(value) );

              }

            } else {

              data.push( name + '=' + encodeURIComponent(value) );

            }

          }

        });

        data = data.join('&');

      }

      if(invalidFields === 0 && before){

        if(typeof instance.options.bodyErrorClass === 'string'){

          instance.options.removeClass( document.getElementsByTagName('body')[0], instance.options.bodyErrorClass );

        }

        if(document.querySelector(instance.options.selector).getAttribute('method')){

          //run submit function
          var request = new XMLHttpRequest();

          if(typeof instance.options.xhr === 'object'){

            var loadFunction = function(event){

              if(typeof instance.options.xhr.load === 'function'){

                instance.options.xhr.load(event, {
                  event: event,
                  data: returnData
                });

              }

              if(typeof instance.options.success === 'function'){

                instance.options.success(event, {
                  event: event,
                  data: returnData
                });

              }

            };

            for(var key in instance.options.xhr){

              if(key === 'load'){

                request.onload = loadFunction;

              } else {

                request['on' + key] = instance.options.xhr[key];

              }

            }

            request.open('POST', event.target.getAttribute('action'), true);

            request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

            if(typeof instance.options.middleware === 'function'){

              data = instance.options.middleware(request, data);

            }

            request.send(data);

          }

        } else {

          if(typeof instance.options.success === 'function'){

            instance.options.success({
              event: null,
              data: returnData
            });

          }

        }

      } else {

        if(typeof instance.options.bodyErrorClass === 'string'){

          instance.options.addClass( document.getElementsByTagName('body')[0], instance.options.bodyErrorClass );

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

      errorShowClass: 'oform-error-show',

      bodyErrorClass: 'oform-error',

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

      hasClass: function(ele,cls) {

        return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));

      },

      addClass: function(ele,cls) {

        if ( !instance.options.hasClass(ele,cls) ) {

          ele.className += ' ' + cls;

        }

      },

      removeClass: function(ele,cls) {

        if (instance.options.hasClass(ele,cls)) {

          var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');

          ele.className=ele.className.replace(reg,' ');

        }

      },

      adjustClasses: function(element, isValid){

        var relatedClass,
            relatedClasses;

        relatedClass = '.' + element.getAttribute('name') + '-related';

        if(isValid){

          instance.options.removeClass(element, instance.options.errorShowClass);

          relatedClasses = document.querySelectorAll(instance.options.selector + ' ' + relatedClass);

          relatedClasses = Array.prototype.slice.call(relatedClasses);

          for(i = 0; i < relatedClasses.length; i++){

            instance.options.removeClass(relatedClasses[i], instance.options.errorShowClass);

          }

        } else {

          instance.options.addClass(element, instance.options.errorShowClass);

          relatedClasses = document.querySelectorAll(instance.options.selector + ' ' + relatedClass);

          relatedClasses = Array.prototype.slice.call(relatedClasses);

          for(i = 0; i < relatedClasses.length; i++){

            instance.options.addClass(relatedClasses[i], instance.options.errorShowClass);

          }

        }

        return isValid;

      }

    };

    //use instance overrides
    instance.options = mergeObjects(instanceDefaultOptions, instanceOverrideOptions);

    elements = d.querySelectorAll(instance.options.selector);

    //elements = Array.prototype.slice.call(elements);
    elements = nodeList2Array(elements);

    //attach a submit event listener to all the selected forms forms
    for(i = 0; i < elements.length; i++){

      elements[i].addEventListener('submit', instance.run, false);

    }
    /*
    elements.forEach(function(item){

      item.addEventListener('submit', instance.run, false);

    });
    */

    instance.remove = function(){

      //get the selected forms in the dom
      var elements;

      elements = d.querySelectorAll(instance.options.selector);

      elements = Array.prototype.slice.call(elements);

      //attach a submit event listener to all the selected forms forms
      for(i = 0; i < elements.length; i++){

        elements[i].removeEventListener('submit', instance.run, false);

      }

      return instance;

    };

    return instance;

  };

})(window,document);
