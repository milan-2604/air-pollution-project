import { useRef, useState } from "react";
import "./App.css";
import AqiGauge from "./components/AqiGauge";
import {calculateUS_AQI} from "./utils/aqi.js"



function App() {
  //importing api key and endpoints
  const GEOCODING_API = import.meta.env.VITE_GEOCODING_API;
  const AIR_POLLUTION_API = import.meta.env.VITE_AIR_POLLUTION_API;
  const API_KEY = import.meta.env.VITE_API_KEY;

  const [cityName, setCityName] = useState(""); //Entered city

  const [geoCodeData, setGeoCodeData] = useState([]); //would store country to lat-lon data
  const [airPollutionData, setAirPollutionData] = useState([]); //would contain main info about aqi and other components

  const cache = useRef({}); //caching geoCodeData to avoid repeated api req

  const [doSuggest, setDoSuggest] = useState(false);
  const [loading, setLoading] = useState(false);

  const [usAQI, setUsAQI] = useState(null);

  //calling for country to lat-lon data
  const searchData = () => {
    const city = cityName.trim().toLowerCase();
    if (!city) return;

    setGeoCodeData([]);
    setAirPollutionData([]);
    setLoading(true);

    if (cache.current[city]) {
      setGeoCodeData(cache.current[city]);
      setLoading(false);
      setDoSuggest(true);
      console.log("This is cached data", cache.current[city]);
    } else {
      const fetchData = async () => {
        try {
          const response = await fetch(
            `${GEOCODING_API}?q=${city}&limit=5&appid=${API_KEY}`
          );
          if (!response.ok)
            throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();
          cache.current[city] = data;
          setGeoCodeData(data);
          console.log("geocodedata: ", data);
          setLoading(false);
          setDoSuggest(true);
        } catch (error) {
          console.log(`Unable to fetch data ${error.message}`);
          setLoading(false);
        }
      };
      fetchData();
    }
  };

  //calling Main data which contains aqi and other air components
  const fetchAirData = (i) => {
    setDoSuggest(false);
    setLoading(true);

    const lat = geoCodeData[i]?.lat;
    const lon = geoCodeData[i]?.lon;

    if (lat && lon) {
      const airData = async () => {
        try {
          const response = await fetch(
            `${AIR_POLLUTION_API}?lat=${lat}&lon=${lon}&appid=${API_KEY}`
          );
          if (!response.ok)
            throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();

          if (data.list && data.list.length > 0) {
            const air = data.list[0];
            setAirPollutionData(air);

            
            const calculatedAQI = calculateUS_AQI(air.components);
            setUsAQI(calculatedAQI);
            setLoading(false);
          }

          console.log("airpollutiondata: ", data);
        } catch (error) {
          console.log("Unable to fetch air data", error.message);
          setLoading(false);
        }
      };
      airData();
    }
  };

  return (
    <>
      <input
        type="text"
        value={cityName}
        placeholder="City Name"
        onChange={(e) => setCityName(e.target.value)}
      />
      <button onClick={() => searchData()}>Search</button>
      {loading && <p>Loading...</p>}
      {doSuggest && (
        <ul>
          {geoCodeData.map((el, i) => (
            <li
              key={`${el.name}-${el.lat}-${el.lon}`}
              style={{ cursor: "pointer" }}
              onClick={() => fetchAirData(i)}
            >
              {el.name}, {el.state}, {el.country} ({el.lat.toFixed(2)},{" "}
              {el.lon.toFixed(2)})
            </li>
          ))}
        </ul>
      )}
      {usAQI !== null && <AqiGauge value={usAQI} />}
    </>
  );
}

export default App;
