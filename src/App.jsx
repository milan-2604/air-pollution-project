import { useEffect, useState } from "react";
import "./App.css";

function App() {
  //importing api key and endpoints
  const GEOCODING_API = import.meta.env.VITE_GEOCODING_API;
  const AIR_POLLUTION_API = import.meta.env.VITE_AIR_POLLUTION_API;
  const API_KEY = import.meta.env.VITE_API_KEY;
  const [cityName, setCityName] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [GeoCodeData, setGeoCodeData] = useState([]);
  const [AirPollutionData, setAirPollutionData] = useState([]);

  const searchData = () => {
    const city = cityName.trim();
    const state = stateCode.trim();
    const country = countryCode.trim();
    if (!city || !state || !country) return;
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${GEOCODING_API}?q=${city},${state},${country}&limit=1&appid=${API_KEY}`
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setGeoCodeData(data);

        //checking if data is present
        if (!data[0]) {
          console.log("Data doesnt exist");
          return;
        }
        //accessing lat and lon form fetched GeoCodeData
        const lat = data[0]?.lat;
        const lon = data[0]?.lon;

        if (lat && lon) {
          const airResponse = await fetch(
            `${AIR_POLLUTION_API}?lat=${lat}&lon=${lon}&appid=${API_KEY}`
          );
          if (!airResponse.ok)
            throw new Error(`HTTP error! status: ${airResponse.status}`);
          const data = await airResponse.json();
          setAirPollutionData(data);
        }
      } catch (error) {
        console.log(`Unable to fetch data ${error.message}`);
      }
    };
    fetchData();
  };
console.log(GeoCodeData)
console.log("------------------------");
console.log(AirPollutionData)
  return (
    <>
      <input
        type="text"
        value={cityName}
        placeholder="City Name"
        onChange={(e) => setCityName(e.target.value)}
      />
      <input
        type="text"
        value={stateCode}
        placeholder="State Code"
        onChange={(e) => setStateCode(e.target.value)}
      />
      <input
        type="text"
        value={countryCode}
        placeholder="Country Code"
        onChange={(e) => setCountryCode(e.target.value)}
      />
      <button onClick={() => searchData()}>Search</button>
    </>
  );
}

export default App;
