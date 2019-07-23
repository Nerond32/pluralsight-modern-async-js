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
  const operation = {
    onSuccess: [],
    onFailure: []
  };
  const callAllSuccesses = result => {
    operation.onSuccess.forEach(cb => {
      cb(result);
    });
  };
  const callAllFailures = error => {
    operation.onFailure.forEach(cb => {
      cb(error);
    });
  };
  operation.setSuccessCb = result => {
    operation.onSuccess.push(result);
  };
  operation.setFailureCb = error => {
    operation.onFailure.push(error);
  };
  getCurrentCity((error, result) => {
    if (error) {
      callAllFailures(error);
      return;
    }
    callAllSuccesses(result);
  }, 5);
  return operation;
};

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
