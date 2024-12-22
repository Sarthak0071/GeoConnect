



// import React, { useEffect, useState } from "react";
// import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

// const Home = () => {
//   const [currentLocation, setCurrentLocation] = useState(null);
//   const [mainCity, setMainCity] = useState("Fetching location...");
//   const [touristPlaces, setTouristPlaces] = useState([]);
//   const [selectedPlace, setSelectedPlace] = useState(null);

//   const { isLoaded } = useJsApiLoader({
//     googleMapsApiKey: "AIzaSyDIZ4wZgZyI7Zxbb4DPwnvDmQ6JFMyVum4", // Replace with your actual Maps API key
//   });

//   const fetchIPLocation = async () => {
//     try {
//       const response = await fetch("https://ipapi.co/json/");
//       const data = await response.json();
//       const { latitude, longitude } = data;
//       setCurrentLocation({ lat: parseFloat(latitude), lng: parseFloat(longitude) });
//       reverseGeocode(latitude, longitude);
//       fetchTouristPlacesFromServer(latitude, longitude);
//     } catch (err) {
//       console.error("Error fetching IP-based location: ", err);
//     }
//   };

//   const fetchTouristPlacesFromServer = async (lat, lng) => {
//     try {
//       const response = await fetch(`http://localhost:5000/api/genai-places?lat=${lat}&lng=${lng}`);
//       const data = await response.json();

//       if (data.places) {
//         const updatedPlaces = data.places.map((name, index) => ({
//           name,
//           location: null,
//           index,
//         }));
//         setTouristPlaces(updatedPlaces);

//         const geocodedPlaces = await Promise.all(
//           updatedPlaces.map(async (place) => {
//             try {
//               const response = await fetch(
//                 `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
//                   place.name
//                 )}&key=AIzaSyDIZ4wZgZyI7Zxbb4DPwnvDmQ6JFMyVum4`
//               );
//               const data = await response.json();
//               const location = data.results[0]?.geometry.location || null;
//               return { ...place, location };
//             } catch (err) {
//               console.error("Error geocoding place:", place.name, err);
//               return { ...place, location: null };
//             }
//           })
//         );

//         setTouristPlaces(geocodedPlaces);
//       } else {
//         console.error("No places returned by the server");
//       }
//     } catch (err) {
//       console.error("Error fetching tourist places from the server: ", err);
//     }
//   };

//   const reverseGeocode = async (lat, lng) => {
//     try {
//       const response = await fetch(
//         `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyDIZ4wZgZyI7Zxbb4DPwnvDmQ6JFMyVum4`
//       );
//       const data = await response.json();
//       const city = data.results.find((result) =>
//         result.types.includes("locality")
//       )?.address_components[0]?.long_name;
//       setMainCity(city || "Unknown");
//     } catch (err) {
//       console.error("Error reverse geocoding location: ", err);
//       setMainCity("Unknown");
//     }
//   };

//   useEffect(() => {
//     const fetchGeolocation = () => {
//       if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(
//           (position) => {
//             const { latitude, longitude } = position.coords;
//             setCurrentLocation({ lat: latitude, lng: longitude });
//             reverseGeocode(latitude, longitude);
//             fetchTouristPlacesFromServer(latitude, longitude);
//           },
//           (error) => {
//             console.warn("Geolocation failed, falling back to IP location:", error);
//             fetchIPLocation();
//           }
//         );
//       } else {
//         console.warn("Geolocation is not available, falling back to IP location.");
//         fetchIPLocation();
//       }
//     };

//     fetchGeolocation();
//   }, []);

//   if (!isLoaded) return <div>Loading Map...</div>;

//   return (
//     <div>
//       <h1>Welcome to the Tourism Map</h1>
//       <div>
//         <h3>Current Location: {mainCity}</h3>
//       </div>
//       <div style={{ height: "500px", width: "100%" }}>
//         <GoogleMap
//           center={selectedPlace?.location || currentLocation || { lat: 0, lng: 0 }}
//           zoom={selectedPlace ? 20 : currentLocation ? 12 : 2}
//           mapContainerStyle={{ height: "100%", width: "100%" }}
//           mapTypeId={selectedPlace ? "satellite" : "roadmap"}
//         >
//           {currentLocation && <Marker position={currentLocation} />}
//           {touristPlaces.map(
//             (place) =>
//               place.location && (
//                 <Marker
//                   key={place.index}
//                   position={place.location}
//                   title={place.name}
//                 />
//               )
//           )}
//         </GoogleMap>
//       </div>
//       <div>
//         <h2>Famous Tourist Places</h2>
//         <ul>
//           {touristPlaces.map((place, index) => (
//             <li key={index}>
//               {place.name}{" "}
//               {place.location && (
//                 <>
//                   <button
//                     onClick={() => setSelectedPlace(place)}
//                   >
//                     Show on Map
//                   </button>
//                   <a
//                     href={`https://www.google.com/maps/dir/?api=1&destination=${place.location.lat},${place.location.lng}`}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                   >
//                     Navigate
//                   </a>
//                 </>
//               )}
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default Home;






