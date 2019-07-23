const delayms = 1;

function getCurrentCity(callback) {
  setTimeout(function() {
    const city = 'New York, NY';
    callback(null, city);
  }, delayms);
}

function getWeather(city, callback) {
  setTimeout(function() {
    if (!city) {
      callback(new Error('City required to get weather'));
      return;
    }

    const weather = {
      temp: 50
    };

    callback(null, weather);
  }, delayms);
}

function getForecast(city, callback) {
  setTimeout(function() {
    if (!city) {
      callback(new Error('City required to get forecast'));
      return;
    }

    const fiveDay = {
      fiveDay: [60, 70, 80, 45, 50]
    };

    callback(null, fiveDay);
  }, delayms);
}

suite.only('operations');

const fetchCurrentCity = () => {
  const operation = new Operation();
  getCurrentCity(operation.nodeCallback);
  return operation;
};

const fetchWeather = city => {
  const operation = new Operation();
  getWeather(city, operation.nodeCallback);
  return operation;
};

const fetchForecast = city => {
  const operation = new Operation();
  getForecast(city, operation.nodeCallback);
  return operation;
};

function Operation() {
  const operation = {
    onSuccess: [],
    onFailure: []
  };
  operation.setSuccessCb = result => {
    operation.onSuccess.push(result);
  };
  operation.setFailureCb = error => {
    operation.onFailure.push(error);
  };
  operation.succeed = result => {
    operation.onSuccess.forEach(cb => {
      cb(result);
    });
  };
  operation.fail = error => {
    operation.onFailure.forEach(cb => {
      cb(error);
    });
  };
  operation.nodeCallback = (error, result) => {
    if (error) {
      operation.fail(error);
      return;
    }
    operation.succeed(result);
  };
  return operation;
}

test('register only success handler, ignores error', done => {
  const operation = fetchCurrentCity();
  operation.setFailureCb(error => done(error));
  operation.setSuccessCb(result => done());
});

test('register only error handler, ignores success', done => {
  const operation = fetchWeather();
  operation.setSuccessCb(result => done(new Error("shouldn't succeed")));
  operation.setFailureCb(error => done());
});

test('pass multiple callbacks -- all of them called', done => {
  const operation = fetchCurrentCity();
  const multiDone = callDone(done).afterTwoCalls();
  operation.setSuccessCb(result => multiDone());
  operation.setSuccessCb(result => multiDone());
});

test('fetchCurrentCity pass the callbacks later on', done => {
  const operation = fetchCurrentCity();
  operation.setSuccessCb(result => done());
});
