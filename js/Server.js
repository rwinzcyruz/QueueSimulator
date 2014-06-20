var Server = function () {
  var _id = ++Server.uuid,
      _totalServe = 0,
      _queue = [],
      _totalIdle = 0,
      _idleTime = 0,
      _client,
      _isIdle = function () {
        return !_client;
      },
      _getAvgIdleTime = function () {
        var avg = _totalIdle / _totalServe;
        if (!isFinite(avg)) {
          avg = 0;
        }
        return avg.toFixed(3);
      };

  return {
    getId: function () { return _id; },
    getTotalServe: function () { return _totalServe; },
    getQueueLength: function () { return _queue.length; },
    addClient: function (client) { return _queue.push(client); },
    getAvgIdleTime: _getAvgIdleTime,
    isIdle: _isIdle,
    serve: function (time) {
      var st, wt;

      if (_isIdle()) {
        if (_queue.length > 0) {
          _totalIdle += _idleTime;
          _idleTime = 0;
          _client = _queue.shift();
          _client.startService(time);
        } else {
          _idleTime++;
        }
      } else {
        _client.decAttendTime();

        if (_client.getAttendTime() === 0) {
          _totalServe++;
          st = _client.getServiceTime();
          wt = _client.getWaitingTime();
          console.log('time %d, server %d telah selesai melayani klien %d.', time, _id, _client.getId());
          _client = null;
          return [st, wt];
        }
      }
    },
    getLog: function () {
      return {
        id: _id,
        total_serve: _totalServe,
        client: {
          id: _client && _client.getId() || '-',
          attend_time: _client && _client.getAttendTime() || '-'
        },
        idle_time: _idleTime,
        total_idle_time: _totalIdle,
        queue_length: _queue.length,
        avg_idle_time: _getAvgIdleTime()
      };
    }
  };
};
Server.uuid = 0;
