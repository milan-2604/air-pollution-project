import { useRef, useState } from "react";
import "./App.css";
import AqiGauge from "./components/AqiGauge";
import { calculateUS_AQI } from "./utils/aqi.js";

function App() {
  const GEOCODING_API = import.meta.env.VITE_GEOCODING_API;
  const AIR_POLLUTION_API = import.meta.env.VITE_AIR_POLLUTION_API;
  const API_KEY = import.meta.env.VITE_API_KEY;

  const [searchInput, setSearchInput] = useState(""); // Raw input text
  const [selectedCity, setSelectedCity] = useState(""); // Formatted name for display

  const [geoCodeData, setGeoCodeData] = useState([]);
  const [airPollutionData, setAirPollutionData] = useState(null); // Changed to null initial

  const cache = useRef({});

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [usAQI, setUsAQI] = useState(null);

  // 1. Search for City (Geocoding)
  const searchCity = async () => {
    const city = searchInput.trim().toLowerCase();
    if (!city) return;

    // Reset previous results
    setAirPollutionData(null);
    setUsAQI(null);
    setError(null);
    setLoading(true);
    setShowSuggestions(false);

    if (cache.current[city]) {
      setGeoCodeData(cache.current[city]);
      setLoading(false);
      setShowSuggestions(true);
    } else {
      try {
        const response = await fetch(
          `${GEOCODING_API}?q=${city}&limit=5&appid=${API_KEY}`
        );
        if (!response.ok) throw new Error("Network response was not ok");
        
        const data = await response.json();
        cache.current[city] = data;
        setGeoCodeData(data);
        setShowSuggestions(true);
      } catch (err) {
        setError("Failed to fetch location data. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  // 2. Select City & Fetch Air Data
  const handleCitySelect = (index) => {
    const selected = geoCodeData[index];
    const { lat, lon, name, state, country } = selected;
    
    // Set a pretty display name
    const displayName = `${name}${state ? `, ${state}` : ""}, ${country}`;
    setSelectedCity(displayName);
    setShowSuggestions(false);
    setLoading(true);

    const fetchAirData = async () => {
      try {
        const response = await fetch(
          `${AIR_POLLUTION_API}?lat=${lat}&lon=${lon}&appid=${API_KEY}`
        );
        if (!response.ok) throw new Error("Failed to fetch air quality data");
        
        const data = await response.json();

        if (data.list && data.list.length > 0) {
          const air = data.list[0];
          setAirPollutionData(air);
          const calculatedAQI = calculateUS_AQI(air.components);
          setUsAQI(calculatedAQI);
        }
      } catch (err) {
        setError("Unable to retrieve air quality data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAirData();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") searchCity();
  };

  return (
    <div className="app-container">
      <div className="search-section">
        <h1 className="app-title">Air Quality Index Tracker</h1>
        
        <div className="search-box">
          <input
            type="text"
            className="search-input"
            value={searchInput}
            placeholder="Enter city name (e.g. Tokyo, London)"
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button 
            className="search-button" 
            onClick={searchCity}
            disabled={loading}
          >
            {loading ? <span className="loader"></span> : "Search"}
          </button>
        </div>

        {/* Suggestion Dropdown */}
        {showSuggestions && !loading && (
          <ul className="suggestion-list">
            {geoCodeData.length > 0 ? (
              geoCodeData.map((el, i) => (
                <li
                  key={`${el.name}-${el.lat}-${el.lon}`}
                  className="suggestion-item"
                  onClick={() => handleCitySelect(i)}
                >
                  <span className="city-name">
                    {el.name}, {el.state ? `${el.state}, ` : ""}{el.country}
                  </span>
                  <span className="coords">
                    ({el.lat.toFixed(2)}, {el.lon.toFixed(2)})
                  </span>
                </li>
              ))
            ) : (
              <li className="no-result">
                <div className="no-result-icon">📍</div>
                <div className="no-result-text">
                  <strong>City not found</strong>
                  <span>Please check spelling or try another location.</span>
                </div>
              </li>
            )}
          </ul>
        )}
        
        {error && <div className="error-message">{error}</div>}
      </div>

      {/* Main Content Area */}
      <div className="result-section">
        {usAQI !== null && airPollutionData && (
          <div className="fade-in">
            <AqiGauge 
              value={usAQI} 
              components={airPollutionData.components} 
              locationName={selectedCity || searchInput} 
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;