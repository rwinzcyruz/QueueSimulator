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

angular.module('App', ['ui.bootstrap'])
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

    var system, chart, update, seriesConfig, speedTimeout, arrivalProbTimeout;

    $scope.count = 3;

    $scope.in = {
      speed: 1,
      prob: 50,
      min_iat: 1,
      max_iat: 10,
      min_st: 2,
      max_st: 5
    };

    $scope.$watch('in.prob', function (value) {
      $timeout.cancel(arrivalProbTimeout);
      arrivalProbTimeout = $timeout(function () {
        return system && system.setArrivalProb(value) || undefined;
      }, 1000);
    });

    $scope.$watch('in.speed', function (value) {
      $timeout.cancel(speedTimeout);
      speedTimeout = $timeout(function () {
        return system && system.setSpeed(value) || undefined;
      }, 1000);
    });

    seriesConfig = [
      {name: 'Average Inter Arrival Time'},
      {name: 'Average Service Time'},
      {name: 'Average Waiting Time'}
    ];

    update = function () {
      var log = system.getLog();
      chart.series[0].addPoint(parseFloat(log[0].avg_inter_arrival_time), false, false);
      chart.series[1].addPoint(parseFloat(log[0].avg_service_time), false, false);
      chart.series[2].addPoint(parseFloat(log[0].avg_waiting_time), false, false);
      chart.redraw();
      $scope.result = log;
      $scope.out = {
        total_client: system.getTotalClient(),
        servers: system.getServerLog()
      };
    };

    $scope.is_new = true;
    $scope.is_running = false;

    $scope.start = function () {
      $scope.is_running = true;
      $scope.is_new = false;

      var series = JSON.parse(JSON.stringify(seriesConfig)),
          startTime = new Date().setMilliseconds(0);

      for (var i = 0; i < 3; i++) {
        series[i].pointStart = startTime;
      }

      chartConfig.series = series;
      chart = new Highcharts.StockChart(chartConfig);

      system = System($interval, startTime, parseInt($scope.count), update);
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

      system.stop();
      chart.destroy();
    };

    $scope.$on('destroy', $scope.stop);

  });
