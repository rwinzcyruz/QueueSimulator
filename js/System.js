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
      _setArrivalProb = function (prob) {
        _arrivalProb = parseFloat(+prob / 100);
      },
      _setSpeed = function (speed) {
        _speed = parseFloat(1000 / +speed);
      },
      _init = function (options) {
        _setSpeed(options.speed);
        _setArrivalProb(options.prob);
        _minIAT = options.min_iat;
        _maxIAT = options.max_iat + 1;
        _minST = options.min_st;
        _maxST = options.max_st + 1;
      },
      _compute = function () {
        var iat, st, cur, client, server, finishedLog;

        if (Math.random() < _arrivalProb) {
          iat = Math.randrange(_minIAT, _maxIAT);
          if (!_arrival[iat]) {
            _arrival[iat] = [Client(_timeCount, iat)];
          } else {
            _arrival[iat].push(Client(_timeCount, iat));
          }
        }

        cur = _arrival.shift();
        console.log('time %d, arrival: %d', _timeCount, cur && cur.length || 0);

        while (cur && cur.length > 0) {
          st = Math.randrange(_minST, _maxST);
          client = cur.shift();
          client.setServiceTime(st);
//          server = _servers[Math.randrange(serverCount)];
          server = _servers[_chooseServer()];
          server.addClient(client);
          _totalClient++;
          _totalInterArrivalTime += client.getInterArrivalTime();
          console.log('time %d, klien %d masuk pada antrian server %d dengan waktu servis %d.', _timeCount, client.getId(), server.getId(), st);
        }

        for (var i = 0; i < serverCount; i++) {
          finishedLog = _servers[i].serve(_timeCount);
          if (finishedLog) {
            _totalServiceTime += finishedLog[0];
            _totalWaitingTime += finishedLog[1];
          }
        }

        _timeCount++;
        _time += 1000;

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
      },
      _chooseServer = function () {
        var order = [];

        for (var i in _servers) {
          order.push([_servers[i].getId(), _servers[i].getTotalIdle()]);
        }

        order.sort(function (a, b) { return b[1] - a[1]; });
        return order[0][0] - 1;
      };

  return {
    getId: function () { return _id; },
    getTime: function () { return _timeCount; },
    getTotalClient: function () { return _totalClient; },
    getLog: function () { return _log; },
    getServerLog: function () {
      var log = [];
      for (var i = 0; i < serverCount; i++) {
        log.push(_servers[i].getLog());
      }
      return log;
    },
    getArrivalQueue: function () { return _arrival; },
    setArrivalProb: _setArrivalProb,
    setSpeed: function (speed) {
      _setSpeed(speed);
      _pause();
      _resume();
      console.info('speed change to %d ms per tick', _speed);
    },
    start: _start,
    pause: _pause,
    resume: _resume,
    stop: _stop
  };
};
System.uuid = 0;
