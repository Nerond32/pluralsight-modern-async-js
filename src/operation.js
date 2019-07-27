const delayms = 1;

const expectedCurrentCity = 'New York, NY';
const expectedForecast = {
  fiveDay: [60, 70, 80, 45, 50]
};

function getCurrentCity(callback) {
  setTimeout(function() {
    const city = expectedCurrentCity;
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
    callback(null, expectedForecast);
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
  operation.then = (onSuccess, onError) => {
    const completionOp = new Operation();
    const successHandler = () => {
      if (onSuccess) {
        let callbackResult;
        try {
          callbackResult = onSuccess(operation.result);
        } catch (e) {
          completionOp.fail(e);
        }
        if (callbackResult && callbackResult.then) {
          callbackResult.forwardCompletion(completionOp);
          return;
        }
        completionOp.succeed(callbackResult);
      } else {
        completionOp.succeed(operation.result);
      }
    };
    const errorHandler = () => {
      if (onError) {
        let callbackResult;
        try {
          callbackResult = onError(operation.error);
        } catch (e) {
          completionOp.fail(e);
        }
        if (callbackResult && callbackResult.then) {
          callbackResult.forwardCompletion(completionOp);
          return;
        }
        completionOp.succeed(callbackResult);
      } else {
        completionOp.fail(operation.error);
      }
    };
    if (operation.state == 'succeeded') {
      successHandler();
    } else if (operation.state == 'failed') {
      errorHandler();
    } else {
      operation.successReactions.push(successHandler);
      operation.failureReactions.push(errorHandler);
    }
    return completionOp;
  };

  operation.catch = onError => {
    return operation.then(null, onError);
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
    operation.then(op.succeed, op.fail);
  };
  return operation;
}

test('unnesting', done => {
  fetchCurrentCity()
    .then(city => fetchWeather(city))
    .then(weather => done());
});

test('lexical paralleism', done => {
  const city = 'NYC';
  const weatherOp = fetchWeather(city);
  const forecastOp = fetchForecast(city);
  weatherOp.then(weather => {
    forecastOp.then(forecast => {
      done();
    });
  });
});

test('register only success handler, ignores error', done => {
  const operation = fetchCurrentCity();
  operation.catch(error => done(error));
  operation.then(result => done(), null);
});

test('register only error handler, ignores success', done => {
  const operation = fetchWeather();
  operation.then(result => done(new Error("shouldn't succeed")), null);
  operation.catch(error => done());
});

test('pass multiple callbacks -- all of them called', done => {
  const operation = fetchCurrentCity();
  const multiDone = callDone(done).afterTwoCalls();
  operation.then(result => multiDone(), null);
  operation.then(result => multiDone(), null);
});

test('fetchCurrentCity pass the callbacks later on', done => {
  const operation = fetchCurrentCity();
  operation.then(result => done(), null);
});

const fetchCurrentCityThatFails = () => {
  let operation = new Operation();
  doLater(() => operation.fail(new Error('GPS BROKEN')));
  return operation;
};

test('sync error recovery', done => {
  fetchCurrentCityThatFails()
    .catch(() => {
      return 'default city';
    })
    .then(city => {
      expect(city).toBe('default city');
      done();
    });
});

test('async error recovery', done => {
  fetchCurrentCityThatFails()
    .catch(() => {
      return fetchCurrentCity();
    })
    .then(city => {
      expect(city).toBe(expectedCurrentCity);
      done();
    });
});

test('error recovery bypassed if not needed', done => {
  fetchCurrentCity()
    .catch(() => 'default city')
    .then(city => {
      expect(city).toBe(expectedCurrentCity);
      done();
    });
});

test('error fallthrough', done => {
  fetchCurrentCity()
    .then(city => {
      return fetchForecast();
    })
    .then(forecast => {
      expect(forecast).toBe(expectedForecast);
    })
    .catch(error => {
      done();
    });
});
test('sync result transformation', done => {
  fetchCurrentCity()
    .then(city => {
      return '10019';
    })
    .then(zip => {
      expect(zip).toBe('10019');
      done();
    });
});

test('thrown error recovery', done => {
  fetchCurrentCity()
    .then(city => {
      throw new Error('oh noes');
      return fetchWeather(city);
    })
    .catch(e => done());
});

test('error from error', done => {
  fetchCurrentCity()
    .then(city => {
      throw new Error('oh noes');
      return fetchWeather(city);
    })
    .catch(error => {
      expect(error.message).toBe('oh noes');
      throw new Error('oh noes 2');
    })
    .catch(error => {
      expect(error.message).toBe('oh noes 2');
      done();
    });
});
