var Server = function () {
  var _id = ++Server.uuid,
      _totalServe = 0,
      _client,
      _queue = [];

  return {
    getId: function () {
      return _id;
    },
    addClient: function (client) {
      return _queue.push(client);
    },
    getTotalServe: function () {
      return _totalServe;
    },
    getQueueLength: function () {
      return _queue.length;
    },
    serve: function (time) {
      var st, wt;
      if (!_client && _queue.length > 0) {
        _client = _queue.shift();
        _client.startService(time);
      }
      else if (_client && _client.getLeavingTime() === time) {
        _totalServe++;
        st = _client.getServiceTime();
        wt = _client.getWaitingTime();
        console.log('time %d, server %d telah selesai melayani klien %d.', time, _id, _client.getId());
        _client = null;
        return [st, wt];
      }
    },
    log: function () {
      console.log(_queue);
    }
  };
};
Server.uuid = 0;
