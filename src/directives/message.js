angular.module('schemaForm').directive('sfMessage',
['$injector', 'sfErrorMessage', function($injector, sfErrorMessage) {

  //Inject sanitizer if it exists
  var $sanitize = $injector.has('$sanitize') ?
                  $injector.get('$sanitize') : function(html) { return html; };

  return {
    scope: false,
    restrict: 'EA',
    link: function(scope, element, attrs) {
      function sfMessageTag() {}
      scope.__tag = new sfMessageTag();

      var message = '';
      if (attrs.sfMessage) {
        scope.$watch(attrs.sfMessage, function(msg) {
          if (msg) {
            message = $sanitize(msg);
            if (scope.ngModel) {
              update(scope.ngModel.$valid);
            } else {
              update();
            }
          }
        });
      }

      var update = function(valid) {
        if (valid && !scope.hasError()) {
          element.html(message);
        } else {
          var errors = [];
          angular.forEach(((scope.ngModel && scope.ngModel.$error) || {}), function(status, code) {
            if (status) {
              // if true then there is an error
              // Angular 1.3 removes properties, so we will always just have errors.
              // Angular 1.2 sets them to false.
              errors.push(code);
            }
          });

          // In Angular 1.3 we use one $validator to stop the model value from getting updated.
          // this means that we always end up with a 'schemaForm' error.
          errors = errors.filter(function(e) { return e !== 'schemaForm'; });

          // We only show one error.
          // TODO: Make that optional
          var error = errors[0];

          if (error) {
            element.html(sfErrorMessage.interpolate(
              error,
              scope.ngModel.$modelValue,
              scope.ngModel.$viewValue,
              scope.form,
              scope.options && scope.options.validationMessage
            ));
          } else {
            element.html(message);
          }
        }
      };

      // Update once.
      update();

      scope.$watchCollection('ngModel.$error', function() {
        if (scope.ngModel) {
          update(scope.ngModel.$valid);
        }
      });

    }
  };
}]);
