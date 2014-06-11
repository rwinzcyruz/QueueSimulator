var System = function ($interval, startTime, serverCount, callback) {
  var _id = ++System.uuid,
      _time = startTime,
      _timeCount = 0,
      _speed = 1000,
      _minIAT,
      _maxIAT,
      _minST,
      _maxST,
      _arrivalProb = 0.5,
      _totalClient = 0,
      _totalInterArrivalTime = 0,
      _totalServiceTime = 0,
      _totalWaitingTime = 0,
      _log = [],
      _arrival = [],
      _servers = [],
      _runner,
      _getAvgServiceTime = function () {
        return ((_totalServiceTime / _totalClient) || 0).toFixed(3);
      },
      _getAvgInterArrivalTime = function () {
        return ((_totalInterArrivalTime / _totalClient) || 0).toFixed(3);
      },
      _getAvgWaitingTime = function () {
        return ((_totalWaitingTime / _totalClient) || 0).toFixed(3);
      },
      _init = function (options) {
        _minIAT = options.min_iat;
        _maxIAT = options.max_iat;
        _minST = options.min_st;
        _maxST = options.max_st;
      },
      _compute = function () {
        var iat, st, cur, client, server, finishedLog;

        if (Math.random() < _arrivalProb) {
          iat = Math.randrange(_minIAT, _maxIAT);
          if (!_arrival[iat]) {
            _arrival[iat] = [Client(_timeCount, iat)];
          }
          else {
            _arrival.push(Client(_timeCount, iat));
          }
        }

        cur = _arrival.shift();
        console.log('time %d, arrival: %d', _timeCount, cur && cur.length || 0);

        while (cur && cur.length > 0) {
          st = Math.randrange(_minST, _maxST);
          client = cur.shift();
          client.setServiceTime(st);
          server = _servers[Math.randrange(serverCount)];
          server.addClient(client);
          _totalClient++;
          _totalInterArrivalTime += client.getInterArrivalTime();
          console.log('time %d, klien %d masuk pada antrian server %d dengan waktu servis %d. total: %d', _timeCount, client.getId(), server.getId(), st, _totalClient);
          server.log();
        }

        for (var i = 0; i < serverCount; i++) {
          finishedLog = _servers[i].serve(_timeCount);
          if (finishedLog) {
            _totalServiceTime += finishedLog[0];
            _totalWaitingTime += finishedLog[1];
          }
        }

        _timeCount++;
        _time = _time + 60 * 1000;

        _log.unshift({
          time: new Date(_time).toLocaleString(),
          time_count: _timeCount,
          avg_service_time: _getAvgServiceTime(),
          avg_inter_arrival_time: _getAvgInterArrivalTime(),
          avg_waiting_time: _getAvgWaitingTime()
        });

        callback();
      },
      _start = function (options) {
        _init(options);

        for (var i = 0; i < serverCount; i++) {
          _servers.push(Server());
        }

        _runner = $interval(function () {
          _compute();
        }, _speed);
        console.info('system started');
      },
      _stop = function () {
        $interval.cancel(_runner);
        _servers = [];
        console.info('system stopped');
      },
      _pause = function () {
        $interval.cancel(_runner);
        console.info('system paused');
      },
      _resume = function (options) {
        if (options) {
          _init(options);
        }

        _runner = $interval(function () {
          _compute();
        }, _speed);
        console.info('system resumed');
      };

  return {
    getId: function () {
      return _id;
    },
    getTime: function () {
      return _timeCount;
    },
    setSpeed: function (speed) {
      _speed = speed;
      _pause();
      _resume();
      console.info('speed change to %d ms per tick', speed);
    },
    getLog: function () {
      return _log;
    },
    start: _start,
    pause: _pause,
    resume: _resume,
    stop: _stop
  };
};
System.uuid = 0;