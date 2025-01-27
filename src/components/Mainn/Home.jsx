

// import React, { useEffect, useState } from "react";
// import { useJsApiLoader } from "@react-google-maps/api";
// import MapView from "./MapView";
// import LocationControls from "./LocationControls";
// import TouristPlacesList from "./TouristPlacesList";
// import UserProfile from "../User/UserProfile";

// const Home = () => {
//   const [currentLocation, setCurrentLocation] = useState(null);
//   const [mainCity, setMainCity] = useState("Fetching location...");
//   const [touristPlaces, setTouristPlaces] = useState([]);
//   const [selectedPlace, setSelectedPlace] = useState(null);
//   const [newLocation, setNewLocation] = useState("");
//   const [isChangingLocation, setIsChangingLocation] = useState(false);
//   const [zoomLevel, setZoomLevel] = useState(12);
//   const [mapType, setMapType] = useState("roadmap");
//   const [showAboutMe, setShowAboutMe] = useState(false); // State for "About Me" popup visibility

//   const { isLoaded } = useJsApiLoader({
//     googleMapsApiKey: "AIzaSyDIZ4wZgZyI7Zxbb4DPwnvDmQ6JFMyVum4", // Replace with your actual key
//   });

//   const fetchTouristPlacesFromServer = async (city) => {
//     try {
//       const response = await fetch(`http://localhost:5000/api/genai-places?city=${encodeURIComponent(city)}`);
//       const data = await response.json();
//       if (data.places) {
//         const placesWithCoordinates = await Promise.all(
//           data.places.map(async (placeName) => {
//             const geocodedLocation = await geocodePlace(placeName, city);
//             return {
//               name: placeName,
//               location: geocodedLocation || null,
//             };
//           })
//         );
//         setTouristPlaces(placesWithCoordinates.filter((place) => place.location !== null));
//       }
//     } catch (err) {
//       console.error("Error fetching tourist places:", err);
//     }
//   };

//   const geocodePlace = async (placeName, city) => {
//     try {
//       const response = await fetch(
//         `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
//           `${placeName}, ${city}`
//         )}&key=AIzaSyDIZ4wZgZyI7Zxbb4DPwnvDmQ6JFMyVum4`
//       );
//       const data = await response.json();
//       return data.results[0]?.geometry.location || null;
//     } catch (err) {
//       console.error(`Error geocoding ${placeName}:`, err);
//       return null;
//     }
//   };

//   const fetchIPLocation = async () => {
//     try {
//       const response = await fetch("https://ipapi.co/json/");
//       const data = await response.json();
//       const { latitude, longitude } = data;
//       if (latitude && longitude) {
//         setCurrentLocation({ lat: latitude, lng: longitude });
//         reverseGeocode(latitude, longitude);
//       } else {
//         console.error("Invalid IP location data");
//       }
//     } catch (err) {
//       console.error("Error fetching IP-based location:", err);
//     }
//   };

//   const reverseGeocode = async (lat, lng) => {
//     if (!lat || !lng) {
//       console.error("Invalid latitude or longitude for reverse geocoding");
//       return;
//     }

//     try {
//       const response = await fetch(
//         `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyDIZ4wZgZyI7Zxbb4DPwnvDmQ6JFMyVum4`
//       );
//       const data = await response.json();

//       if (data.status === "OK") {
//         const city = data.results.find((result) =>
//           result.types.includes("locality")
//         )?.address_components[0]?.long_name;

//         setMainCity(city || "Unknown");
//         if (city) fetchTouristPlacesFromServer(city);
//       } else {
//         console.error("Reverse geocoding error:", data.error_message || data.status);
//       }
//     } catch (err) {
//       console.error("Error reverse geocoding location:", err);
//     }
//   };

//   const updateLocation = async () => {
//     try {
//       const response = await fetch(
//         `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
//           newLocation
//         )}&key=AIzaSyDIZ4wZgZyI7Zxbb4DPwnvDmQ6JFMyVum4`
//       );
//       const data = await response.json();

//       if (data.status === "OK" && data.results.length > 0) {
//         const { lat, lng } = data.results[0].geometry.location;
//         setCurrentLocation({ lat, lng });
//         reverseGeocode(lat, lng);
//         setZoomLevel(15);
//       } else {
//         console.error("Error updating location:", data.error_message || data.status);
//       }
//     } catch (err) {
//       console.error("Error geocoding new location:", err);
//     }
//   };

//   useEffect(() => {
//     const fetchGeolocation = () => {
//       if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(
//           (position) => {
//             const { latitude, longitude } = position.coords;
//             setCurrentLocation({ lat: latitude, lng: longitude });
//             setZoomLevel(15);
//             reverseGeocode(latitude, longitude);
//           },
//           (error) => {
//             console.warn("Geolocation failed, using fallback:", error);
//             fetchIPLocation();
//           }
//         );
//       } else {
//         fetchIPLocation();
//       }
//     };

