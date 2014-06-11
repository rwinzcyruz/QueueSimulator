angular.module('App')
  .value('chartConfig', {
    chart: {
      renderTo: 'chart',
      type: 'line'
    },
    title: {
      text: 'Queue Simulation'
    },
    yAxis: {
      min: 0,
      labels: {
        format: '{value:.3f}'
      }
    },
    xAxis: {
      minRange: 10 * 60 * 1000,
      minTickInterval: 60 * 1000
    },
    legend: {
      enabled: true
    },
    tooltip: {
      shared: true,
      xDateFormat: '%e %b, %H:%M'
    },
    rangeSelector: {
      inputEnabled: false,
      selected: 0,
      buttons: [{
        count: 1,
        type: 'hour',
        text: '1H'
      }, {
        count: 12,
        type: 'hour',
        text: '12H'
      }, {
        count: 1,
        type: 'day',
        text: '1D'
      }, {
        type: 'all',
        text: 'All'
      }]
    },
    plotOptions: {
      line: {
        marker: {
          radius: 1
        },
        lineWidth: 1,
        states: {
          hover: {
            lineWidth: 1
          }
        },
        threshold: null,
        pointInterval: 60 * 1000
      }
    },
    credits: {
      enabled: false
    }
  });
