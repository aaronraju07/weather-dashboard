let chart;

async function getWeather() {
  const city = document.getElementById("cityInput").value.trim().toLowerCase();

  if (!city) {
    alert("Enter city name");
    return;
  }

  try {
    const res = await fetch(`/get-weather?city=${city}`);
    const data = await res.json();

    if (data.cod !== 200) {
      alert("City not found");
      return;
    }

    updateUI(data);      // ✅ only this
    getForecast(city);   // ✅ and this

  } catch (error) {
    alert("Error fetching data");
  }
}

async function getForecast(city) {
  try {
    const res = await fetch(`/get-forecast?city=${city}`);
    const data = await res.json();

    const forecastDiv = document.getElementById("forecast");
    forecastDiv.innerHTML = "";

    const daily = data.list.filter(item => item.dt_txt.includes("12:00:00"));

    daily.slice(0, 5).forEach(day => {
      const options = { weekday: 'short' };
      const date = new Date(day.dt_txt).toLocaleDateString(undefined, options);

      const card = `
        <div class="forecast-card">
          <p>${date}</p>
          <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png">
          <p>${day.main.temp.toFixed(1)}°C</p>
        </div>
      `;

      forecastDiv.innerHTML += card;
    });

    // 📊 Chart data
    const labels = [];
    const temps = [];

    data.list.slice(0, 8).forEach(item => {
      const time = item.dt_txt.split(" ")[1].slice(0, 5);
      labels.push(time);
      temps.push(item.main.temp);
    });

    const ctx = document.getElementById("weatherChart").getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, "#38bdf8");
    gradient.addColorStop(1, "rgba(56,189,248,0)");

    if (chart) {
      chart.destroy();
    }

    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [{
          label: "Temperature (°C)",
          data: temps,
          borderWidth: 3,
          pointRadius: 4,
          tension: 0.4,
          borderColor: "#38bdf8",     // 🔥 line color
          backgroundColor: gradient,  // 🔥 gradient fill
          fill: true                  // 🔥 important!
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              color: "white",
              font: { size: 16 }
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: "white",
              font: { size: 14 }
            },
            title: {
              display: true,
              text: "Time",
              color: "white",
              font: { size: 16 }
            },
            grid: {
              color: "rgba(255,255,255,0.1)"
            }
          },
          y: {
            ticks: {
              color: "white",
              font: { size: 14 }
            },
            title: {
              display: true,
              text: "Temperature (°C)",
              color: "white",
              font: { size: 16 }
            },
            grid: {
              color: "rgba(255,255,255,0.1)"
            }
          }
        }
      }
    });
    const hourlyDiv = document.getElementById("hourly");
    hourlyDiv.innerHTML = "";

    data.list.slice(0, 8).forEach(item => {
      const time = item.dt_txt.split(" ")[1].slice(0, 5);

      hourlyDiv.innerHTML += `
    <div class="forecast-card">
      <p>${time}</p>
      <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png">
      <p>${item.main.temp.toFixed(1)}°C</p>
    </div>
  `;
    });
  } catch (err) {
    console.error(err);
  }
}

function updateUI(data) {
  document.getElementById("city").innerText = data.name;
  document.getElementById("temp").innerText = data.main.temp.toFixed(1) + "°C";
  document.getElementById("desc").innerText = data.weather[0].description;

  document.getElementById("humidity").innerText = data.main.humidity;
  document.getElementById("wind").innerText = data.wind.speed;
  document.getElementById("feels").innerText = data.main.feels_like.toFixed(1);
  document.getElementById("pressure").innerText = data.main.pressure;

  document.getElementById("icon").src =
    `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;


  const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
  const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString();

  document.getElementById("sunrise").innerText = sunrise;
  document.getElementById("sunset").innerText = sunset;
}

function getLocationWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async position => {

      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      const res = await fetch(`/get-weather-coords?lat=${lat}&lon=${lon}`);
      const data = await res.json();

      updateUI(data);
      getForecast(data.name);

    });
  } else {
    alert("Geolocation not supported");
  }
}

function saveCity() {
  const city = document.getElementById("city").innerText;

  if (!city) return;

  let cities = JSON.parse(localStorage.getItem("cities")) || [];

  if (!cities.includes(city)) {
    cities.push(city);
    localStorage.setItem("cities", JSON.stringify(cities));
    alert("Saved!");
    loadSavedCities(); // 🔥 refresh list
  }
}
function loadSavedCities() {
  const cities = JSON.parse(localStorage.getItem("cities")) || [];
  const div = document.getElementById("savedCities");

  if (cities.length === 0) {
    div.innerHTML = "<h3>Saved Cities</h3><p>No saved cities</p>";
    return;
  }

  div.innerHTML = "<h3>Saved Cities</h3>";

  cities.forEach(city => {
    div.innerHTML += `
      <div class="saved-item">
        <span onclick="getWeatherFromSaved('${city}')">${city}</span>
        <button onclick="event.stopPropagation(); deleteCity('${city}')">❌</button>
      </div>
    `;
  });
}

function deleteCity(cityToDelete) {
  if (!confirm("Delete this city?")) return;

  let cities = JSON.parse(localStorage.getItem("cities")) || [];

  cities = cities.filter(city => city !== cityToDelete);

  localStorage.setItem("cities", JSON.stringify(cities));

  loadSavedCities();
}

function getWeatherFromSaved(city) {
  document.getElementById("cityInput").value = city;  // ✅ show in input
  getWeather();                                       // ✅ fetch data
}

async function getSuggestions() {
  const query = document.getElementById("cityInput").value;

  if (query.length < 2) {
    document.getElementById("suggestions").innerHTML = "";
    return;
  }

  try {
    const res = await fetch(`/get-suggestions?q=${query}`);
    const data = await res.json();

    const box = document.getElementById("suggestions");
    box.innerHTML = "";

    data.forEach(city => {
      const item = document.createElement("div");
      item.innerText = `${city.name}, ${city.country}`;

      item.onclick = () => {
        document.getElementById("cityInput").value = city.name;
        box.innerHTML = "";
        getWeather();
      };

      box.appendChild(item);
    });

  } catch (err) {
    console.error(err);
  }
}




window.onload = loadSavedCities;