import { useRef, useState } from "react";
import "./App.css";

function App() {
  //importing api key and endpoints
  const GEOCODING_API = import.meta.env.VITE_GEOCODING_API;
  const AIR_POLLUTION_API = import.meta.env.VITE_AIR_POLLUTION_API;
  const API_KEY = import.meta.env.VITE_API_KEY;
  const [cityName, setCityName] = useState("");
  const [geoCodeData, setGeoCodeData] = useState([]);
  const [airPollutionData, setAirPollutionData] = useState([]);
  const cache = useRef({})
  const searchData = () => {
    const city = cityName.trim();
    if (!city) return;
    if (cache.current[city]){
      setGeoCodeData(cache.current[city]);
      console.log('This is cached data',geoCodeData)
    } 
    else {
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
        } catch (error) {
          console.log(`Unable to fetch data ${error.message}`);
        }
      };
       fetchData();
    }
  };
  //checking if data is present
  // if (!data[0]) {
  //   setAirPollutionData([]);
  //   console.log("Data doesnt exist");
  //   return;
  // }

  // if (lat && lon) {
  //   const airResponse = await fetch(
  //     `${AIR_POLLUTION_API}?lat=${lat}&lon=${lon}&appid=${API_KEY}`
  //   );
  //   if (!airResponse.ok)
  //     throw new Error(`HTTP error! status: ${airResponse.status}`);
  //   const data = await airResponse.json();
  //   setAirPollutionData(data);
  //   console.log("airpollutiondata: ",data)
  // }

  return (
    <>
      <input
        type="text"
        value={cityName}
        placeholder="City Name"
        onChange={(e) => setCityName(e.target.value)}
      />
      <button onClick={() => searchData()}>Search</button>
    </>
  );
}

export default App;
