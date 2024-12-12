// Get references to HTML elements
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const cityName = document.querySelector(".city-name");
const temperature = document.querySelector(".temperature");
const condition = document.querySelector(".condition");
const detailedWeather = document.querySelector(".detailed-weather");
const loadingSpinner = document.getElementById("loading-spinner");
const darkModeToggle = document.getElementById("dark-mode-toggle");
const body = document.body;
const forecastContainer = document.querySelector(".forecast-container"); // Moved to global scope
const weatherIcon = document.getElementById("weather-icon");

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

	// If the current weather condition data is missing
	if (!current || !current.condition) {
		console.error("Error: Missing current weather data or condition.");
		return; // Exit if required data is missing
	}

	const {
		temp_c,
		condition, // directly destructuring 'condition' from 'current'
		humidity,
		wind_kph,
		pressure_mb,
		uv,
		air_quality,
	} = current;

	// Ensure the elements are selected before using
	const conditionText = document.querySelector(".condition");
	conditionText.textContent = condition.text || "No condition info"; // Safeguard

	// Update basic weather information
	cityName.textContent = location.name || "City Name";
	temperature.textContent = `${Math.round(temp_c)}°C`;

	// Set the weather icon
	document.getElementById("weather-icon").src = `https:${condition.icon}`;

	// Update detailed weather
	detailedWeather.innerHTML = `
    <p>Humidity: ${humidity}%</p>
    <p>Wind Speed: ${wind_kph} km/h</p>
    <p>Pressure: ${pressure_mb} hPa</p>
    <p>UV Index: ${uv}</p>
  `;

	// Update air quality details if available
	if (air_quality) {
		const { co, pm10, us_epa_index } = air_quality;

		// CO2 Content
		co2Content.textContent = co ? `${co.toFixed(2)} µg/m³ (CO)` : "--";

		// Pollen Level (PM10)
		pollenLevel.textContent = pm10 ? `${pm10.toFixed(2)} µg/m³ (PM10)` : "--";

		// Driving Visibility (just an example, modify based on real data)
		drivingVisibility.textContent = air_quality.pm10 ? "Good" : "--";

		// Pollution Sources (example, modify based on real data)
		pollutionSources.textContent = "Vehicles, factories";

		// AQI Level
		const aqiLevel = us_epa_index || "--"; // EPA index
		const aqiLevelCard = document.querySelector("#aqi-level"); // Create or select AQI card
		aqiLevelCard.innerHTML = `
            ${aqiLevel}
        `;

		// AQI Improvement Tips
		aqiTips.textContent = getAQITips(aqiLevel);

		// Vulnerable Groups
		vulnerableGroups.textContent = getVulnerableGroups(us_epa_index);

		// UV Index (already updated above)
		uvIndex.textContent = uv || "--";

		// Devices for Indoor Air Quality
		indoorDevices.textContent = "Air purifiers, dehumidifiers.";
	} else {
		// In case air_quality data is missing, use default values
		co2Content.textContent = "--";
		pollenLevel.textContent = "--";
		drivingVisibility.textContent = "--";
		pollutionSources.textContent = "--";
		aqiTips.textContent = "--";
		vulnerableGroups.textContent = "--";
		uvIndex.textContent = "--";
		indoorDevices.textContent = "--";
	}

	// Update 7-day forecast
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
	const conditionTextLower = condition.text.toLowerCase();
	document.body.className = ""; // Reset background classes
	if (conditionTextLower.includes("sunny")) {
		document.body.classList.add("sunny");
	} else if (conditionTextLower.includes("rain")) {
		document.body.classList.add("rainy");
	} else if (conditionTextLower.includes("cloud")) {
		document.body.classList.add("cloudy");
	} else if (conditionTextLower.includes("clear")) {
		document.body.classList.add("night");
	}
}

// Function to get AQI tips based on EPA index
function getAQITips(index) {
	switch (index) {
		case 1:
			return "Air quality is good. Consider walking or cycling instead of driving.";
		case 2:
			return "Moderate air quality. Use public transport or carpool to reduce pollution.";
		case 3:
			return "Unhealthy for sensitive groups. Avoid prolonged outdoor exposure.";
		case 4:
			return "Unhealthy. Limit outdoor activities and use air purifiers indoors.";
		case 5:
			return "Very unhealthy. Avoid going outside and keep windows closed.";
		case 6:
			return "Hazardous. Stay indoors with air filtration systems.";
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
	if (body.classList.contains("dark-mode")) {
		darkModeToggle.textContent = "🌞"; // Sun icon for light mode
	} else {
		darkModeToggle.textContent = "🌙"; // Moon icon for dark mode
	}
});
if (!data.location) {
	throw new Error("City not found or API error.");
}
if (!data.current) {
	throw new Error("Current weather data is unavailable.");
}
if (!data.forecast) {
	throw new Error("Forecast data is missing.");
}
if (!forecast.forecastday || forecast.forecastday.length === 0) {
	forecastContainer.innerHTML = "<p>No forecast data available.</p>";
}

/*
 *    ___________________________
 *   |                           |
 *   |            /-\            |
 *   |           /   \           |
 *   |          /__A__\          |
 *   |       Arsalan Afzal       |
 *   |                           |
 *   |___________________________|
 *          |_____________|
 */
