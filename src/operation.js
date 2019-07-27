const delayms = 1;

function getCurrentCity(callback) {
  setTimeout(function() {
    const city = 'New York, NY';
    callback(null, city);
  }, delayms);
}

function getWeather(city, callback) {
  setTimeout(() => {
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

const doLater = func => {
  setTimeout(func, 1);
};

function Operation() {
  const operation = {
    successReactions: [],
    failureReactions: []
  };
  operation.onCompletion = (onSuccess, onError) => {
    const completionOp = new Operation();
    const successHandler = () => {
      if (onSuccess) {
        const callbackResult = onSuccess(operation.result);
        if (callbackResult && callbackResult.onCompletion) {
          callbackResult.forwardCompletion(completionOp);
        }
      }
    };
    if (operation.state == 'succeeded') {
      successHandler();
    } else if (operation.state == 'failed') {
      onError(operation.err);
    } else {
      operation.successReactions.push(successHandler);
      if (onError) {
        operation.failureReactions.push(onError);
      }
    }
    return completionOp;
  };
  operation.onFailure = onError => {
    return operation.onCompletion(null, onError);
  };
  operation.succeed = result => {
    operation.state = 'succeeded';
    operation.result = result;
    operation.successReactions.forEach(cb => {
      cb(result);
    });
  };
  operation.fail = error => {
    operation.state = 'failed';
    operation.error = error;
    operation.failureReactions.forEach(cb => {
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
  operation.forwardCompletion = op => {
    operation.onCompletion(op.succeed, op.fail);
  };
  return operation;
}

test('unnesting', done => {
  let weatherOp = fetchCurrentCity().onCompletion(city => {
    return fetchWeather(city);
  });
  weatherOp.onCompletion(weather => {
    done();
  });
});

test('lexical paralleism', done => {
  const city = 'NYC';
  const weatherOp = fetchWeather(city);
  const forecastOp = fetchForecast(city);
  weatherOp.onCompletion(weather => {
    forecastOp.onCompletion(forecast => {
      done();
    });
  });
});

test('register only success handler, ignores error', done => {
  const operation = fetchCurrentCity();
  operation.onFailure(error => done(error));
  operation.onCompletion(result => done(), null);
});

test('register only error handler, ignores success', done => {
  const operation = fetchWeather();
  operation.onCompletion(result => done(new Error("shouldn't succeed")), null);
  operation.onFailure(error => done());
});

test('pass multiple callbacks -- all of them called', done => {
  const operation = fetchCurrentCity();
  const multiDone = callDone(done).afterTwoCalls();
  operation.onCompletion(result => multiDone(), null);
  operation.onCompletion(result => multiDone(), null);
});

test('fetchCurrentCity pass the callbacks later on', done => {
  const operation = fetchCurrentCity();
  operation.onCompletion(result => done(), null);
});
