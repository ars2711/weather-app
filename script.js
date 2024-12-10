// Get references to HTML elements
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const cityName = document.querySelector(".city-name");
const temperature = document.querySelector(".temperature");
const condition = document.querySelector(".condition");
const detailedWeather = document.querySelector(".detailed-weather");
const loadingSpinner = document.getElementById("loading-spinner");
const darkModeToggle = document.getElementById("dark-mode-toggle");
const forecastContainer = document.querySelector(".forecast-container"); // Moved to global scope

// Additional Info Containers
const co2Content = document.getElementById("co2-content-value");
const pollenLevel = document.getElementById("pollen-level-value");
const drivingVisibility = document.getElementById("driving-visibility-value");
const pollutionSources = document.getElementById("pollution-sources-value");
const aqiTips = document.getElementById("aqi-tips-value");
const vulnerableGroups = document.getElementById("vulnerable-groups-value");
const uvIndex = document.getElementById("uv-index-value");
const indoorDevices = document.getElementById("indoor-devices-value");

// API Key and Base URL
const API_KEY = "f77e06ada86444dfa55185221240912"; // Replace with your WeatherAPI key
const BASE_URL = "https://api.weatherapi.com/v1/forecast.json"; // Updated endpoint to fetch forecast

// Function to fetch weather and air quality data
async function fetchWeather(city) {
	try {
		loadingSpinner.classList.remove("hidden"); // Show loading spinner
		const response = await fetch(
			`${BASE_URL}?key=${API_KEY}&q=${city}&days=7&aqi=yes`
		);
		if (!response.ok) throw new Error("City not found!");
		const data = await response.json();

		// Update the weather details on the page
		updateWeatherDetails(data);
	} catch (error) {
		alert(error.message);
	} finally {
		loadingSpinner.classList.add("hidden"); // Hide loading spinner
	}
}

// Function to update the weather and air quality details in the DOM
function updateWeatherDetails(data) {
	const { location, current, forecast } = data;
	const {
		temp_c,
		condition: weatherCondition,
		humidity,
		wind_kph,
		pressure_mb,
		uv,
		air_quality,
	} = current;

	// Update basic weather information
	cityName.textContent = location.name || "City Name";
	temperature.textContent = `${Math.round(temp_c)}°C`;
	condition.textContent = weatherCondition.text;
	document.getElementById(
		"weather-icon"
	).src = `https:${weatherCondition.icon}`;

	// Update detailed weather
	detailedWeather.innerHTML = `
    <p>Humidity: ${humidity}%</p>
    <p>Wind Speed: ${wind_kph} km/h</p>
    <p>Pressure: ${pressure_mb} hPa</p>
    <p>UV Index: ${uv}</p>
  `;

	// Update air quality details
	if (air_quality) {
		const { co, pm10, us_epa_index } = air_quality;

		co2Content.textContent = `${co.toFixed(2)} µg/m³ (CO)`;
		pollenLevel.textContent = `${pm10.toFixed(2)} µg/m³ (PM10)`; // Placeholder
		drivingVisibility.textContent = "Good"; // Placeholder
		pollutionSources.textContent = "Vehicles, factories"; // Example
		aqiTips.textContent = getAQITips(us_epa_index);
		vulnerableGroups.textContent = getVulnerableGroups(us_epa_index);
		uvIndex.textContent = uv || "--";
		indoorDevices.textContent = "Air purifiers, dehumidifiers.";
	}

	// Update 7-day forecast
	const forecastContainer = document.querySelector(".forecast-container");
	forecastContainer.innerHTML = ""; // Clear previous forecast
	forecast.forecastday.forEach((day) => {
		const forecastDay = document.createElement("div");
		forecastDay.className = "forecast-day";
		forecastDay.innerHTML = `
        <p>${new Date(day.date).toLocaleDateString("en-US", {
					weekday: "short",
				})}</p>
        <img src="https:${day.day.condition.icon}" alt="${
			day.day.condition.text
		}" />
        <p>${Math.round(day.day.maxtemp_c)}°C / ${Math.round(
			day.day.mintemp_c
		)}°C</p>
      `;
		forecastContainer.appendChild(forecastDay);
	});

	// Change background based on weather condition
	const conditionText = weatherCondition.text.toLowerCase();
	document.body.className = ""; // Reset background classes
	if (conditionText.includes("clear") || conditionText.includes("sunny")) {
		document.body.classList.add("sunny");
	} else if (conditionText.includes("rain")) {
		document.body.classList.add("rainy");
	} else if (conditionText.includes("cloud")) {
		document.body.classList.add("cloudy");
	} else if (conditionText.includes("night")) {
		document.body.classList.add("night");
	}
}

// Function to get AQI tips based on EPA index
function getAQITips(index) {
	switch (index) {
		case 1:
			return "Air quality is good. No precautions needed.";
		case 2:
			return "Moderate air quality. Sensitive groups should limit outdoor activities.";
		case 3:
			return "Unhealthy for sensitive groups. Consider wearing a mask outdoors.";
		case 4:
			return "Unhealthy. Limit outdoor exposure.";
		case 5:
			return "Very unhealthy. Avoid going outside if possible.";
		case 6:
			return "Hazardous. Stay indoors with air filtration.";
		default:
			return "No data available.";
	}
}

// Function to get vulnerable groups based on EPA index
function getVulnerableGroups(index) {
	switch (index) {
		case 1:
			return "None. Air quality is good.";
		case 2:
		case 3:
			return "Elderly, children, and people with respiratory conditions.";
		case 4:
		case 5:
		case 6:
			return "Everyone, especially those with pre-existing health conditions.";
		default:
			return "No data available.";
	}
}

// Event listener for search button
searchBtn.addEventListener("click", () => {
	const city = searchInput.value.trim();
	if (city) {
		fetchWeather(city);
	} else {
		alert("Please enter a city name.");
	}
});

// Event listener for Enter key in the search input
searchInput.addEventListener("keydown", (e) => {
	if (e.key === "Enter") {
		const city = searchInput.value.trim();
		if (city) {
			fetchWeather(city);
		} else {
			alert("Please enter a city name.");
		}
	}
});

// Dark Mode Toggle
darkModeToggle.addEventListener("click", () => {
	document.body.classList.toggle("dark-mode");
});
