var hamburgerBtnEl = document.querySelector('.hamburger-btn');

hamburgerBtnEl.addEventListener('click', function toggleMenu() {
  var expanded = hamburgerBtnEl.getAttribute('aria-expanded');

  if (expanded == 'true') hamburgerBtnEl.setAttribute('aria-expanded', 'false');
  else hamburgerBtnEl.setAttribute('aria-expanded', 'true');
});
///////////////////////////////////////////////////////

var forecastContainer = document.querySelector('.forecast-container');

var forecastEls = document.querySelectorAll('.forecast');

var searchEl = document.querySelector('#search');
var findBtnEl = document.querySelector('#findBtn');
var formFindEl = document.querySelector('.form-find');

searchEl.value = null;

///////////////////////////////////////////////////////
var baseUrl = 'https://api.weatherapi.com/v1';
var apiKey = '3a4eed849de049e9991132727252610';
var endpoint = 'forecast.json';

var directions = {
  N: 'North',
  E: 'East',
  S: 'South',
  W: 'West',
  NE: 'Northeast',
  SE: 'Southeast',
  SW: 'Southwest',
  NW: 'Northwest',
  NNE: 'North-northeast',
  ENE: 'East-northeast',
  ESE: 'East-southeast',
  SSE: 'South-southeast',
  SSW: 'South-southwest',
  WSW: 'West-southwest',
  WNW: 'West-northwest',
  NNW: 'North-northwest',
};

var position = {
  lat: 0,
  lon: 0,
};

var temp = {
  max: 'none',
  min: 'none',
  current: 'none',
};

var conditions = {
  text: 'none',
  icon: 'none',
  current: {
    text: 'none',
    icon: 'none',
  },
};

var windState = {
  speed: 'none',
  dir: 'none',
  humidity: 'none',
};

var city;
var dayDate = {
  weekday: 'none',
  dayNum: 'none',
  month: 'none',
};

navigator.geolocation.getCurrentPosition(success, failure);

searchEl.addEventListener('input', async function getWeatherData(event) {
  document.querySelector('.failed').style.display = 'none';

  if (!event.target.value) return;

  await setForecast(event.target.value);
  updateView();

  delete forecastContainer.dataset.state;
});

formFindEl.addEventListener('submit', async function getWeatherData(event) {
  event.preventDefault();

  if (!searchEl.value) return;

  document.querySelector('.failed').style.display = 'none';

  await setForecast(searchEl.value);
  updateView();

  searchEl.value = null;

  delete forecastContainer.dataset.state;
});

function getPosition(pos) {
  position.lat = pos.coords.latitude;
  position.lon = pos.coords.longitude;
  console.log(position);
}

async function getForecast(query = `${position.lat},${position.lon}`) {
  try {
    var request = await fetch(
      `${baseUrl}/${endpoint}?key=${apiKey}&q=${query}&days=3`
    );

    if (!request.ok)
      throw new Error(`Something went wrong incorrect city name`);

    return await request.json();
  } catch (err) {
    console.error('Error fetching forecast', err);
    return null;
  }
}

var forecastRes;
async function setForecast(query) {
  forecastRes = await getForecast(query);
}

async function updateState(index = 0) {
  console.log(forecastRes);

  city = forecastRes.location.name;

  var date = new Date(forecastRes.forecast.forecastday[index].date);

  temp.max = forecastRes.forecast.forecastday[index].day.maxtemp_c;
  temp.min = forecastRes.forecast.forecastday[index].day.mintemp_c;
  temp.current = forecastRes.current.temp_c;

  conditions.text = forecastRes.forecast.forecastday[index].day.condition.text;
  conditions.icon = forecastRes.forecast.forecastday[index].day.condition.icon;
  conditions.current.text = forecastRes.current.condition.text;
  conditions.current.icon = forecastRes.current.condition.icon;

  windState.speed =
    forecastRes.forecast.forecastday[index].hour[index].wind_kph;
  windState.dir =
    directions[forecastRes.forecast.forecastday[index].hour[index].wind_dir];
  windState.humidity =
    forecastRes.forecast.forecastday[index].hour[index].humidity;

  dayDate.weekday = date.toLocaleString('default', { weekday: 'long' });
  dayDate.dayNum = date.toLocaleString('default', { day: '2-digit' });
  dayDate.month = date.toLocaleString('default', { month: 'long' });

  console.log(city, dayDate, temp, conditions, windState);
}

function updateView() {
  for (var i = 1; i < forecastEls.length; i++) {
    updateState(i - 1);

    var htmlOthers = `
             <div class="forecast-header">
                <span class="day">${dayDate.weekday}</span>
              </div>

              <div class="forecast-content">
                  <div class="icon">
                    <img
                      src="${conditions.icon}"
                    />
                  </div>
                <div class="degree">
                  <div class="num">${temp.max}&deg;C</div>
                  <small>${temp.min}<sup>o</sup>C</small>
                  
                </div>
                <div class="custom text-brand">${conditions.text}</div>
              </div>
                `;

    var htmlToday = `
              <div class="forecast-header">
                <span class="day">${dayDate.weekday}</span>
                <span class="date">${dayDate.dayNum} ${dayDate.month}</span>
              </div>

              <div class="forecast-content">
                <div class="location">${city}</div>
                <div class="degree">
                  <div class="num">${temp.current}&deg;C</div>
                  <div class="icon">
                    <img
                      src="${conditions.current.icon}"
                    />
                  </div>
                </div>
                <div class="custom text-brand">${conditions.current.text}</div>

                <div class="state">
                  <div class="humidity">
                    <img
                      src="https://routeweather.netlify.app/images/icon-umberella.png"
                    />
                    <span> ${windState.humidity}%</span>
                  </div>
                  <div class="wind-speed">
                    <img
                      src="https://routeweather.netlify.app/images/icon-wind.png"
                    />
                    <span>${windState.speed} Km/h</span>
                  </div>
                  <div class="wind-dir">
                    <img
                      src="https://routeweather.netlify.app/images/icon-compass.png"
                    />
                    <span>${windState.dir}</span>
                  </div>
                 </div>
                </div>
              `;

    console.log(forecastEls[i]);

    if (i === 1) {
      forecastEls[i].innerHTML = htmlToday;
    } else {
      forecastEls[i].innerHTML = htmlOthers;
    }
  }
}

async function success(pos) {
  getPosition(pos);
  await setForecast();

  updateView();

  delete forecastContainer.dataset.state;
}

function failure() {
  document.querySelector('.failed').style.display = 'flex';
}
