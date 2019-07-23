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

const fetchCurrentCity = (onSuccess, onFailure) => {
  getCurrentCity((error, result) => {
    if (error) {
      onFailure(error);
    }
    onSuccess(result);
  });
};

test('fetchCurrentCity with separate success and error callbacks', () => {
  const success = result => {
    console.log(result);
  };
  const failure = error => {
    console.log(error);
  };
  fetchCurrentCity(success, failure);
});
