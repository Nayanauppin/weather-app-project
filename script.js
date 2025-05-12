const dataContainer = document.getElementById('data-container');
const cityInput = document.getElementById('city-input');
const fetchButton = document.getElementById('fetch-button');
const weatherBackground = document.getElementById('weather-background'); // Get the background div
const apiKey = 'bbc4760445206b3f82e27bc6e5ca8e1e'; // Replace with your actual API key
const dateDisplay = document.getElementById('date');
const timeDisplay = document.getElementById('time');
const dayDisplay = document.getElementById('day');

async function fetchData(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            let errorMessage = `Failed to load weather data for "${city}". `;
            if (response.status === 401) {
                errorMessage += 'Invalid API key. Please check your key.';
            } else if (response.status === 404) {
                errorMessage += 'City not found. Please check the city name.';
            } else if (response.status >= 500) {
                errorMessage += 'Server error while fetching data. Please try again later.';
            } else {
                errorMessage += `HTTP error! status: ${response.status}`;
            }
            throw new Error(errorMessage);
        }
        const data = await response.json();
        console.log("API Response Data:", data); // Check the entire API response
        displayWeatherData(data);
    } catch (error) {
        console.error('Error fetching data:', error.message);
        dataContainer.innerHTML = `
${error.message}

`;
    }
}

function updateBackgroundAndGif(iconCode, weatherMain, isDaytime) {
    document.body.className = ''; // Reset body classes
    document.querySelectorAll('.cloud, .raindrop, .sun').forEach(el => el.remove());
    weatherBackground.style.backgroundImage = ''; // Clear any previous background image
    const lowerCaseWeatherMain = weatherMain.toLowerCase();
    let gifPath = '';
    const timeOfDay = isDaytime ? 'day' : 'night';
    if (lowerCaseWeatherMain === 'clear') {
        gifPath = `assets/clear_sky_${timeOfDay}.gif`;
    } else if (lowerCaseWeatherMain.includes('haze') || lowerCaseWeatherMain.includes('mist') || lowerCaseWeatherMain.includes('fog')) {
        gifPath = `assets/haze_${timeOfDay}.gif`;
    } else if (lowerCaseWeatherMain.includes('thunderstorm')) {
        gifPath = 'assets/stormy.gif';
    } else if (lowerCaseWeatherMain === 'clouds') {
        gifPath = `assets/cloudy_${timeOfDay}.gif`;
    } else if (lowerCaseWeatherMain.includes('rain')) {
        gifPath = `assets/rainy_${timeOfDay}.gif`;
    } else if (lowerCaseWeatherMain === 'snow') {
        gifPath = `assets/snow_${timeOfDay}.gif`;
    } else if (iconCode.startsWith('01') && lowerCaseWeatherMain !== 'clear') { // Sunny condition
        gifPath = `assets/Sunny.gif`;
    } else {
        gifPath = `assets/default_${timeOfDay}.gif`;
    }
    weatherBackground.style.backgroundImage = `url('${gifPath}')`;
}

function displayWeatherData(data) {
    dataContainer.innerHTML = '';
    const cityName = document.createElement('h2');
    cityName.textContent = data.name;
    const temperature = document.createElement('p');
    temperature.textContent = `Temperature: ${data.main.temp}°C`;
    const description = document.createElement('p');
    description.textContent = `Weather: ${data.weather[0].description}`;
    const humidity = document.createElement('p');
    humidity.textContent = `Humidity: ${data.main.humidity}%`;
    const windSpeed = document.createElement('p');
    windSpeed.textContent = `Wind Speed: ${data.wind.speed} m/s`;
    const weatherIconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${weatherIconCode}@2x.png`;
    const weatherIcon = document.createElement('img');
    weatherIcon.src = iconUrl;
    weatherIcon.alt = data.weather[0].description;
    dataContainer.appendChild(cityName);
    dataContainer.appendChild(temperature);
    dataContainer.appendChild(description);
    dataContainer.appendChild(humidity);
    dataContainer.appendChild(windSpeed);
    dataContainer.appendChild(weatherIcon);
    // Handle Date, Time, and Day for the entered city using the timezone offset
    const nowUTC = new Date();
    const cityTimezoneOffsetSeconds = data.timezone;
    const cityTime = new Date(nowUTC.getTime() + (cityTimezoneOffsetSeconds * 1000));
    console.log("UTC Time:", nowUTC);
    console.log("Timezone Offset (seconds):", cityTimezoneOffsetSeconds);
    console.log("Calculated City Time:", cityTime);

    const offsetHours = cityTimezoneOffsetSeconds / 3600;
    const offsetString = (offsetHours > 0 ? '+' : '') + offsetHours;
    const timezoneAttempt = `Etc/GMT${offsetString}`; // Attempt to construct a timezone name

    const optionsDate = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
    const optionsTime = { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true, timeZone: 'UTC' };
    const optionsDay = { weekday: 'long', timeZone: 'UTC' };

    dateDisplay.textContent = new Intl.DateTimeFormat(undefined, optionsDate).format(cityTime);
    timeDisplay.textContent = new Intl.DateTimeFormat(undefined, optionsTime).format(cityTime);
    dayDisplay.textContent = new Intl.DateTimeFormat(undefined, optionsDay).format(cityTime);

    // Determine Day or Night based on sunrise/sunset in the fetched city
    const sunriseUTC = new Date(data.sys.sunrise * 1000);
    const sunsetUTC = new Date(data.sys.sunset * 1000);
    const sunriseCityTime = new Date(sunriseUTC.getTime() + (cityTimezoneOffsetSeconds * 1000));
    const sunsetCityTime = new Date(sunsetUTC.getTime() + (cityTimezoneOffsetSeconds * 1000));
    const isDaytime = cityTime > sunriseCityTime && cityTime < sunsetCityTime;
    console.log("Sunrise (City Time):", sunriseCityTime);
    console.log("Sunset (City Time):", sunsetCityTime);
    console.log("Is daytime:", isDaytime);
    updateBackgroundAndGif(weatherIconCode, data.weather[0].main, isDaytime);
}

// Event listener
fetchButton.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        dataContainer.innerHTML = 'Loading weather data...';
        fetchData(city);
    } else {
        dataContainer.innerHTML = 'Please enter a city name.';
    }
});

// Initial display of current date, time, and day (optional, updates on fetch)
function updateDateTimeDisplay() {
    const now = new Date();
    const optionsDateInitial = { year: 'numeric', month: 'long', day: 'numeric' };
    const optionsTimeInitial = { hour: 'numeric', minute: '2-digit', second: '2-digit' };
    const optionsDayInitial = { weekday: 'long' };
    if (dateDisplay) dateDisplay.textContent = now.toLocaleDateString(undefined, optionsDateInitial);
    if (timeDisplay) timeDisplay.textContent = now.toLocaleTimeString(undefined, optionsTimeInitial);
    if (dayDisplay) dayDisplay.textContent = now.toLocaleDateString(undefined, optionsDayInitial);
}

// Call this function to display the initial date and time
updateDateTimeDisplay();