import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const Home = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mainCity, setMainCity] = useState("Fetching location...");
  const [touristPlaces, setTouristPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [newLocation, setNewLocation] = useState("");
  const [isChangingLocation, setIsChangingLocation] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyDIZ4wZgZyI7Zxbb4DPwnvDmQ6JFMyVum4", // Replace with your actual Maps API key
  });

  const fetchIPLocation = async () => {
    try {
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();
      const { latitude, longitude } = data;
      setCurrentLocation({ lat: parseFloat(latitude), lng: parseFloat(longitude) });
      reverseGeocode(latitude, longitude);
      fetchTouristPlacesFromServer(latitude, longitude);
    } catch (err) {
      console.error("Error fetching IP-based location: ", err);
    }
  };

  const fetchTouristPlacesFromServer = async (lat, lng) => {
    try {
      const response = await fetch(`http://localhost:5000/api/genai-places?lat=${lat}&lng=${lng}`);
      const data = await response.json();

      if (data.places) {
        const updatedPlaces = data.places.map((name, index) => ({
          name,
          location: null,
          index,
        }));
        setTouristPlaces(updatedPlaces);

        const geocodedPlaces = await Promise.all(
          updatedPlaces.map(async (place) => {
            try {
              const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
                  place.name
                )}&key=AIzaSyDIZ4wZgZyI7Zxbb4DPwnvDmQ6JFMyVum4`
              );
              const data = await response.json();
              const location = data.results[0]?.geometry.location || null;
              return { ...place, location };
            } catch (err) {
              console.error("Error geocoding place:", place.name, err);
              return { ...place, location: null };
            }
          })
        );

        setTouristPlaces(geocodedPlaces);
      } else {
        console.error("No places returned by the server");
      }
    } catch (err) {
      console.error("Error fetching tourist places from the server: ", err);
    }
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyDIZ4wZgZyI7Zxbb4DPwnvDmQ6JFMyVum4`
      );
      const data = await response.json();
      const city = data.results.find((result) =>
        result.types.includes("locality")
      )?.address_components[0]?.long_name;
      setMainCity(city || "Unknown");
    } catch (err) {
      console.error("Error reverse geocoding location: ", err);
      setMainCity("Unknown");
    }
  };

  const updateLocation = async () => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          newLocation
        )}&key=AIzaSyDIZ4wZgZyI7Zxbb4DPwnvDmQ6JFMyVum4`
      );
      const data = await response.json();
      const location = data.results[0]?.geometry.location;
      if (location) {
        setCurrentLocation({ lat: location.lat, lng: location.lng });
        reverseGeocode(location.lat, location.lng);
        fetchTouristPlacesFromServer(location.lat, location.lng);
        setIsChangingLocation(false);
        setNewLocation("");
      } else {
        alert("Location not found. Please try again.");
      }
    } catch (err) {
      console.error("Error updating location: ", err);
      alert("Error updating location.");
    }
  };

  useEffect(() => {
    const fetchGeolocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setCurrentLocation({ lat: latitude, lng: longitude });
            reverseGeocode(latitude, longitude);
            fetchTouristPlacesFromServer(latitude, longitude);
          },
          (error) => {
            console.warn("Geolocation failed, falling back to IP location:", error);
            fetchIPLocation();
          }
        );
      } else {
        console.warn("Geolocation is not available, falling back to IP location.");
        fetchIPLocation();
      }
    };

    fetchGeolocation();
  }, []);

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <div>
      <h1>Welcome to the Tourism Map</h1>
      <div>
        <h3>Current Location: {mainCity}</h3>
        <button onClick={() => setIsChangingLocation(true)}>Change Location</button>
      </div>
      {isChangingLocation && (
        <div>
          <input
            type="text"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            placeholder="Enter a new location"
          />
          <button onClick={updateLocation}>Update Location</button>
          <button onClick={() => setIsChangingLocation(false)}>Cancel</button>
        </div>
      )}
      <div style={{ height: "500px", width: "100%" }}>
        <GoogleMap
          center={selectedPlace?.location || currentLocation || { lat: 0, lng: 0 }}
          zoom={selectedPlace ? 20 : currentLocation ? 12 : 2}
          mapContainerStyle={{ height: "100%", width: "100%" }}
          mapTypeId={selectedPlace ? "satellite" : "roadmap"}
        >
          {currentLocation && <Marker position={currentLocation} />}
          {touristPlaces.map(
            (place) =>
              place.location && (
                <Marker
                  key={place.index}
                  position={place.location}
                  title={place.name}
                />
              )
          )}
        </GoogleMap>
      </div>
      <div>
        <h2>Famous Tourist Places</h2>
        <ul>
          {touristPlaces.map((place, index) => (
            <li key={index}>
              {place.name}{" "}
              {place.location && (
                <>
                  <button
                    onClick={() => setSelectedPlace(place)}
                  >
                    Show on Map
                  </button>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${place.location.lat},${place.location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Navigate
                  </a>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Home;
