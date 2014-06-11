Highcharts.setOptions({
  global: {useUTC: false}
});

Math.randrange = function (min, max) {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  if (!Number.isInteger(min) || !Number.isInteger(max)) {
    throw new TypeError('Arguments are not integer');
  }
  var range;
  range = max - min;
  if (range < 1) {
    throw new RangeError('Empty range between ' + min + ' and ' + max + '.');
  }
  return min + Math.floor(range * Math.random());
};

angular.module('App', [])
  .directive('ngMin', function () {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function (scope, elem, attr, ctrl) {
        var validate = function (value) {
          if (!value || !attr.ngMin) {
            ctrl.$setValidity('min', true);
            return;
          }
          else {
            ctrl.$setValidity('min', value >= scope.$eval(attr.ngMin));
            return value;
          }
        };

        ctrl.$parsers.push(validate);
        ctrl.$formatters.push(validate);
        attr.$observe(attr.ngMin, function () {
          return validate(ctrl.$viewValue);
        });
      }
    };
  })
  .controller('AppCtrl', function ($scope, $interval, $timeout, chartConfig) {

    var system, chart, update, seriesConfig, speedTimeout;

    $scope.speed = 1;
    $scope.count = 3;

    $scope.in = {
      min_iat: 1,
      max_iat: 5,
      min_st: 2,
      max_st: 7
    };

    $scope.$watch('speed', function (value) {
      $timeout.cancel(speedTimeout);
      speedTimeout = $timeout(function () {
        if ($scope.is_running) {
          system.setSpeed(parseInt(1000 / value));
        }
      }, 1000);
    });

    seriesConfig = [{
      name: 'Average Inter Arrival Time',
    }, {
      name: 'Average Service Time',
    }, {
      name: 'Average Waiting Time',
    }];

    update = function () {
      var log = system.getLog();
      chart.series[0].addPoint(parseFloat(log[0].avg_inter_arrival_time), false, false);
      chart.series[1].addPoint(parseFloat(log[0].avg_service_time), false, false);
      chart.series[2].addPoint(parseFloat(log[0].avg_waiting_time), false, false);
      chart.redraw();
      $scope.result = log;
    };

    $scope.is_new = true;
    $scope.is_running = false;

    $scope.start = function () {
      $scope.is_running = true;
      $scope.is_new = false;

      var series = JSON.parse(JSON.stringify(seriesConfig)),
          startTime = (function () {
            var date = new Date();
            date.setSeconds(0);
            date.setMilliseconds(0);
            return date.getTime();
          })();

      for (var i = 0; i < 3; i++) {
        series[i].pointStart = startTime;
      }

      chartConfig.series = series;
      chart = new Highcharts.StockChart(chartConfig);

      system = System($interval, startTime, $scope.count, function () {
        update();
      });
      system.start($scope.in);
    };

    $scope.pause = function () {
      $scope.is_running = false;
      system.pause();
    };

    $scope.resume = function () {
      $scope.is_running = true;
      system.resume($scope.in);
    };

    $scope.stop = function () {
      $scope.is_running = false;
      $scope.is_new = true;

      chart.destroy();
      system.stop();
    };

    $scope.$on('destroy', $scope.stop);

  });
