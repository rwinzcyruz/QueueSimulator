var Client = function (timeCount, interArrivalTime) {
  var _id = ++Client.uuid,
      _interArrivalTime = interArrivalTime,
      _arrivalTime = timeCount + interArrivalTime,
      _serviceTime,
      _leavingTime,
      _serviceStartTime,
      _waitingTime,
      _attendTime;

  return {
    getId: function () { return _id; },
    getInterArrivalTime: function () { return _interArrivalTime; },
    getArrivalTime: function () { return _arrivalTime; },
    getLeavingTime: function () { return _leavingTime; },
    getServiceTime: function () { return _serviceTime; },
    getAttendTime: function () { return _attendTime; },
    getWaitingTime: function () { return _waitingTime; },
    decAttendTime: function () { _attendTime--; },
    setServiceTime: function (serviceTime) { _serviceTime = serviceTime; },
    startService: function (time) {
      _serviceStartTime = time;
      _leavingTime = _arrivalTime + _serviceTime;
      _waitingTime = time - _arrivalTime;
      _attendTime = _serviceTime;
    },
  };
};
Client.uuid = 0;
