var Client = function (timeCount, interArrivalTime) {
  var _id = ++Client.uuid,
      _interArrivalTime = interArrivalTime,
      _arrivalTime = timeCount + interArrivalTime,
      _serviceTime,
      _leavingTime,
      _serviceStartTime,
      _waitingTime;

  return {
    getId: function () {
      return _id;
    },
    getInterArrivalTime: function () {
      return _interArrivalTime;
    },
    getArrivalTime: function () {
      return _arrivalTime;
    },
    getLeavingTime: function () {
      return _leavingTime;
    },
    getServiceTime: function () {
      return _serviceTime;
    },
    setServiceTime: function (serviceTime) {
      _serviceTime = serviceTime;
    },
    startService: function (time) {
      _serviceStartTime = time;
      _leavingTime = _arrivalTime + _serviceTime;
      _waitingTime = time - _arrivalTime;
    },
    getWaitingTime: function () {
      return _waitingTime;
    }
  };
};
Client.uuid = 0;