//     fetchGeolocation();
//   }, []);

//   if (!isLoaded) return <div>Loading Map...</div>;

//   return (
//     <div>
//       <h1>Welcome to the Tourism Map</h1>
//       <button onClick={() => setShowAboutMe(!showAboutMe)}>About Me</button>
//       <LocationControls
//         mainCity={mainCity}
//         isChangingLocation={isChangingLocation}
//         setIsChangingLocation={setIsChangingLocation}
//         newLocation={newLocation}
//         setNewLocation={setNewLocation}
//         updateLocation={updateLocation}
//       />
//       <MapView
//         currentLocation={currentLocation}
//         selectedPlace={selectedPlace}
//         touristPlaces={touristPlaces}
//         zoomLevel={zoomLevel}
//         mapType={mapType}
//         setSelectedPlace={setSelectedPlace}
//         setZoomLevel={setZoomLevel}
//         setMapType={setMapType}
//       />
//       <TouristPlacesList
//         touristPlaces={touristPlaces}
//         handleShowOnMap={(place) => {
//           setSelectedPlace(place);
//           setZoomLevel(18);
//           setMapType("satellite");
//         }}
//       />
//       {showAboutMe && (
//         <div className="user-profile-overlay">
//           <div className="user-profile-popup">
//             <UserProfile />
//             <button className="close-button" onClick={() => setShowAboutMe(false)}>
//               Close
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Home;



import React, { useEffect, useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import MapView from "./MapView";
import LocationControls from "./LocationControls";
import TouristPlacesList from "./TouristPlacesList";
import UserProfile from "../User/UserProfile";
import { reverseGeocode, fetchIPLocation, geocodeLocation } from "../utils/locationUtils";
import { fetchTouristPlacesFromServer } from "../utils/touristPlacesUtils";

const Home = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mainCity, setMainCity] = useState("Fetching location...");
  const [touristPlaces, setTouristPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [newLocation, setNewLocation] = useState("");
  const [isChangingLocation, setIsChangingLocation] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(12);
  const [mapType, setMapType] = useState("roadmap");
  const [showAboutMe, setShowAboutMe] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyDIZ4wZgZyI7Zxbb4DPwnvDmQ6JFMyVum4", // Replace with your actual key
  });

  const handleReverseGeocode = async (lat, lng) => {
    const city = await reverseGeocode(lat, lng, "AIzaSyDIZ4wZgZyI7Zxbb4DPwnvDmQ6JFMyVum4");
    setMainCity(city);
    if (city) {
      const places = await fetchTouristPlacesFromServer(city, "AIzaSyDIZ4wZgZyI7Zxbb4DPwnvDmQ6JFMyVum4");
      setTouristPlaces(places);
    }
  };

  const handleFetchIPLocation = async () => {
    const location = await fetchIPLocation();
    if (location) {
      setCurrentLocation(location);
      handleReverseGeocode(location.lat, location.lng);
    }
  };

  const handleUpdateLocation = async () => {
    const location = await geocodeLocation(newLocation, "AIzaSyDIZ4wZgZyI7Zxbb4DPwnvDmQ6JFMyVum4");
    if (location) {
      setCurrentLocation(location);
      handleReverseGeocode(location.lat, location.lng);
      setZoomLevel(15);
    }
  };

  useEffect(() => {
    const fetchGeolocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setCurrentLocation({ lat: latitude, lng: longitude });
            setZoomLevel(15);
            handleReverseGeocode(latitude, longitude);
          },
          (error) => {
            console.warn("Geolocation failed, using fallback:", error);
            handleFetchIPLocation();
          }
        );
      } else {
        handleFetchIPLocation();
      }
    };

    fetchGeolocation();
  }, []);

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <div>
      <h1>Welcome to the Tourism Map</h1>
      <button onClick={() => setShowAboutMe(!showAboutMe)}>About Me</button>
      <LocationControls
        mainCity={mainCity}
        isChangingLocation={isChangingLocation}
        setIsChangingLocation={setIsChangingLocation}
        newLocation={newLocation}
        setNewLocation={setNewLocation}
        updateLocation={handleUpdateLocation}
      />
      <MapView
        currentLocation={currentLocation}
        selectedPlace={selectedPlace}
        touristPlaces={touristPlaces}
        zoomLevel={zoomLevel}
        mapType={mapType}
        setSelectedPlace={setSelectedPlace}
        setZoomLevel={setZoomLevel}
        setMapType={setMapType}
      />
      <TouristPlacesList
        touristPlaces={touristPlaces}
        handleShowOnMap={(place) => {
          setSelectedPlace(place);
          setZoomLevel(18);
          setMapType("satellite");
        }}
      />
      {showAboutMe && (
        <div className="user-profile-overlay">
          <div className="user-profile-popup">
            <UserProfile />
            <button className="close-button" onClick={() => setShowAboutMe(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
