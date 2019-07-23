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
  const operation = {};
  let onSuccess;
  let onFailure;
  operation.setCallbacks = (error, result) => {
    onFailure = error;
    onSuccess = result;
  };
  getCurrentCity((error, result) => {
    if (error) {
      onFailure(error);
      return;
    }
    onSuccess(result);
  }, 5);
  return operation;
};

test('fetchCurrentCity pass the callbacks later on', done => {
  const operation = fetchCurrentCity();
  operation.setCallbacks(error => done(error), result => done());
});
